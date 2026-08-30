import { sourcesFor } from "../../lib/learn/sources";
import styles from "./LearnLibrary.module.css";

export default function SourceLinks({ sourceKeys = [] }) {
  const sources = sourcesFor(sourceKeys);
  if (!sources.length) return null;

  return (
    <div className={styles.learnSources}>
      <strong>Sources</strong>
      <ul>
        {sources.map((source) => (
          <li key={source.key}>
            <a href={source.url} target="_blank" rel="noreferrer">
              {source.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
