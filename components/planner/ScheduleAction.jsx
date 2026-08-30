'use client';
import { useState } from 'react';
import AddToCalendar from './AddToCalendar';
import SaveTaskButton from './SaveTaskButton';
import styles from './Planner.module.css';

export default function ScheduleAction({defaultTitle='Garden follow-up',details='',category='Learn'}){
  const [title,setTitle]=useState(defaultTitle);
  const [date,setDate]=useState('');
  const ready=Boolean(title.trim()&&date);
  return <details className={styles.scheduleAction}>
    <summary>Schedule a follow-up</summary>
    <div className={styles.scheduleBody}>
      <label className={styles.field}><span>What do you want to remember?</span><input value={title} onChange={e=>setTitle(e.target.value)} /></label>
      <label className={styles.field}><span>Target date</span><input type="date" value={date} onChange={e=>setDate(e.target.value)} /></label>
      <div className={styles.inlineActions}>
        <SaveTaskButton title={title.trim()} date={date} details={details} category={category} className={styles.smallButton}/>
        <AddToCalendar title={title.trim()} date={date} details={details} className={styles.smallButton} label="Add to device calendar" disabled={!ready}/>
      </div>
      {!ready&&<p className={styles.sourceNote}>Choose a target date before saving. The site will not invent a date from the day you happened to read this lesson.</p>}
      {ready&&<p className={styles.sourceNote}>Use the date that fits your own crop stage and property. Weather-sensitive work can be checked later in My Growing Journey.</p>}
    </div>
  </details>;
}
