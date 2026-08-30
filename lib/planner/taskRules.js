export const TASK_CATEGORIES=['Planting','Protection','Water','Soil','Pest & disease','Harvest'];

export function dayPlanningFlags(day){
  const flags=[];
  if(!day)return flags;
  if(Number.isFinite(day.min)&&day.min<=36)flags.push({level:'caution',label:'Cold risk',detail:`Low near ${Math.round(day.min)}°F`});
  else if(Number.isFinite(day.min)&&day.min<45)flags.push({level:'watch',label:'Chilly',detail:`Low near ${Math.round(day.min)}°F`});
  if(Number.isFinite(day.max)&&day.max>=92)flags.push({level:'caution',label:'Heat stress',detail:`High near ${Math.round(day.max)}°F`});
  else if(Number.isFinite(day.max)&&day.max>=88)flags.push({level:'watch',label:'Hot',detail:`High near ${Math.round(day.max)}°F`});
  if(Number.isFinite(day.rain)&&day.rain>=1)flags.push({level:'caution',label:'Heavy rain',detail:`About ${day.rain.toFixed(2)} in modeled`});
  else if(Number.isFinite(day.rain)&&day.rain>=.5)flags.push({level:'watch',label:'Wet work',detail:`About ${day.rain.toFixed(2)} in modeled`});
  if(Number.isFinite(day.gust)&&day.gust>=30)flags.push({level:'caution',label:'Strong gusts',detail:`Around ${Math.round(day.gust)} mph`});
  else if(Number.isFinite(day.gust)&&day.gust>=20)flags.push({level:'watch',label:'Breezy',detail:`Around ${Math.round(day.gust)} mph`});
  return flags;
}

export function weatherTasks(days=[]){
  if(!days.length)return[];
  const tasks=[],first7=days.slice(0,7);
  const mins=first7.map(d=>d.min).filter(Number.isFinite),maxes=first7.map(d=>d.max).filter(Number.isFinite);
  const min=mins.length?Math.min(...mins):null,max=maxes.length?Math.max(...maxes):null;
  const wet=first7.reduce((a,d)=>a+(Number(d.rain)||0),0);
  const et0=first7.reduce((a,d)=>a+(Number(d.et0)||0),0);
  const gust=Math.max(0,...first7.map(d=>Number(d.gust)||0));
  const cold=first7.find(d=>Number(d.min)<=36),hot=first7.find(d=>Number(d.max)>=92),wind=first7.find(d=>Number(d.gust)>=25),heavy=first7.find(d=>Number(d.rain)>=.75);
  if(cold)tasks.push({title:'Prepare cold-sensitive crops',category:'Protection',why:`A low near ${Math.round(min)}°F appears in the near-term forecast.`,action:'Stage row cover, verify greenhouse/tunnel closure and ventilation timing, and avoid setting tender transplants immediately before the coldest night.',confidence:'Near-term weather signal',date:cold.date});
  if(hot)tasks.push({title:'Heat-stress check',category:'Water',why:`Forecast highs reach about ${Math.round(max)}°F.`,action:'Check root-zone moisture, mulch coverage, transplant shade needs and greenhouse ventilation before peak heat.',confidence:'Near-term weather signal',date:hot.date});
  if(wet>=1.5)tasks.push({title:'Plan around a wet stretch',category:'Soil',why:`The first seven forecast days total roughly ${wet.toFixed(1)} in of modeled precipitation.`,action:'Avoid working saturated soil, protect erosion-prone beds, and schedule cultivation, transplanting or foliar work for a drier window.',confidence:'Near-term weather signal',date:heavy?.date||first7[0].date});
  if(wet<.3)tasks.push({title:'Irrigation readiness check',category:'Water',why:`The first seven days look relatively dry in the current model${et0>0?` while reference ET₀ totals about ${et0.toFixed(2)} in`:''}.`,action:'Inspect drip lines and soil moisture. ET₀ is a reference atmospheric-water-demand measure, not a direct instruction to apply that amount to every crop; water by crop stage and root-zone need.',confidence:'Near-term weather signal',date:first7[0].date});
  if(gust>=25)tasks.push({title:'Secure trellises and covers',category:'Protection',why:`Modeled gusts reach about ${Math.round(gust)} mph.`,action:'Check tunnel anchors, row-cover clips, tall stakes, trellises and greenhouse doors before the windy period.',confidence:'Near-term weather signal',date:wind?.date||first7[0].date});
  const mild=first7.find(d=>Number(d.min)>=45&&Number(d.max)<=85&&Number(d.rain)<.35&&(Number(d.gust)||0)<20);
  if(mild)tasks.push({title:'Potential field-work window',category:'Planting',why:`${mild.label} currently looks mild with limited rain and wind.`,action:'This may be a useful transplanting, bed-prep or harvesting window if soil, crop stage and local observations are also ready.',confidence:'Candidate—not a guarantee',date:mild.date});
  return tasks;
}

