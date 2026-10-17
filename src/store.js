import {useState,useEffect} from 'react'
export const load=(k,d)=>{try{const v=localStorage.getItem('wf:'+k);return v?JSON.parse(v):d}catch{return d}}
export const save=(k,v)=>{try{localStorage.setItem('wf:'+k,JSON.stringify(v))}catch{}}
export const clearAll=()=>Object.keys(localStorage).filter(k=>k.startsWith('wf:')).forEach(k=>localStorage.removeItem(k))
export function useStore(k,d){const[v,s]=useState(()=>load(k,d));useEffect(()=>save(k,v),[k,v]);return[v,s]}
export const iso=d=>{const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`}
export const weekN=()=>{const st=load('start',null);return st?Math.min(8,Math.floor((new Date(iso(new Date()))-new Date(st))/6048e5)+1):1}
export const fmt=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')
