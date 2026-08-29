'use client';
import { useState } from 'react';

function esc(value='') { return String(value).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;'); }
function pad(n){ return String(n).padStart(2,'0'); }
function asICSDate(date){ const d=new Date(`${String(date).slice(0,10)}T12:00:00`); return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`; }
function safeName(value='farm-reminder'){ return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'farm-reminder'; }
function foldLine(line){if(line.length<=74)return [line];const out=[];let s=line;while(s.length>74){out.push(s.slice(0,74));s=' '+s.slice(74);}out.push(s);return out;}

export function buildICS(events=[], alarmDays=1){
  const now=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
  const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Price Family Farm//Growing Planner//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
  events.forEach((event,index)=>{
    const start=asICSDate(event.date); const next=new Date(`${event.date}T12:00:00`); next.setDate(next.getDate()+1); const end=asICSDate(next.toISOString().slice(0,10));
    const uid=event.id||`${start}-${safeName(event.title)}-${index}`;
    const eventLines=['BEGIN:VEVENT',`UID:${esc(uid)}@price-family-farm`,`DTSTAMP:${now}`,`DTSTART;VALUE=DATE:${start}`,`DTEND;VALUE=DATE:${end}`,`SUMMARY:${esc(event.title)}`,`DESCRIPTION:${esc(event.details||'')}`];
    if(event.location) eventLines.push(`LOCATION:${esc(event.location)}`);
    if(Number(alarmDays)>=0) eventLines.push('BEGIN:VALARM',`TRIGGER:-P${Math.max(0,Number(alarmDays))}D`,'ACTION:DISPLAY',`DESCRIPTION:${esc(event.title)}`,'END:VALARM');
    eventLines.push('END:VEVENT');
    eventLines.flatMap(foldLine).forEach(x=>lines.push(x));
  });
  lines.push('END:VCALENDAR'); return lines.join('\r\n');
}

export function downloadICS(events, filename='growing-journey.ics', alarmDays=1){
  if(!events?.length) return false;
  const blob=new Blob([buildICS(events,alarmDays)],{type:'text/calendar;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);return true;
}

export default function AddToCalendar({ title, date, details='', location='', className='', label='Add reminder to device calendar', alarmDays=1, disabled=false }) {
  const [done,setDone]=useState(false);
  const usable=Boolean(String(title||'').trim()&&date)&&!disabled;
  function add(){if(!usable)return;if(downloadICS([{title:String(title).trim(),date,details,location}],`${safeName(title)}.ics`,alarmDays)){setDone(true);setTimeout(()=>setDone(false),2200);}}
  return <button type="button" onClick={add} className={className} aria-live="polite" disabled={!usable}>{done?'Calendar file created':label}</button>;
}