function taskKind(task){
  const title=String(task?.title||'').toLowerCase();
  if(/harden/.test(title))return 'harden';
  if(/transplant|plant transplant/.test(title))return 'transplant';
  if(/direct sow|\bsow\b|seedbed|reseed/.test(title))return 'sow';
  if(/soil|cultivat|bed prep|bed-prep|till|broadfork/.test(title))return 'soil';
  if(/harvest|pick|cure/.test(title))return 'harvest';
  if(/cover|trellis|secure|stake|support/.test(title))return 'structure';
  if(/water|irrigat/.test(title))return 'water';
  return 'general';
}

export function assessTaskAgainstDay(task,day){
  if(!task||!day)return null;
  const issues=[];const notes=[];const tender=task.tenderness==='tender';const kind=taskKind(task);
  if(tender&&['transplant','harden','sow'].includes(kind)&&day.min<45)issues.push('cold for a tender crop');
  else if(!tender&&kind==='transplant'&&day.min<=32)issues.push('freezing conditions may stress new transplants');
  if(['transplant','harden'].includes(kind)&&day.gust>=20)issues.push('windy for plant handling');
  if(['sow','transplant','soil'].includes(kind)&&day.rain>=.65)issues.push('wet field-work conditions possible');
  if(kind==='harvest'&&day.rain>=.75)issues.push('heavy rain may complicate harvest quality or access');
  if(day.max>=92&&['transplant','harden','sow'].includes(kind))issues.push('heat-stress risk');
  if(kind==='structure'&&day.gust>=25)issues.push('strong wind can stress covers or supports');
  if(kind==='water'&&day.rain>=.5)notes.push('modeled rainfall may reduce irrigation need, but verify the root zone');
  return {level:issues.length?'caution':'good',message:issues.length?`Weather check: ${issues.join('; ')}.`:`No obvious temperature, rain or wind conflict for this task.${notes.length?` ${notes.join(' ')}`:' Confirm soil, crop stage and local observations.'}`};
}

export function taskWeatherScore(task,day){
  if(!task||!day)return -999;
  let score=100; const tender=task.tenderness==='tender'; const kind=taskKind(task);
  if(tender&&['transplant','harden','sow'].includes(kind)){if(day.min<38)score-=70;else if(day.min<45)score-=35;}
  if(!tender&&kind==='transplant'&&day.min<=32)score-=35;
  if(['transplant','harden'].includes(kind)){if(day.max>=94)score-=40;else if(day.max>=90)score-=20;if(day.gust>=25)score-=35;else if(day.gust>=18)score-=15;}
  if(['sow','transplant','soil'].includes(kind)){if(day.rain>=1)score-=45;else if(day.rain>=.55)score-=25;}
  if(kind==='harvest'){if(day.rain>=1)score-=35;else if(day.rain>=.6)score-=20;if(day.gust>=30)score-=10;}
  if(kind==='structure'&&day.gust>=25)score-=30;
  if(kind==='water'&&day.rain>=.5)score-=15;
  if(day.max>=98)score-=15;
  return score;
}

export function findBetterForecastDay(task,days=[]){
  if(!task?.date||!days.length)return null;
  const target=new Date(`${task.date}T12:00:00`).getTime();
  const candidates=days.filter(d=>{const t=new Date(`${d.date}T12:00:00`).getTime();return t>=target&&t-target<=3*86400000;}).map(d=>({...d,score:taskWeatherScore(task,d)})).sort((a,b)=>b.score-a.score||Math.abs(new Date(`${a.date}T12:00:00`)-target)-Math.abs(new Date(`${b.date}T12:00:00`)-target));
  const current=days.find(d=>d.date===task.date);const best=candidates[0];
  if(!best||!current||best.date===current.date||best.score<=taskWeatherScore(task,current)+10)return null;
  return best;
}
