import { emptyPlan } from './journeyEngine';

export const PLAN_KEY='pff.growingJourney.v1';
export const BACKUP_KEY='pff.growingJourney.backups.v1';
const MAX_BACKUPS=5;
const BACKUP_INTERVAL=15*60*1000;

function arr(value){return Array.isArray(value)?value:[];}
function obj(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}

export function normalizePlan(input){
  const base=emptyPlan();
  const x=obj(input);
  return {
    ...base,
    ...x,
    version:2,
    name:typeof x.name==='string'&&x.name.trim()?x.name:base.name,
    crops:arr(x.crops),
    beds:arr(x.beds),
    customTasks:arr(x.customTasks),
    completed:obj(x.completed),
    taskOverrides:obj(x.taskOverrides),
    notes:typeof x.notes==='string'?x.notes:'',
    location:x.location&&typeof x.location==='object'?x.location:null,
    createdAt:typeof x.createdAt==='string'?x.createdAt:base.createdAt,
    updatedAt:typeof x.updatedAt==='string'?x.updatedAt:null
  };
}

export function readPlan(){
  try{return normalizePlan(JSON.parse(localStorage.getItem(PLAN_KEY)||'null'));}
  catch{return emptyPlan();}
}

export function readBackups(){
  try{return arr(JSON.parse(localStorage.getItem(BACKUP_KEY)||'[]')).map(b=>({...b,plan:normalizePlan(b.plan)}));}
  catch{return [];}
}

export function writePlan(plan,{forceBackup=false}={}){
  const next={...normalizePlan(plan),updatedAt:new Date().toISOString()};
  const serialized=JSON.stringify(next);
  localStorage.setItem(PLAN_KEY,serialized);
  const backups=readBackups();
  const latest=backups[0];
  const latestTime=latest?.savedAt?new Date(latest.savedAt).getTime():0;
  const due=forceBackup||!latestTime||(Date.now()-latestTime)>=BACKUP_INTERVAL;
  if(due){
    const snapshot={savedAt:new Date().toISOString(),plan:next};
    localStorage.setItem(BACKUP_KEY,JSON.stringify([snapshot,...backups].slice(0,MAX_BACKUPS)));
  }
  return next;
}

export function restoreBackup(index=0){
  const backup=readBackups()[index];
  if(!backup)return null;
  return writePlan(backup.plan,{forceBackup:true});
}

export function validateImportedPlan(value){
  if(!value||typeof value!=='object')return {ok:false,error:'The file does not contain a plan object.'};
  if(!Array.isArray(value.crops)||!Array.isArray(value.customTasks))return {ok:false,error:'The file is missing required Growing Journey collections.'};
  if(value.beds!=null&&!Array.isArray(value.beds))return {ok:false,error:'Saved beds are not in the expected format.'};
  return {ok:true,plan:normalizePlan(value)};
}
