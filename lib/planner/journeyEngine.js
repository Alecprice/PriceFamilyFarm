import { getJourneyCrop } from './cropJourneyData';

const DAY=86400000;
export function dateAdd(date, days){
  const d=new Date(`${date}T12:00:00`); d.setDate(d.getDate()+Number(days||0)); return d.toISOString().slice(0,10);
}
export function uid(prefix='item'){ return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`; }
export function todayISO(){ const d=new Date(); d.setMinutes(d.getMinutes()-d.getTimezoneOffset()); return d.toISOString().slice(0,10); }

function stage(id,title,offset,category,details,weatherSensitive=true){return {id,title,offset,category,details,weatherSensitive};}
function genericStages(crop, method){
  const warm=crop.season==='warm';
  if(method==='indoor'){
    const tx=crop.transplant||42;
    return [
      stage('sow','Start seed indoors',0,'Planting','Use clean media, adequate light, bottom watering when practical, and label the cultivar.',false),
      stage('germination','Check emergence and light',7,'Planting','Move emerged seedlings into strong light and keep airflow gentle.',false),
      stage('thin','Thin / select strongest seedlings',14,'Planting','Reduce crowding before roots and leaves compete heavily.',false),
      stage('pot-up','Pot up if roots need more room',Math.max(21,tx-18),'Planting','Pot up only when the root system and remaining indoor time justify it.',false),
      stage('harden','Begin hardening off',Math.max(0,tx-7),'Protection','Gradually increase outdoor exposure; avoid an abrupt jump into cold, wind or intense sun.',true),
      stage('transplant','Transplant outdoors',tx,'Planting',warm?'Use soil and forecast conditions—not a calendar date alone—for this tender crop.':'Choose workable soil and a suitable cool-season weather window.',true),
      stage('establishment','Check establishment',tx+7,'Water','Check root-zone moisture, wind damage, pest pressure and transplant stress.',true),
      stage('scout','Begin weekly crop scouting',tx+14,'Pest & disease','Inspect both leaf surfaces, stems and the soil line. Record trends instead of waiting for severe damage.',true),
      stage('harvest','Expected first-harvest window',tx+crop.maturity,'Harvest','Cultivar, weather and stress can move maturity substantially; treat this as a planning window.',true),
    ];
  }
  if(method==='transplant'){
    return [
      stage('plant','Plant transplant outdoors',0,'Planting',warm?'Confirm that cold risk and soil conditions are acceptable for this tender crop.':'Plant into workable soil during a moderate weather window.',true),
      stage('water-in','Check establishment and water-in',3,'Water','Inspect root-zone moisture and transplant stress. Avoid keeping the root zone continuously saturated.',true),
      stage('scout','Begin weekly crop scouting',7,'Pest & disease','Inspect new growth, leaf undersides and stems; confirm any problem before treating.',true),
      stage('support','Install/adjust support and mulch',14,'Soil','Set support before plants become difficult to handle; mulch only after soil conditions are suitable.',true),
      stage('harvest','Expected first-harvest window',crop.maturity,'Harvest','Treat days-to-maturity as an estimate and harvest by crop maturity cues.',true),
    ];
  }
  return [
    stage('sow','Direct sow outdoors',0,'Planting',warm?'Wait for suitable soil warmth and near-term conditions.':'Sow into workable soil and protect the seedbed from drying or crusting.',true),
    stage('emerge','Check emergence / reseed gaps',7,'Planting','Check stand uniformity and reseed only if timing still supports the crop.',true),
    stage('thin','Thin to final spacing',14,'Planting',`Aim near ${crop.spacing} in within-row/intensive spacing, then adapt for cultivar, airflow and harvest goal.`,false),
    stage('scout','Begin weekly crop scouting',18,'Pest & disease','Scout before damage becomes obvious across the whole bed.',true),
    stage('harvest','Expected first-harvest window',crop.harvest,'Harvest','Harvest by maturity cues; days-to-maturity is a planning estimate.',true),
  ];
}

function specialStages(crop,method){
  const outdoorBase=method==='indoor'?(crop.transplant||42):0;
  const harvestOffset=method==='indoor'?outdoorBase+crop.maturity:crop.maturity;
  const extra=[];
  const trellis=['pole-beans','cucumber','peas','tomatoes','pumpkin','winter-squash'];
  const brassicas=['broccoli','brussels-sprouts','cabbage','cauliflower','kale','collards'];
  const curing=['onion','potatoes','pumpkin','winter-squash'];
  if(trellis.includes(crop.id)) extra.push(stage('support-specific','Check support / training system',outdoorBase+7,'Planting','Set or adjust trellis, cage, stake or vine direction before growth becomes difficult to handle.',true));
  if(brassicas.includes(crop.id)) extra.push(stage('brassica-scout','Scout brassicas closely',outdoorBase+7,'Pest & disease','Check leaf undersides and growing points for caterpillars, flea beetles and aphids. If using insect netting, confirm pests were not trapped underneath.',true));
  if(crop.pollination==='bee') extra.push(stage('pollination','Check pollinator access at flowering',Math.max(outdoorBase+25,harvestOffset-30),'Pollination','Bee-pollinated cucurbits need flower access unless you hand-pollinate. Insect exclusion that worked earlier can block pollination once flowering begins.',true));
  if(crop.id==='sweet-corn') extra.push(stage('corn-pollination','Check block pollination',Math.max(30,harvestOffset-25),'Pollination','Corn depends on wind-borne pollen. Check tassel/silk timing and avoid treating the planting as a single decorative row.',true));
  if(curing.includes(crop.id)) extra.push(stage('cure-store','Cure / prepare for storage',harvestOffset+3,'Harvest','Use crop-appropriate curing and storage conditions; discard damaged or diseased produce before long-term storage.',false));
  return extra;
}

export function generateCropTasks(entry){
  const crop=getJourneyCrop(entry.cropId); if(!crop||!entry.startDate) return [];
  const method=entry.method||crop.methods[0]; const rounds=Math.max(1,Math.min(8,Number(entry.successions||1))); const interval=Math.max(1,Number(entry.successionInterval||crop.succession||14));
  const tasks=[];
  for(let round=0;round<rounds;round++){
    const base=dateAdd(entry.startDate,round*interval);
    [...genericStages(crop,method),...specialStages(crop,method)].sort((a,b)=>a.offset-b.offset).forEach(s=>{
      tasks.push({
        id:`${entry.id}-${round+1}-${s.id}`,
        entryId:entry.id,
        cropId:crop.id,
        cropName:crop.name,
        variety:entry.variety||'',
        round:round+1,
        title:`${crop.name}: ${s.title}${rounds>1?` (round ${round+1})`:''}`,
        date:dateAdd(base,s.offset),
        category:s.category,
        details:s.details,
        weatherSensitive:s.weatherSensitive,
        season:crop.season,
        tenderness:crop.tender,
        pollination:crop.pollination,
        bedId:entry.bedId||''
      });
    });
  }
  return tasks.sort((a,b)=>a.date.localeCompare(b.date));
}

export function allJourneyTasks(plan){
  const overrides=plan.taskOverrides||{};
  const generated=(plan.crops||[]).flatMap(generateCropTasks);
  const custom=(plan.customTasks||[]).map(t=>({...t, custom:true}));
  return [...generated,...custom].map(t=>overrides[t.id]?{...t,...overrides[t.id],originalDate:t.date,dateAdjusted:true}:t).sort((a,b)=>a.date.localeCompare(b.date));
}

export function taskBucket(date){
  const now=new Date(`${todayISO()}T12:00:00`); const d=new Date(`${date}T12:00:00`); const diff=Math.round((d-now)/DAY);
  if(diff<0) return 'overdue'; if(diff===0) return 'today'; if(diff<=7) return 'week'; if(diff<=30) return 'month'; return 'later';
}

export function emptyPlan(){ return {version:2,name:'My Growing Journey',createdAt:new Date().toISOString(),crops:[],beds:[],customTasks:[],completed:{},taskOverrides:{},notes:'',location:null}; }
