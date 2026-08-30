import { CROP_SPACING } from '../learn/gardenPlanningData';

export function spacingInches(cropName){
  const c=CROP_SPACING.find(x=>x.crop===cropName); if(!c) return 12;
  const nums=(c.spacing.match(/\d+(?:\.\d+)?/g)||[]).map(Number); return nums.length?nums.reduce((a,b)=>a+b,0)/nums.length:12;
}
export function estimateLayout({width=4,length=8,pollinatorBorder=0,crops=[]}){
  const W=Math.max(1,Number(width)||4), L=Math.max(1,Number(length)||8), border=Math.max(0,Math.min(Math.min(W,L)/3,Number(pollinatorBorder)||0));
  const innerW=Math.max(.5,W-border*2), innerL=Math.max(.5,L-border*2), area=innerW*innerL;
  const active=crops.filter(c=>c.crop && Number(c.priority)>0); const total=active.reduce((s,c)=>s+Number(c.priority||1),0)||1;
  let cursor=0;
  const zones=active.map((c,idx)=>{
    const share=Number(c.priority||1)/total; const zoneArea=area*share; const s=spacingInches(c.crop); const goalFactor=c.goal==='yield'?.82:c.goal==='size'?1.25:c.goal==='airflow'?1.35:c.goal==='easy'?1.15:1;
    const cellSqFt=Math.pow((s*goalFactor)/12,2); const estimate=Math.max(1,Math.floor(zoneArea/Math.max(.08,cellSqFt))); const start=cursor; cursor+=share;
    const profile=CROP_SPACING.find(x=>x.crop===c.crop);
    return {id:c.id,crop:c.crop,share,start,end:cursor,area:zoneArea,spacing:s*goalFactor,plantCount:estimate,training:profile?.training||'',notes:profile?.notes||'',goal:c.goal||'balanced'};
  });
  return {width:W,length:L,border,innerW,innerL,area,zones};
}
