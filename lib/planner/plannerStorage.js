import { emptyPlan } from './journeyEngine';

export const PLAN_KEY='pff.growingJourney.v1';
export const BACKUP_KEY='pff.growingJourney.backups.v1';

export const MAX_PLAN_BYTES=750_000;
export const MAX_BACKUP_BYTES=4_000_000;

const MAX_BACKUPS=5;
const BACKUP_INTERVAL=15*60*1000;
const MAX_CROPS=250;
const MAX_BEDS=150;
const MAX_CUSTOM_TASKS=2_000;
const MAX_STATE_KEYS=10_000;
const MAX_NAME_LENGTH=200;
const MAX_NOTES_LENGTH=50_000;
const MAX_ZONES_PER_BED=24;

function arr(value){return Array.isArray(value)?value:[];}
function obj(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}
function isObject(value){return Boolean(value)&&typeof value==='object'&&!Array.isArray(value);}
function isText(value){return typeof value==='string';}

function isDate(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const parsed=new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(parsed.getTime())&&parsed.toISOString().slice(0,10)===value;
}

function isValidCropRecord(value){
  return isObject(value)
    && isText(value.id)
    && isText(value.cropId)
    && isDate(value.startDate)
    && (value.variety==null||isText(value.variety))
    && (value.method==null||isText(value.method))
    && (value.bedId==null||isText(value.bedId));
}

function isValidBedRecord(value){
  return isObject(value)
    && isText(value.id)
    && isText(value.name)
    && (value.zones==null
      || (
        Array.isArray(value.zones)
        && value.zones.length<=MAX_ZONES_PER_BED
        && value.zones.every(isObject)
      ));
}

function isValidTaskRecord(value){
  return isObject(value)
    && isText(value.id)
    && isText(value.title)
    && isDate(value.date)
    && (value.details==null||isText(value.details))
    && (value.category==null||isText(value.category))
    && (value.weatherSensitive==null||typeof value.weatherSensitive==='boolean');
}

function isValidOverride(value){
  return isObject(value)&&isDate(value.date);
}

function serializedLength(value){
  try{return JSON.stringify(value).length;}
  catch{return Infinity;}
}

export function isValidPlanShape(value){
  if(!isObject(value))return false;
  if(!Array.isArray(value.crops)||value.crops.length>MAX_CROPS)return false;
  if(!Array.isArray(value.beds)||value.beds.length>MAX_BEDS)return false;
  if(!Array.isArray(value.customTasks)||value.customTasks.length>MAX_CUSTOM_TASKS)return false;

  if(!value.crops.every(isValidCropRecord))return false;
  if(!value.beds.every(isValidBedRecord))return false;
  if(!value.customTasks.every(isValidTaskRecord))return false;

  if(!isObject(value.completed)||Object.keys(value.completed).length>MAX_STATE_KEYS)return false;
  if(!Object.values(value.completed).every((item)=>typeof item==='boolean'))return false;

  if(!isObject(value.taskOverrides)||Object.keys(value.taskOverrides).length>MAX_STATE_KEYS)return false;
  if(!Object.values(value.taskOverrides).every(isValidOverride))return false;

  if(value.name!=null&&(!isText(value.name)||value.name.length>MAX_NAME_LENGTH))return false;
  if(value.notes!=null&&(!isText(value.notes)||value.notes.length>MAX_NOTES_LENGTH))return false;
  if(value.location!=null&&!isObject(value.location))return false;

  return serializedLength(value)<=MAX_PLAN_BYTES;
}

export function isValidBackupCollection(value){
  return Array.isArray(value)
    && value.length<=MAX_BACKUPS
    && value.every((item)=>
      isObject(item)
      && isText(item.savedAt)
      && isValidPlanShape(item.plan)
    )
    && serializedLength(value)<=MAX_BACKUP_BYTES;
}

function cleanCompleted(value){
  return Object.fromEntries(
    Object.entries(obj(value))
      .filter(([key,item])=>Boolean(key)&&typeof item==='boolean')
      .slice(0,MAX_STATE_KEYS)
  );
}

function cleanOverrides(value){
  return Object.fromEntries(
    Object.entries(obj(value))
      .filter(([key,item])=>Boolean(key)&&isValidOverride(item))
      .slice(0,MAX_STATE_KEYS)
  );
}

