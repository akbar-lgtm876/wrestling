import {Ring} from './fx.jsx'
import {useState,useEffect} from 'react'
import {Link} from 'react-router-dom'
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer} from 'recharts'
import {useStore,load,save,iso,fmt} from './store'
const CUES=['Смена уровня и проход','Финт и смена направления','Повторная атака','Возврат в стойку','Спраул и стойка','Работа ног без скрещивания']
const beep=()=>{try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator();o.connect(a.destination);o.frequency.value=880;o.start();setTimeout(()=>{o.stop();a.close()},250)}catch{}navigator.vibrate?.(200)}
export function Rounds(){
 const [c,setC]=useStore('rcfg',{r:3,w:120,rest:30});const [st,setSt]=useState(null);const [now,setNow]=useState(Date.now());const [done,setDone]=useState(null);const [e,setE]=useState('')
 useEffect(()=>{if(!st)return;const id=setInterval(()=>{const n=Date.now();setNow(n);setSt(s=>{if(!s||s.fin||n<s.end)return s;beep();if(s.ph==='work'&&s.n===c.r)return{...s,fin:true};return s.ph==='work'?{...s,ph:'rest',end:n+c.rest*1000}:{...s,ph:'work',n:s.n+1,end:n+c.w*1000}})},250);return()=>clearInterval(id)},[st?.t0])
 useEffect(()=>{if(st?.fin){const sec=Math.round((Date.now()-st.t0)/1000);save('hist',[...load('hist',[]),{id:Date.now(),date:iso(new Date()),title:'Теневая борьба',sec,done:true,sets:c.r,total:c.r,skipped:0,rpe:'—',feel:'—',note:''}]);setDone(sec);setSt(null)}},[st?.fin])
 const start=()=>{if(!(c.r>=1&&c.r<=10)||!(c.w>=30&&c.w<=300)||!(c.rest>=0&&c.rest<=120)){setE('Раунды 1–10, работа 30–300 с, отдых 0–120 с');return}setE('');setDone(null);const n=Date.now();setSt({ph:'work',n:1,t0:n,end:n+c.w*1000})}
 if(st){const left=Math.max(0,Math.ceil((st.end-now)/1000));return <><p className="mu">{st.ph==='work'?`Раунд ${st.n} из ${c.r}`:'Отдых'}</p><h1>{st.ph==='work'?CUES[(st.n-1)%CUES.length]:'Дышите ровно'}</h1><div className="card"><Ring left={left} total={st.ph==='work'?c.w:c.rest}/></div><button className="btn g" onClick={()=>setSt(null)}>Остановить (не засчитается)</button></>}
 return <><h1>Теневая борьба</h1><p className="mu">Работа без партнёра по раундам. Звук и вибрация сообщают о смене фазы.</p>{done&&<div className="card"><b>Готово!</b> {Math.round(done/60)} мин записано в историю.</div>}
 <div className="card">{[['r','Раундов'],['w','Раунд (секунд)'],['rest','Отдых (секунд)']].map(([k,l])=><div key={k}><label>{l}</label><input type="number" value={c[k]} onChange={x=>setC({...c,[k]:+x.target.value})}/></div>)}<div className="err">{e}</div><button className="btn" onClick={start}>Старт</button></div>
 <p className="note">Завершение проходов, защита и борьба на сопротивление требуют партнёра, мата и тренера.</p></>}
