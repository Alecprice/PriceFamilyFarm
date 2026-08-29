'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CROP_SPACING, SPACING_GOALS } from '../../lib/learn/gardenPlanningData';
import { estimateLayout } from '../../lib/planner/layoutEngine';
import { uid } from '../../lib/planner/journeyEngine';
import { readPlan, writePlan } from '../../lib/planner/plannerStorage';
import styles from './Planner.module.css';

const TRELLIS=/trellis|stake|cage|support|wind pollination/i;
export default function BedLayoutBuilder(){
 const [bed,setBed]=useState({name:'Bed 1',width:4,length:8,bedType:'Permanent / raised bed',pathWidth:30,pollinatorBorder:0,orientation:'North at top'});
 const [selected,setSelected]=useState([{id:uid('zone'),crop:'Tomatoes',priority:3,goal:'balanced'},{id:uid('zone'),crop:'Bush beans',priority:2,goal:'yield'}]); const [saved,setSaved]=useState(false);
 const layout=useMemo(()=>estimateLayout({...bed,crops:selected}),[bed,selected]);
 function add(){setSelected(s=>s.length>=12?s:[...s,{id:uid('zone'),crop:'Leaf lettuce',priority:2,goal:'balanced'}]);setSaved(false);}
 function edit(id,key,value){setSelected(s=>s.map(x=>x.id===id?{...x,[key]:value}:x));setSaved(false);}
 function remove(id){setSelected(s=>s.filter(x=>x.id!==id));setSaved(false);}
 function save(){try{const plan=readPlan();const record={id:uid('bed'),...bed,width:Number(bed.width),length:Number(bed.length),pathWidth:Number(bed.pathWidth),pollinatorBorder:Number(bed.pollinatorBorder),zones:layout.zones.map(z=>({...z}))};writePlan({...plan,beds:[...(plan.beds||[]),record]},{forceBackup:true});window.dispatchEvent(new Event('pff-journey-updated'));setSaved(true);}catch(e){console.error(e);setSaved(false)}}
 return <div className={styles.journeyStack}>
 <section className={styles.panel}><div className={styles.forecastHeader}><div><span className={styles.eyebrow}>Bed dimensions → crop goals → estimate</span><h2>Build a practical bed layout</h2></div><Link href="/my-growing-journey" className={styles.textLink}>Open My Growing Journey →</Link></div>
 <div className={styles.formGrid}>
  <label className={styles.field}><span>Bed name</span><input value={bed.name} onChange={e=>setBed(b=>({...b,name:e.target.value}))}/></label>
  <label className={styles.field}><span>Width (ft)</span><input type="number" min="1" max="20" step="0.5" value={bed.width} onChange={e=>setBed(b=>({...b,width:e.target.value}))}/></label>
  <label className={styles.field}><span>Length (ft)</span><input type="number" min="1" max="100" step="0.5" value={bed.length} onChange={e=>setBed(b=>({...b,length:e.target.value}))}/></label>
  <label className={styles.field}><span>Bed type</span><select value={bed.bedType} onChange={e=>setBed(b=>({...b,bedType:e.target.value}))}>{['Permanent / raised bed','In-ground intensive bed','Traditional row block','Greenhouse bed','Container / table-height bed'].map(x=><option key={x}>{x}</option>)}</select></label>
  <label className={styles.field}><span>Main path width (in)</span><input type="number" min="18" max="72" value={bed.pathWidth} onChange={e=>setBed(b=>({...b,pathWidth:e.target.value}))}/></label>
  <label className={styles.field}><span>Pollinator / flower border (ft)</span><input type="number" min="0" max="3" step="0.25" value={bed.pollinatorBorder} onChange={e=>setBed(b=>({...b,pollinatorBorder:e.target.value}))}/></label>
 </div>
 <div className={styles.plannerNotice}><strong>Planning estimate:</strong> this tool uses the research-backed spacing ranges already in the Learn library, but it cannot know cultivar vigor, pruning style, exact soil fertility, irrigation, slope, shade or disease pressure. Use the visualization to organize space, then adjust with cultivar packets and current Extension guidance.</div>
 </section>
 <section className={styles.panel}><div className={styles.forecastHeader}><div><span className={styles.eyebrow}>Crop zones</span><h2>Choose what earns space</h2></div><button className={styles.secondaryButton} onClick={add} disabled={selected.length>=12}>+ Add crop zone ({selected.length}/12)</button></div>
 <div className={styles.zoneEditor}>{selected.map((z,i)=><div className={styles.zoneRow} key={z.id}><span className={styles.zoneNumber}>{i+1}</span><label className={styles.field}><span>Crop</span><select value={z.crop} onChange={e=>edit(z.id,'crop',e.target.value)}>{CROP_SPACING.map(c=><option key={c.crop}>{c.crop}</option>)}</select></label><label className={styles.field}><span>Priority / space share</span><select value={z.priority} onChange={e=>edit(z.id,'priority',e.target.value)}>{[1,2,3,4,5].map(n=><option key={n} value={n}>{n} — {n===1?'small':n===5?'largest':'medium'}</option>)}</select></label><label className={styles.field}><span>Goal</span><select value={z.goal} onChange={e=>edit(z.id,'goal',e.target.value)}>{SPACING_GOALS.map(g=><option key={g.id} value={g.id}>{g.label}</option>)}</select></label><button className={styles.iconButton} onClick={()=>remove(z.id)} aria-label={`Remove ${z.crop}`}>Remove</button></div>)}</div>
 </section>
 <section className={styles.panel}><div className={styles.forecastHeader}><div><span className={styles.eyebrow}>{bed.orientation}</span><h2>{bed.name} layout</h2><p>{layout.innerW.toFixed(1)} × {layout.innerL.toFixed(1)} ft usable crop area • {layout.area.toFixed(1)} sq ft</p></div><button className={styles.primaryButton} onClick={save} disabled={!layout.zones.length}>{saved?'Saved to My Growing Journey':'Save bed to My Growing Journey'}</button></div>
 <div className={styles.northMarker}>NORTH ↑ — place tall trellises toward this edge when that reduces shading of shorter crops</div>
 <div className={styles.bedVisual} style={{aspectRatio:`${Math.max(1,Number(bed.width))}/${Math.max(1,Number(bed.length))}`,minHeight:`${Math.min(760,Math.max(440,layout.zones.length*62))}px`}}>{Number(bed.pollinatorBorder)>0&&<div className={styles.pollinatorBorder}>Pollinator / flower border</div>}<div className={styles.bedInner}>{layout.zones.map(z=><div key={z.id} className={`${styles.bedZone} ${TRELLIS.test(z.training)?styles.trellisZone:''}`} style={{height:`${z.share*100}%`}}><strong>{z.crop}</strong><span>~{z.plantCount} plants</span><small>{Math.round(z.spacing)} in planning spacing • {Math.round(z.share*100)}% of crop area</small>{TRELLIS.test(z.training)&&<em>Trellis/support zone</em>}</div>)}</div></div>
 <div className={styles.taskGrid}>{layout.zones.map(z=><article className={styles.taskCard} key={z.id}><span className={styles.confidence}>{Math.round(z.share*100)}% share</span><h3>{z.crop}</h3><p><strong>Estimated plants:</strong> ~{z.plantCount}</p><p><strong>Planning spacing:</strong> ~{Math.round(z.spacing)} in</p><p>{z.training}</p><p className={styles.sourceNote}>{z.notes}</p></article>)}</div>
 </section></div>;
}