export function normalizePlan(input){
  const base=emptyPlan();
  const x=obj(input);

  return {
    version:2,
    name:typeof x.name==='string'&&x.name.trim()
      ?x.name.slice(0,MAX_NAME_LENGTH)
      :base.name,
    crops:arr(x.crops).filter(isValidCropRecord).slice(0,MAX_CROPS),
    beds:arr(x.beds).filter(isValidBedRecord).slice(0,MAX_BEDS),
    customTasks:arr(x.customTasks).filter(isValidTaskRecord).slice(0,MAX_CUSTOM_TASKS),
    completed:cleanCompleted(x.completed),
    taskOverrides:cleanOverrides(x.taskOverrides),
    notes:typeof x.notes==='string'?x.notes.slice(0,MAX_NOTES_LENGTH):'',
    location:isObject(x.location)?x.location:null,
    createdAt:typeof x.createdAt==='string'?x.createdAt:base.createdAt,
    updatedAt:typeof x.updatedAt==='string'?x.updatedAt:null
  };
}

export function readPlan(){
  try{
    const raw=localStorage.getItem(PLAN_KEY);
    if(!raw)return emptyPlan();
    if(raw.length>MAX_PLAN_BYTES)return emptyPlan();
    return normalizePlan(JSON.parse(raw));
  }catch{
    return emptyPlan();
  }
}

export function readBackups(){
  try{
    const raw=localStorage.getItem(BACKUP_KEY)||'[]';
    if(raw.length>MAX_BACKUP_BYTES)return [];

    return arr(JSON.parse(raw))
      .filter((item)=>isObject(item)&&isText(item.savedAt)&&item.plan)
      .map((item)=>({...item,plan:normalizePlan(item.plan)}))
      .slice(0,MAX_BACKUPS);
  }catch{
    return [];
  }
}

export function writePlan(plan,{forceBackup=false}={}){
  const next={...normalizePlan(plan),updatedAt:new Date().toISOString()};

  if(serializedLength(next)>MAX_PLAN_BYTES){
    throw new Error('The Growing Journey plan exceeds the local safety size limit.');
  }

  const serialized=JSON.stringify(next);
  localStorage.setItem(PLAN_KEY,serialized);

  const backups=readBackups();
  const latest=backups[0];
  const latestTime=latest?.savedAt?new Date(latest.savedAt).getTime():0;
  const due=forceBackup||!latestTime||(Date.now()-latestTime)>=BACKUP_INTERVAL;

  if(due){
    const snapshot={savedAt:new Date().toISOString(),plan:next};
    const nextBackups=[snapshot,...backups].slice(0,MAX_BACKUPS);
    const backupRaw=JSON.stringify(nextBackups);

    if(backupRaw.length<=MAX_BACKUP_BYTES){
      localStorage.setItem(BACKUP_KEY,backupRaw);
    }
  }

  return next;
}

export function restoreBackup(index=0){
  const backup=readBackups()[index];
  if(!backup)return null;
  return writePlan(backup.plan,{forceBackup:true});
}

export function validateImportedPlan(value){
  if(!value||typeof value!=='object'||Array.isArray(value)){
    return {ok:false,error:'The file does not contain a plan object.'};
  }

  if(serializedLength(value)>MAX_PLAN_BYTES){
    return {ok:false,error:'That Growing Journey backup is larger than the allowed local safety limit.'};
  }

  if(!Array.isArray(value.crops)||!Array.isArray(value.customTasks)){
    return {ok:false,error:'The file is missing required Growing Journey collections.'};
  }

  if(!Array.isArray(value.beds)){
    return {ok:false,error:'Saved beds are not in the expected format.'};
  }

  if(value.crops.length>MAX_CROPS){
    return {ok:false,error:`A Growing Journey plan can contain at most ${MAX_CROPS} crops.`};
  }

  if(value.beds.length>MAX_BEDS){
    return {ok:false,error:`A Growing Journey plan can contain at most ${MAX_BEDS} saved beds.`};
  }

  if(value.customTasks.length>MAX_CUSTOM_TASKS){
    return {ok:false,error:`A Growing Journey plan can contain at most ${MAX_CUSTOM_TASKS} custom tasks.`};
  }

  if(!value.crops.every(isValidCropRecord)){
    return {ok:false,error:'One or more imported crop records are malformed.'};
  }

  if(!value.beds.every(isValidBedRecord)){
    return {ok:false,error:'One or more imported bed records are malformed.'};
  }

  if(!value.customTasks.every(isValidTaskRecord)){
    return {ok:false,error:'One or more imported custom tasks are malformed.'};
  }

  if(!isObject(value.completed)||!Object.values(value.completed).every((item)=>typeof item==='boolean')){
    return {ok:false,error:'Completion history is not in the expected format.'};
  }

  if(!isObject(value.taskOverrides)||!Object.values(value.taskOverrides).every(isValidOverride)){
    return {ok:false,error:'Task overrides are not in the expected format.'};
  }

  if(!isValidPlanShape(value)){
    return {ok:false,error:'The Growing Journey backup failed its local data-safety validation.'};
  }

  return {ok:true,plan:normalizePlan(value)};
}
