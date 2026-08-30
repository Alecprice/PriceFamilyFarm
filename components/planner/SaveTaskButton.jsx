'use client';
import { useState } from 'react';
import { uid } from '../../lib/planner/journeyEngine';
import { readPlan, writePlan } from '../../lib/planner/plannerStorage';

export default function SaveTaskButton({title,date,details='',category='General',className='',weatherSensitive=true,disabled=false}){
  const [state,setState]=useState('idle');
  const usable=Boolean(String(title||'').trim()&&date)&&!disabled;
  function save(){
    if(!usable)return;
    try{
      const cleanTitle=String(title).trim();
      const existing=readPlan();
      const same=(existing.customTasks||[]).some(t=>t.title.trim().toLowerCase()===cleanTitle.toLowerCase()&&t.date===date);
      if(!same) existing.customTasks=[...(existing.customTasks||[]),{id:uid('custom'),title:cleanTitle,date,details,category,weatherSensitive}];
      writePlan(existing,{forceBackup:!same});
      setState(same?'exists':'saved');
      window.dispatchEvent(new Event('pff-journey-updated'));
    }catch(e){console.error(e);setState('error');}
  }
  const label=state==='saved'?'Added to My Growing Journey':state==='exists'?'Already in My Growing Journey':state==='error'?'Could not save — try again':'Add to My Growing Journey';
  return <button type="button" className={className} onClick={save} disabled={!usable||state==='saved'||state==='exists'}>{label}</button>;
}
