'use client';
import { useEffect, useState } from 'react';
import AddToCalendar, { downloadICS } from './AddToCalendar';
import SaveTaskButton from './SaveTaskButton';
import { YEAR_ROUND_MONTHS } from '../../lib/learn/yearRoundData';
import { uid } from '../../lib/planner/journeyEngine';
import { readPlan, writePlan } from '../../lib/planner/plannerStorage';
import styles from './Planner.module.css';

function targetDate(monthIndex, day=1){const now=new Date();let y=now.getFullYear();const d=new Date(y,monthIndex,day);if(d<new Date(now.getFullYear(),now.getMonth(),now.getDate()))y++;return `${y}-${String(monthIndex+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;}
export default function YearRoundCalendar(){
  const [month,setMonth]=useState(0);const [bulkSaved,setBulkSaved]=useState(false);useEffect(()=>setMonth(new Date().getMonth()),[]);const data=YEAR_ROUND_MONTHS[month];
  const events=data.reminders.map((r,i)=>({id:`year-round-${month}-${i}`,title:r,date:targetDate(month,Math.min(25,3+i*7)),details:`${data.month}: ${data.focus}. Use actual weather, soil condition and crop stage to adjust this planning date.`,category:'Year-round growing',weatherSensitive:true}));
  function saveAll(){try{const plan=readPlan();const existing=new Set((plan.customTasks||[]).map(t=>`${t.title}|${t.date}`));const additions=events.filter(e=>!existing.has(`${e.title}|${e.date}`)).map(e=>({...e,id:uid('custom')}));plan.customTasks=[...(plan.customTasks||[]),...additions];writePlan(plan,{forceBackup:true});window.dispatchEvent(new Event('pff-journey-updated'));setBulkSaved(true);}catch(e){console.error(e);}}
  return <section className={styles.panel}>
    <div className={styles.monthTabs} role="tablist" aria-label="Growing month">{YEAR_ROUND_MONTHS.map((m,i)=><button key={m.month} id={`month-tab-${i}`} role="tab" type="button" onClick={()=>{setMonth(i);setBulkSaved(false)}} className={i===month?styles.activeTab:''} aria-selected={i===month} aria-controls="year-round-month-panel" tabIndex={i===month?0:-1}>{m.month.slice(0,3)}</button>)}</div>
    <div className={styles.monthCard} id="year-round-month-panel" role="tabpanel" aria-labelledby={`month-tab-${month}`}><div><span className={styles.eyebrow}>{data.month}</span><h2>{data.focus}</h2></div>
      <div className={styles.threeCol}><div><h3>Outside</h3><ul>{data.outdoor.map(x=><li key={x}>{x}</li>)}</ul></div><div><h3>Indoor / starts</h3><ul>{data.indoor.map(x=><li key={x}>{x}</li>)}</ul></div><div><h3>Protected culture</h3><ul>{data.protected.map(x=><li key={x}>{x}</li>)}</ul></div></div>
      <div className={styles.forecastHeader}><div><h3>Turn this month into actions</h3><p className={styles.sourceNote}>These are planning anchors. Adjust each date for your crop stage, property and forecast.</p></div><div className={styles.inlineActions}><button type="button" className={styles.secondaryButton} onClick={saveAll} disabled={bulkSaved}>{bulkSaved?'Month added to My Journey':'Add month to My Journey'}</button><button type="button" className={styles.primaryButton} onClick={()=>downloadICS(events,`price-family-farm-${data.month.toLowerCase()}-growing.ics`,1)}>Month to calendar</button></div></div>
      <div className={styles.reminderList}>{events.map(e=><div className={styles.reminderRow} key={e.title}><div><strong>{e.title}</strong><span>Planning date {new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric'}).format(new Date(`${e.date}T12:00:00`))}</span></div><div className={styles.inlineActions}><SaveTaskButton title={e.title} date={e.date} details={e.details} category={e.category} className={styles.smallButton}/><AddToCalendar title={e.title} date={e.date} details={e.details} className={styles.smallButton} label="Calendar"/></div></div>)}</div>
    </div>
  </section>;
}
