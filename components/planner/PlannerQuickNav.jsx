'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Planner.module.css';

const ITEMS=[
  ['/my-growing-journey','My Journey'],
  ['/farm-planner','Farm Planner'],
  ['/learn/year-round','Year-Round'],
  ['/learn/garden-planning','Garden Planning'],
  ['/learn/garden-layout-builder','Bed Builder']
];

export default function PlannerQuickNav(){
  const path=usePathname();
  return <nav className={styles.plannerQuickNav} aria-label="Growing planner tools">
    {ITEMS.map(([href,label])=><Link key={href} href={href} className={path===href?styles.quickNavActive:''} aria-current={path===href?'page':undefined}>{label}</Link>)}
  </nav>;
}
