BEGIN;

-- Serialize writes by farm/document key before row lookup. The v1 function used
-- SELECT ... FOR UPDATE, which cannot lock a row that does not exist yet; two
-- first-time writers could therefore race into the unique index. This advisory
-- transaction lock makes the second writer re-check after the first commits and
-- receive the normal revision conflict response instead of a unique violation.
CREATE OR REPLACE FUNCTION public.pff_put_document(
  p_document_key text,
  p_payload jsonb,
  p_schema_version integer,
  p_expected_revision bigint,
  p_checksum text,
  p_source_device_key text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_farm_id uuid;
  v_doc public.farm_documents%ROWTYPE;
BEGIN
  IF p_document_key IS NULL
    OR length(trim(p_document_key)) = 0
    OR length(p_document_key) > 200
  THEN
    RAISE EXCEPTION 'invalid_document_key';
  END IF;

  IF p_schema_version IS NULL OR p_schema_version < 1 THEN
    RAISE EXCEPTION 'invalid_schema_version';
  END IF;

  IF octet_length(p_payload::text) > 5000000 THEN
    RAISE EXCEPTION 'payload_too_large';
  END IF;

  SELECT id
    INTO v_farm_id
    FROM public.farm_spaces
   WHERE owner_subject = 'single-user'
   LIMIT 1;

  IF v_farm_id IS NULL THEN
    RAISE EXCEPTION 'farm_space_missing';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtext(v_farm_id::text),
    hashtext(p_document_key)
  );

  SELECT *
    INTO v_doc
    FROM public.farm_documents
   WHERE farm_id = v_farm_id
     AND document_key = p_document_key
   FOR UPDATE;

  IF NOT FOUND THEN
    IF COALESCE(p_expected_revision, 0) <> 0 THEN
      INSERT INTO public.farm_sync_events (
        farm_id, document_key, action,
        client_revision, server_revision, source_device_key
      )
      VALUES (
        v_farm_id, p_document_key, 'conflict',
        p_expected_revision, 0, p_source_device_key
      );

      RETURN jsonb_build_object(
        'status', 'conflict',
        'revision', 0
      );
    END IF;

    INSERT INTO public.farm_documents (
      farm_id, document_key, schema_version, revision,
      payload, checksum, source_device_key
    )
    VALUES (
      v_farm_id, p_document_key, p_schema_version, 1,
      p_payload, p_checksum, p_source_device_key
    )
    RETURNING * INTO v_doc;

    INSERT INTO public.farm_sync_events (
      farm_id, document_key, action,
      client_revision, server_revision, source_device_key
    )
    VALUES (
      v_farm_id, p_document_key, 'create',
      0, 1, p_source_device_key
    );

    RETURN jsonb_build_object(
      'status', 'ok',
      'revision', v_doc.revision,
      'updatedAt', v_doc.updated_at
    );
  END IF;

  IF p_expected_revision IS NULL
    OR p_expected_revision <> v_doc.revision
  THEN
    INSERT INTO public.farm_sync_events (
      farm_id, document_key, action,
      client_revision, server_revision, source_device_key
    )
    VALUES (
      v_farm_id, p_document_key, 'conflict',
      p_expected_revision, v_doc.revision, p_source_device_key
    );

    RETURN jsonb_build_object(
      'status', 'conflict',
      'revision', v_doc.revision,
      'schemaVersion', v_doc.schema_version,
      'payload', v_doc.payload,
      'checksum', v_doc.checksum,
      'updatedAt', v_doc.updated_at
    );
  END IF;

  INSERT INTO public.farm_document_versions (
    document_id, revision, payload, checksum, source_device_key
  )
  VALUES (
    v_doc.id, v_doc.revision, v_doc.payload,
    v_doc.checksum, v_doc.source_device_key
  )
  ON CONFLICT (document_id, revision) DO NOTHING;

  UPDATE public.farm_documents
     SET schema_version = p_schema_version,
         revision = revision + 1,
         payload = p_payload,
         checksum = p_checksum,
         source_device_key = p_source_device_key,
         updated_at = now()
   WHERE id = v_doc.id
  RETURNING * INTO v_doc;

  INSERT INTO public.farm_sync_events (
    farm_id, document_key, action,
    client_revision, server_revision, source_device_key
  )
  VALUES (
    v_farm_id, p_document_key, 'update',
    p_expected_revision, v_doc.revision, p_source_device_key
  );

  RETURN jsonb_build_object(
    'status', 'ok',
    'revision', v_doc.revision,
    'updatedAt', v_doc.updated_at
  );
END;
$$;

INSERT INTO public.pff_meta (key, value)
VALUES (
  'schema',
  jsonb_build_object(
    'name', 'price-family-farm-cloud-sync',
    'version', 2,
    'projectId', 'small-water-25690282'
  )
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = now();

COMMIT;
