import {useEffect,useRef} from 'react'
import {useLocation} from 'react-router-dom'
export function Ring({left,total}){
 const R=54,C=2*Math.PI*R,p=total>0?Math.min(1,left/total):0,prev=useRef(left)
 useEffect(()=>{if(prev.current>0&&left===0)navigator.vibrate?.([120,60,120]);prev.current=left},[left])
 const m=String(Math.floor(left/60)).padStart(2,'0'),s=String(left%60).padStart(2,'0')
 return <div className="ring" role="timer" aria-label={`Осталось ${left} секунд`}>
  <svg viewBox="0 0 128 128" aria-hidden="true"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style={{stopColor:'var(--ac)'}}/><stop offset="1" style={{stopColor:'var(--bl)'}}/></linearGradient></defs>
  <circle cx="64" cy="64" r={R} className="rt"/><circle cx="64" cy="64" r={R} className="rp" stroke="url(#rg)" strokeDasharray={C} strokeDashoffset={C*(1-p)} transform="rotate(-90 64 64)"/></svg>
  <div className="timer">{m}:{s}</div></div>}
export function Page({children}){const l=useLocation();return <div key={l.pathname} className="page">{children}</div>}
export function useFx(){useEffect(()=>{const f=e=>{const c=e.target.closest?.('.card');if(c){const r=c.getBoundingClientRect();c.style.setProperty('--mx',e.clientX-r.left+'px');c.style.setProperty('--my',e.clientY-r.top+'px')}};document.addEventListener('pointermove',f);return()=>document.removeEventListener('pointermove',f)},[])}
