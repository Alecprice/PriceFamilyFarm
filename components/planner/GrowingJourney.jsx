'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import AddToCalendar, { downloadICS } from './AddToCalendar';
import { JOURNEY_CROPS, JOURNEY_METHODS, getJourneyCrop } from '../../lib/planner/cropJourneyData';
import { allJourneyTasks, emptyPlan, taskBucket, todayISO, uid } from '../../lib/planner/journeyEngine';
import { MAX_PLAN_BYTES, readBackups, readPlan, validateImportedPlan, writePlan } from '../../lib/planner/plannerStorage';
import styles from './Planner.module.css';

const fmt=d=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(new Date(`${d}T12:00:00`));
const BUCKETS=[['overdue','Overdue'],['today','Today'],['week','Next 7 days'],['month','Next 30 days'],['later','Later']];
function saveFile(plan){const payload={...plan,exportedAt:new Date().toISOString()};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='price-family-farm-growing-journey.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),800);}

export default function GrowingJourney(){
  const [plan,setPlan]=useState(emptyPlan);
  const [ready,setReady]=useState(false);
  const [saveStatus,setSaveStatus]=useState('');
  const [backups,setBackups]=useState([]);
  const [backupChoice,setBackupChoice]=useState('0');
  const fileRef=useRef(null);
  const [draft,setDraft]=useState({cropId:'tomatoes',variety:'',method:'indoor',startDate:todayISO(),successions:1,successionInterval:14,bedId:''});
  const [custom,setCustom]=useState({title:'',date:todayISO(),details:'',category:'General',weatherSensitive:true});
  const [filter,setFilter]=useState('open');
  const [query,setQuery]=useState('');
  const [category,setCategory]=useState('all');

  useEffect(()=>{
    setPlan(readPlan());setBackups(readBackups());setReady(true);
    const fn=()=>setPlan(readPlan());window.addEventListener('pff-journey-updated',fn);return()=>window.removeEventListener('pff-journey-updated',fn);
  },[]);
  useEffect(()=>{
    if(!ready)return;
    setSaveStatus('Saving…');
    const timer=setTimeout(()=>{try{writePlan(plan);setBackups(readBackups());setSaveStatus('Saved on this device');}catch{setSaveStatus('Could not save locally');}},350);
    return()=>clearTimeout(timer);
  },[plan,ready]);

  const crop=getJourneyCrop(draft.cropId);
  useEffect(()=>{
    if(crop && !crop.methods.includes(draft.method)){
      setDraft(d=>({
        ...d,
        method:crop.methods[0],
        successionInterval:crop.succession||14
      }));
    }
  },[crop,draft.method]);
  const tasks=useMemo(()=>allJourneyTasks(plan),[plan]);
  const openTasks=tasks.filter(t=>!plan.completed?.[t.id]);
  const statusFiltered=filter==='all'?tasks:filter==='done'?tasks.filter(t=>plan.completed?.[t.id]):openTasks;
  const categories=useMemo(()=>[...new Set(tasks.map(t=>t.category).filter(Boolean))].sort(),[tasks]);
  const visible=statusFiltered.filter(t=>{
    const hay=`${t.title} ${t.details||''} ${t.cropName||''}`.toLowerCase();
    return (!query.trim()||hay.includes(query.trim().toLowerCase()))&&(category==='all'||t.category===category);
  });
  const bucketCounts=Object.fromEntries(BUCKETS.map(([b])=>[b,openTasks.filter(t=>taskBucket(t.date)===b).length]));
  const counts={open:openTasks.length,done:tasks.length-openTasks.length,crops:plan.crops.length,beds:plan.beds.length};
  const progress=tasks.length?Math.round((counts.done/tasks.length)*100):0;
  const nextTask=openTasks[0]||null;
  const next30=openTasks.filter(t=>['overdue','today','week','month'].includes(taskBucket(t.date)));

  function addCrop(e){e.preventDefault();if(!draft.startDate)return;setPlan(p=>({...p,crops:[...p.crops,{...draft,id:uid('crop'),successions:Number(draft.successions)||1,successionInterval:Number(draft.successionInterval)||crop?.succession||14}]}));}
  function removeCrop(id){if(!window.confirm('Remove this crop and its generated task history from this plan?'))return;setPlan(p=>{const completed=Object.fromEntries(Object.entries(p.completed||{}).filter(([k])=>!k.startsWith(`${id}-`)));const taskOverrides=Object.fromEntries(Object.entries(p.taskOverrides||{}).filter(([k])=>!k.startsWith(`${id}-`)));return {...p,crops:p.crops.filter(c=>c.id!==id),completed,taskOverrides};});}
  function updateCrop(id,patch){setPlan(p=>({...p,crops:p.crops.map(c=>c.id===id?{...c,...patch}:c)}));}
  function removeBed(id){if(!window.confirm('Remove this saved bed layout? Crops assigned to it will become unassigned.'))return;setPlan(p=>({...p,beds:p.beds.filter(b=>b.id!==id),crops:p.crops.map(c=>c.bedId===id?{...c,bedId:''}:c)}));}
  function removeCustom(id){setPlan(p=>({...p,customTasks:p.customTasks.filter(t=>t.id!==id),completed:Object.fromEntries(Object.entries(p.completed||{}).filter(([k])=>k!==id)),taskOverrides:Object.fromEntries(Object.entries(p.taskOverrides||{}).filter(([k])=>k!==id))}));}
  function resetTaskDate(id){setPlan(p=>{const next={...(p.taskOverrides||{})};delete next[id];return {...p,taskOverrides:next};});}
  function moveTaskDate(id,date){setPlan(p=>({...p,taskOverrides:{...(p.taskOverrides||{}),[id]:{...(p.taskOverrides?.[id]||{}),date}}}));}
  function toggleTask(id){setPlan(p=>{const next={...(p.completed||{})};if(next[id])delete next[id];else next[id]=true;return {...p,completed:next};});}
  function addCustom(e){e.preventDefault();if(!custom.title.trim()||!custom.date)return;setPlan(p=>({...p,customTasks:[...p.customTasks,{...custom,title:custom.title.trim(),id:uid('custom')}]}));setCustom(c=>({...c,title:'',details:''}));}
  function importPlan(e){const file=e.target.files?.[0];if(!file)return;if(file.size>MAX_PLAN_BYTES){window.alert('That Growing Journey backup is larger than the allowed local safety limit.');e.target.value='';return;}const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(reader.result);const result=validateImportedPlan(parsed);if(!result.ok)throw new Error(result.error);if(!window.confirm('Replace the current local plan with this imported backup? A recovery snapshot of the current plan will be kept.'))return;writePlan(plan,{forceBackup:true});setPlan(result.plan);writePlan(result.plan,{forceBackup:true});setBackups(readBackups());setBackupChoice('0');setSaveStatus('Imported and saved');}catch(err){window.alert(err.message||'That file is not a valid Price Family Farm Growing Journey export.');}};reader.readAsText(file);e.target.value='';}
  function restore(){const index=Math.max(0,Number(backupChoice)||0);const target=backups[index];if(!target)return;const stamp=new Intl.DateTimeFormat('en-US',{dateStyle:'medium',timeStyle:'short'}).format(new Date(target.savedAt));if(!window.confirm(`Restore the local recovery snapshot from ${stamp}? The current plan will be saved as another recovery snapshot first.`))return;writePlan(plan,{forceBackup:true});const restored=writePlan(target.plan,{forceBackup:true});setPlan(restored);setBackups(readBackups());setBackupChoice('0');setSaveStatus('Recovery snapshot restored');}
  function reset(){if(window.confirm('Clear crops, beds, tasks and completion history stored on this device? A recovery snapshot will be kept first.')){writePlan(plan,{forceBackup:true});const blank=emptyPlan();setPlan(blank);writePlan(blank,{forceBackup:true});setBackups(readBackups());setBackupChoice('0');}}
  function exportPlan(){writePlan(plan,{forceBackup:true});setBackups(readBackups());setBackupChoice('0');saveFile(plan);setSaveStatus('Backup downloaded');}

  if(!ready)return <div className={styles.loading} role="status">Opening your locally saved growing journey…</div>;
  return <div className={styles.journeyStack}>
    <section className={`${styles.panel} ${styles.todayPanel}`} aria-labelledby="journey-today">
      <div className={styles.forecastHeader}><div><span className={styles.eyebrow}>Your next actions</span><h2 id="journey-today">Today in the growing journey</h2></div><span className={styles.saveStatus} aria-live="polite">{saveStatus}</span></div>
      <div className={styles.todayGrid}>
        <div className={bucketCounts.overdue?styles.priorityDanger:styles.priorityCard}><strong>{bucketCounts.overdue}</strong><span>overdue</span></div>
        <div className={bucketCounts.today?styles.priorityNow:styles.priorityCard}><strong>{bucketCounts.today}</strong><span>due today</span></div>
        <div className={styles.priorityCard}><strong>{bucketCounts.week}</strong><span>next 7 days</span></div>
        <div className={styles.priorityCard}><strong>{progress}%</strong><span>tasks complete</span></div>
      </div>
      {nextTask?<div className={styles.nextAction}><div><span className={styles.confidence}>Next open task</span><strong>{nextTask.title}</strong><p>{fmt(nextTask.date)} • {nextTask.category}{nextTask.bedId?` • ${plan.beds.find(b=>b.id===nextTask.bedId)?.name||'Bed'}`:''}</p></div><div className={styles.inlineActions}><button className={styles.primaryButton} onClick={()=>toggleTask(nextTask.id)}>Mark complete</button><AddToCalendar className={styles.secondaryButton} title={nextTask.title} date={nextTask.date} details={nextTask.details} label="Calendar"/></div></div>:<div className={styles.emptyState}>No open tasks yet. Add a crop or save a follow-up from Learn.</div>}
      <div className={styles.inlineActions}><a href="#action-calendar" className={styles.textLink}>Open full task list ↓</a><a href="#add-crop" className={styles.textLink}>Add another crop ↓</a><Link href="/weather" className={styles.textLink}>Check weather →</Link></div>
    </section>

    <section className={styles.panel}>
      <div className={styles.forecastHeader}><div><span className={styles.eyebrow}>Local to this device</span><h2>{plan.name}</h2></div><div className={styles.inlineActions}><button className={styles.secondaryButton} onClick={exportPlan}>Export backup</button><button className={styles.secondaryButton} onClick={()=>fileRef.current?.click()}>Import backup</button><input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={importPlan}/>{backups.length>0&&<><label className={styles.recoveryPicker}><span>Recovery snapshot</span><select value={backupChoice} onChange={e=>setBackupChoice(e.target.value)} aria-label="Choose a recovery snapshot">{backups.map((b,i)=><option key={`${b.savedAt}-${i}`} value={i}>{new Intl.DateTimeFormat('en-US',{dateStyle:'short',timeStyle:'short'}).format(new Date(b.savedAt))}</option>)}</select></label><button className={styles.secondaryButton} onClick={restore}>Restore selected</button></>}<button className={styles.secondaryButton} onClick={()=>window.print()}>Print</button><button className={styles.dangerButton} onClick={reset}>Reset</button></div></div>
      <div className={styles.formGrid}><label className={styles.field}><span>Plan name</span><input value={plan.name} onChange={e=>setPlan(p=>({...p,name:e.target.value}))}/></label><label className={`${styles.field} ${styles.fieldWide}`}><span>Season notes</span><textarea value={plan.notes||''} onChange={e=>setPlan(p=>({...p,notes:e.target.value}))} placeholder="Record what worked, unusual weather, varieties to repeat, soil observations…" rows="2"/></label></div>
      <div className={styles.statGrid}><div><strong>{counts.crops}</strong><span>planned crops</span></div><div><strong>{counts.open}</strong><span>open tasks</span></div><div><strong>{counts.done}</strong><span>completed</span></div><div><strong>{counts.beds}</strong><span>saved beds</span></div></div>
      {plan.location?.label&&<p className={styles.locationLine}><strong>Saved planning location:</strong> {plan.location.label} <Link href="/weather">check current conditions</Link></p>}<p className={styles.sourceNote}>Stored privately in this browser. v5 also keeps up to five rolling local recovery snapshots, but browser/site data can still be cleared by the user or device. Export JSON for a durable cross-device backup.</p>
    </section>

    <section className={styles.panel} id="add-crop">
      <div className={styles.forecastHeader}><div><span className={styles.eyebrow}>Crop → stages → reminders</span><h2>Add a crop to your journey</h2></div><Link href="/learn/garden-layout-builder" className={styles.textLink}>Design a bed first →</Link></div>
      <form className={styles.formGrid} onSubmit={addCrop}>
        <label className={styles.field}><span>Crop</span><select value={draft.cropId} onChange={e=>setDraft(d=>({...d,cropId:e.target.value}))}>{JOURNEY_CROPS.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className={styles.field}><span>Variety (optional)</span><input value={draft.variety} onChange={e=>setDraft(d=>({...d,variety:e.target.value}))} placeholder="e.g. Cherokee Purple"/></label>
        <label className={styles.field}><span>Starting method</span><select value={draft.method} onChange={e=>setDraft(d=>({...d,method:e.target.value}))}>{JOURNEY_METHODS.filter(m=>crop?.methods.includes(m.id)).map(m=><option key={m.id} value={m.id}>{m.label}</option>)}</select></label>
        <label className={styles.field}><span>{draft.method==='indoor'?'Indoor sow date':draft.method==='transplant'?'Transplant date':'Direct-sow date'}</span><input type="date" value={draft.startDate} onChange={e=>setDraft(d=>({...d,startDate:e.target.value}))}/></label>
        <label className={styles.field}><span>Succession rounds</span><select value={draft.successions} onChange={e=>setDraft(d=>({...d,successions:e.target.value}))}>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
        <label className={styles.field}><span>Days between rounds</span><input type="number" min="1" max="60" inputMode="numeric" value={draft.successionInterval} onChange={e=>setDraft(d=>({...d,successionInterval:e.target.value}))}/></label>
        <label className={styles.field}><span>Bed (optional)</span><select value={draft.bedId} onChange={e=>setDraft(d=>({...d,bedId:e.target.value}))}><option value="">Not assigned</option>{plan.beds.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
        <div className={styles.formAction}><button className={styles.primaryButton}>Generate crop journey</button></div>
      </form>
      {crop&&<div className={styles.cropHint}><strong>{crop.name}:</strong> about {crop.spacing} in spacing • ~{crop.maturity} days-to-maturity planning value • {crop.season}-season • {crop.notes}</div>}
    </section>

    {plan.crops.length>0&&<section className={styles.panel}><h2>Your planned crops</h2><div className={styles.taskGrid}>{plan.crops.map(e=>{const c=getJourneyCrop(e.cropId);return <article key={e.id} className={styles.taskCard}><span className={styles.confidence}>{e.method==='indoor'?'Indoor start':e.method==='direct'?'Direct sow':'Transplant'}</span><h3>{c?.name}{e.variety?` — ${e.variety}`:''}</h3><div className={styles.miniForm}><label className={styles.field}><span>Anchor date</span><input type="date" value={e.startDate} onChange={x=>updateCrop(e.id,{startDate:x.target.value})}/></label><label className={styles.field}><span>Assigned bed</span><select value={e.bedId||''} onChange={x=>updateCrop(e.id,{bedId:x.target.value})}><option value="">Not assigned</option>{plan.beds.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label></div><p>{Number(e.successions)>1?`${e.successions} rounds every ${e.successionInterval} days`:'Single planting round'}</p><button className={styles.smallButton} onClick={()=>removeCrop(e.id)}>Remove crop</button></article>})}</div></section>}

    {plan.beds.length>0&&<section className={styles.panel}><div className={styles.forecastHeader}><div><span className={styles.eyebrow}>Saved layouts</span><h2>Your beds</h2></div><Link href="/learn/garden-layout-builder" className={styles.textLink}>Build another bed →</Link></div><div className={styles.taskGrid}>{plan.beds.map(b=><article className={styles.taskCard} key={b.id}><h3>{b.name}</h3><p>{b.width} × {b.length} ft • {b.bedType}</p><p><strong>Crop zones:</strong> {(b.zones||[]).map(z=>`${z.crop} (~${z.plantCount})`).join(' • ')||'No zones saved'}</p><button className={styles.smallButton} onClick={()=>removeBed(b.id)}>Remove bed</button></article>)}</div></section>}

    <section className={styles.panel} id="action-calendar">
      <div className={styles.forecastHeader}><div><span className={styles.eyebrow}>Action calendar</span><h2>What comes next</h2></div><div className={styles.inlineActions}><button className={filter==='open'?styles.activeSmall:styles.smallButton} onClick={()=>setFilter('open')}>Open</button><button className={filter==='done'?styles.activeSmall:styles.smallButton} onClick={()=>setFilter('done')}>Done</button><button className={filter==='all'?styles.activeSmall:styles.smallButton} onClick={()=>setFilter('all')}>All</button></div></div>
      {tasks.length>0&&<div className={styles.taskToolbar}><label className={styles.field}><span>Search tasks</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Crop, task, note…"/></label><label className={styles.field}><span>Category</span><select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">All categories</option>{categories.map(x=><option key={x}>{x}</option>)}</select></label><div className={styles.calendarActions}><button className={styles.secondaryButton} disabled={!next30.length} onClick={()=>downloadICS(next30,'growing-journey-next-30-days.ics',1)}>Next 30 days to calendar</button><button className={styles.primaryButton} disabled={!openTasks.length} onClick={()=>downloadICS(openTasks,'my-growing-journey.ics',1)}>All open tasks to calendar</button></div></div>}
      {!tasks.length?<div className={styles.emptyState}>Add a crop above or save an action from another Learn page. Your timeline will appear here.</div>:visible.length===0?<div className={styles.emptyState}>No tasks match these filters.</div>:BUCKETS.map(([bucket,label])=>{const group=visible.filter(t=>taskBucket(t.date)===bucket);if(!group.length)return null;return <div key={bucket} className={styles.taskSection}><h3>{label}</h3><div className={styles.taskList}>{group.map(t=>{const done=!!plan.completed?.[t.id];return <article className={`${styles.timelineTask} ${done?styles.taskDone:''}`} key={t.id}><button className={styles.checkButton} aria-label={done?'Mark task not complete':'Mark task complete'} aria-pressed={done} onClick={()=>toggleTask(t.id)}>{done?'✓':'○'}</button><div className={styles.taskMain}><div className={styles.taskTop}><strong>{t.title}</strong><time dateTime={t.date}>{fmt(t.date)}</time></div><p>{t.details}</p><div className={styles.taskMeta}><span>{t.category}</span>{t.weatherSensitive&&<span>Weather-sensitive</span>}{t.bedId&&<span>{plan.beds.find(b=>b.id===t.bedId)?.name||'Bed'}</span>}{t.dateAdjusted&&<span>Adjusted from {fmt(t.originalDate)}</span>}</div><div className={styles.taskEditRow}><label><span className={styles.srOnly}>Move {t.title} to another date</span><input type="date" value={t.date} onChange={e=>moveTaskDate(t.id,e.target.value)} aria-label={`Move ${t.title} to another date`}/></label><div className={styles.inlineActions}>{t.dateAdjusted&&<button className={styles.microButton} onClick={()=>resetTaskDate(t.id)}>Reset generated date</button>}{t.custom&&<button className={styles.microButton} onClick={()=>removeCustom(t.id)}>Delete custom task</button>}</div></div></div><AddToCalendar className={styles.iconButton} title={t.title} date={t.date} details={t.details} label="Calendar"/></article>})}</div></div>})}
    </section>

    <section className={styles.panel} id="custom-task"><h2>Add your own task</h2><form className={styles.formGrid} onSubmit={addCustom}><label className={styles.field}><span>Task</span><input value={custom.title} onChange={e=>setCustom(c=>({...c,title:e.target.value}))} placeholder="e.g. Soil test north bed"/></label><label className={styles.field}><span>Date</span><input type="date" value={custom.date} onChange={e=>setCustom(c=>({...c,date:e.target.value}))}/></label><label className={styles.field}><span>Category</span><select value={custom.category} onChange={e=>setCustom(c=>({...c,category:e.target.value}))}>{['General','Planting','Protection','Water','Soil','Pest & disease','Harvest','Greenhouse','Preservation'].map(x=><option key={x}>{x}</option>)}</select></label><label className={`${styles.field} ${styles.fieldWide}`}><span>Notes</span><textarea value={custom.details} onChange={e=>setCustom(c=>({...c,details:e.target.value}))} rows="3"/></label><label className={styles.checkField}><input type="checkbox" checked={custom.weatherSensitive} onChange={e=>setCustom(c=>({...c,weatherSensitive:e.target.checked}))}/><span>Weather-sensitive task</span></label><div className={styles.formAction}><button className={styles.primaryButton}>Add task</button></div></form></section>
  </div>;
}