export function Sleep(){
 const R=load('rc',{});const [W,setW]=useStore('water',{});const t=iso(new Date())
 const data=[...Array(14)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-13+i);const k=iso(d);return{d:k.slice(5),h:R[k]?.sleep??0}})
 const lg=data.filter(x=>x.h>0),avg=lg.length?(lg.reduce((a,x)=>a+x.h,0)/lg.length).toFixed(1):null
 return <><h1>Сон и вода</h1><div className="card"><b>Сон за 14 дней</b><p className="mu">{avg?`Среднее: ${avg} ч (по ${lg.length} отметкам)`:'Нет данных. Отметьте сон в разделе «Отдых».'}</p><div style={{height:170}}><ResponsiveContainer><BarChart data={data}><XAxis dataKey="d" stroke="#8B93A7" fontSize={10}/><YAxis stroke="#8B93A7"/><Tooltip/><Bar dataKey="h" fill="#FFC83D" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div></div>
 <div className="card"><b>Вода сегодня</b><div className="row sp"><span className="big">{W[t]||0}</span><span className="row"><button className="btn g" aria-label="Минус" onClick={()=>setW({...W,[t]:Math.max(0,(W[t]||0)-1)})}>−</button><button className="btn" onClick={()=>setW({...W,[t]:(W[t]||0)+1})}>+ стакан</button></span></div></div></>}
export function Badges(){
 const H=load('hist',[]).filter(x=>x.done),rc=load('rc',{}),g=load('goals',[]);const ds=[...new Set(H.map(x=>x.date))].sort()
 let best=0,cur=0;ds.forEach((d,i)=>{cur=i&&(new Date(d)-new Date(ds[i-1]))===864e5?cur+1:1;best=Math.max(best,cur)})
 const mon=new Date();mon.setDate(mon.getDate()-((mon.getDay()+6)%7));const m0=iso(mon),pm=new Date(mon);pm.setDate(pm.getDate()-7);const m1=iso(pm)
 const mins=(a,b)=>Math.round(H.filter(x=>x.date>=a&&(!b||x.date<b)).reduce((s,x)=>s+x.sec,0)/60)
 const B=[['Первая тренировка',H.length>=1],['10 тренировок',H.length>=10],['Серия 3 дня',best>=3],['Серия 7 дней',best>=7],['3 сессии теневой борьбы',H.filter(x=>x.title==='Теневая борьба').length>=3],['Сон отмечен 7 дней',Object.keys(rc).length>=7],['Первая цель создана',g.length>=1]]
 return <><h1>Значки</h1><div className="card"><b>Эта неделя и прошлая</b><div className="grid" style={{marginTop:8}}><div><div className="big">{mins(m0)}</div><div className="mu">минут сейчас</div></div><div><div className="big">{mins(m1,m0)}</div><div className="mu">минут на прошлой</div></div></div></div>
 {B.map(([t,on])=><div key={t} className={'card badge '+(on?'on':'')}><b>{on?'✓ ':''}{t}</b></div>)}</>}
export function Journal(){
 const [J,setJ]=useStore('journal',[]);const [t,setT]=useState('');const [e,setE]=useState('')
 const add=ev=>{ev.preventDefault();if(t.trim().length<3){setE('Напишите хотя бы несколько слов');return}setE('');setJ([{id:Date.now(),date:iso(new Date()),t:t.trim()},...J]);setT('')}
 return <><h1>Дневник секции</h1><p className="mu">Чему научили, что получилось, что показать тренеру.</p><form className="card" onSubmit={add} noValidate><textarea rows={3} value={t} onChange={x=>setT(x.target.value)} aria-label="Запись"/><div className="err">{e}</div><button className="btn">Добавить запись</button></form>
 {!J.length&&<p className="mu">Записей пока нет.</p>}{J.map(x=><div key={x.id} className="card"><div className="row sp"><span className="mu">{x.date}</span><button className="btn g" onClick={()=>setJ(J.filter(z=>z.id!==x.id))}>Удалить</button></div><p style={{whiteSpace:'pre-wrap'}}>{x.t}</p></div>)}</>}
export function More(){
 return <><h1>Меню</h1><div className="menu">{[['/goals','Цели'],['/rec','Восстановление'],['/sleep','Сон и вода'],['/badges','Значки и неделя'],['/journal','Дневник секции'],['/set','Настройки']].map(([t,l])=><Link key={t} to={t}><div className="card">{l}</div></Link>)}</div></>}
