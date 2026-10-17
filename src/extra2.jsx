import {useState} from 'react'
import {Link} from 'react-router-dom'
import {LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer} from 'recharts'
import {useStore,load,clearAll,iso} from './store'
import {EX,BLOCKS,TIMED} from './data'
Object.entries(load('custom',{})).forEach(([k,v])=>{BLOCKS[k]=v})
const Q=['Сила строится по одному честному повторению.','Техника важнее скорости, скорость придёт сама.','Отдых тоже часть тренировки.','Маленький шаг каждый день сильнее редкого рывка.','Дыши ровно: спокойствие выигрывает раунды.','Сегодняшняя тренировка — завтрашняя уверенность.','Дисциплина сильнее настроения.']
const num=(v,a,b)=>v!==''&&v>=a&&v<=b
export function More({accent,setAccent}){
 return <><h1>Меню</h1><p className="note">{Q[Math.floor(Date.now()/864e5)%Q.length]}</p><br/>
 <div className="card"><label>Цвет акцента</label><div className="row">{[['gold','Золото'],['blue','Синий'],['red','Красный'],['green','Зелёный']].map(([k,l])=><button key={k} className={'btn '+(accent===k?'':'g')} onClick={()=>setAccent(k)}>{l}</button>)}</div></div>
 <div className="menu">{[['/rank','Ранг'],['/builder','Своя тренировка'],['/test','Тест формы'],['/challenge','Челлендж'],['/events','Соревнования'],['/check','Чек-листы'],['/goals','Цели'],['/rec','Восстановление'],['/sleep','Сон и вода'],['/badges','Значки и неделя'],['/journal','Дневник секции'],['/backup','Резервная копия'],['/set','Настройки']].map(([t,l])=><Link key={t} to={t}><div className="card">{l}</div></Link>)}</div></>}
export function Backup(){
 const [m,setM]=useState('');const [p,setP]=useState(null)
 const out=()=>{const o={};Object.keys(localStorage).filter(k=>k.startsWith('wf:')).forEach(k=>o[k]=localStorage.getItem(k));const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify({app:'zeus',v:1,data:o})],{type:'application/json'}));a.download='zeus-backup.json';a.click();setM('Файл скачан.')}
 const inp=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const j=JSON.parse(r.result);if(j.app!=='zeus'||typeof j.data!=='object')throw 0;setP(j.data);setM('Файл прочитан. Подтвердите восстановление.')}catch{setP(null);setM('Это не файл резервной копии ZEUS.')}};r.readAsText(f)}
 const apply=()=>{clearAll();Object.entries(p).forEach(([k,v])=>{if(k.startsWith('wf:')&&typeof v==='string')localStorage.setItem(k,v)});location.href='#/';location.reload()}
 return <><h1>Резервная копия</h1><p className="mu">Все данные хранятся только в этом браузере. Сохраняйте копию, чтобы не потерять прогресс.</p>
 <div className="card"><button className="btn" onClick={out}>Скачать копию</button></div>
 <div className="card"><label>Восстановить из файла</label><input type="file" accept=".json" onChange={inp}/>{p&&<button className="btn g" onClick={apply}>Восстановить (заменит текущие данные)</button>}</div><p className="mu">{m}</p></>}
const RK=[['Новичок',0],['Боец',100],['Воин',300],['Гладиатор',600],['Титан',1000],['Зевс',1500]]
export function Rank(){
 const H=load('hist',[]).filter(x=>x.done),xp=H.reduce((a,x)=>a+10+Math.floor(x.sec/300),0)
 const i=RK.reduce((a,[,t],j)=>xp>=t?j:a,0),nx=RK[i+1]
 return <><h1>Ранг</h1><div className="card key"><div className="mu">Ваш ранг</div><div className="big">{RK[i][0]}</div><p className="mu">{xp} очков опыта</p>{nx?<><div className="bar"><i style={{width:(xp-RK[i][1])/(nx[1]-RK[i][1])*100+'%'}}/></div><p className="mu">До «{nx[0]}»: {nx[1]-xp}</p></>:<p>Высший ранг достигнут!</p>}</div>
 {RK.map(([n,t])=><span key={n} className={'chip '+(xp>=t?'d':'')}>{n} · {t}</span>)}
 <p className="note">10 очков за каждую полностью завершённую тренировку и +1 за каждые 5 минут. Неполные тренировки не засчитываются.</p></>}
export function Test(){
 const [T,setT]=useStore('tests',[]);const [f,setF]=useState({push:'',plank:'',squat:''});const [e,setE]=useState('')
 const add=ev=>{ev.preventDefault();if(!num(f.push,0,200)||!num(f.plank,0,600)||!num(f.squat,0,200)){setE('Отжимания и приседания 0–200, планка 0–600 с');return}setE('');setT([...T,{id:Date.now(),date:iso(new Date()),push:+f.push,plank:+f.plank,squat:+f.squat}]);setF({push:'',plank:'',squat:''})}
 return <><h1>Тест формы</h1><p className="note">Раз в 2 недели, в комфортном темпе. Это не тест на максимум силы: остановитесь при боли или головокружении.</p><br/>
 <form className="card" onSubmit={add} noValidate>{[['push','Отжимания за 60 с'],['plank','Планка (секунд)'],['squat','Приседания за 60 с']].map(([k,l])=><div key={k}><label>{l}</label><input type="number" value={f[k]} onChange={x=>setF({...f,[k]:x.target.value})}/></div>)}<div className="err">{e}</div><button className="btn">Сохранить результат</button></form>
 {T.length>1&&<div className="card"><b>Измеренные результаты</b><div style={{height:180}}><ResponsiveContainer><LineChart data={T.map(x=>({...x,d:x.date.slice(5)}))}><XAxis dataKey="d" stroke="#8B93A7"/><YAxis stroke="#8B93A7"/><Tooltip/><Line dataKey="push" name="Отжимания" stroke="#FFC83D"/><Line dataKey="plank" name="Планка" stroke="#5B8CFF"/><Line dataKey="squat" name="Приседания" stroke="#3DDC84"/></LineChart></ResponsiveContainer></div></div>}
 {T.slice().reverse().map(x=><div key={x.id} className="card"><div className="row sp"><span className="mu">{x.date}</span><button className="btn g" onClick={()=>setT(T.filter(z=>z.id!==x.id))}>Удалить</button></div>Отжимания {x.push} · Планка {x.plank} с · Приседания {x.squat}</div>)}</>}
export function Builder(){
 const [C,setC]=useStore('custom',{});const [n,setN]=useState('');const [R,setR]=useState([]);const [pick,setPick]=useState('squat');const [e,setE]=useState('')
 const up=(i,k,v)=>setR(R.map((x,j)=>j===i?{...x,[k]:v}:x))
 const save=ev=>{ev.preventDefault();if(n.trim().length<2||!R.length){setE('Введите название и добавьте упражнения');return}if(R.some(x=>!num(x.s,1,6)||!num(x.r,1,60)||!num(x.rest,0,180))){setE('Подходы 1–6, повторы 1–60, отдых 0–180 с');return}
  const ex=R.map(x=>[x.id,+x.s,+x.r,+x.rest]);const d=Math.max(5,Math.round(ex.reduce((a,[id,s,r,rest])=>a+s*(r*(TIMED.includes(id)?1:3)+rest),0)/60));const k='c_'+Date.now(),b={t:n.trim(),d,ex};BLOCKS[k]=b;setC({...C,[k]:b});setN('');setR([]);setE('')}
 const del=k=>{delete BLOCKS[k];const c={...C};delete c[k];setC(c)}
 return <><h1>Своя тренировка</h1><form className="card" onSubmit={save} noValidate><label>Название</label><input value={n} onChange={x=>setN(x.target.value)}/>
 <div className="row"><select style={{flex:1}} value={pick} onChange={x=>setPick(x.target.value)}>{Object.entries(EX).map(([id,x])=><option key={id} value={id}>{x.n}</option>)}</select><button type="button" className="btn g" onClick={()=>setR([...R,{id:pick,s:3,r:10,rest:45}])}>Добавить</button></div><br/>
 {R.map((x,i)=><div key={i} className="card"><div className="row sp"><b>{EX[x.id].n}</b><button type="button" className="btn g" onClick={()=>setR(R.filter((_,j)=>j!==i))}>Убрать</button></div><div className="grid">{[['s','Подходы'],['r',TIMED.includes(x.id)?'Секунды':'Повторы'],['rest','Отдых, с']].map(([k,l])=><div key={k}><label>{l}</label><input type="number" value={x[k]} onChange={v=>up(i,k,v.target.value)}/></div>)}</div></div>)}
 <div className="err">{e}</div><button className="btn">Сохранить тренировку</button></form>
 {!Object.keys(C).length&&<p className="mu">Своих тренировок пока нет.</p>}
 {Object.entries(C).map(([k,b])=><div key={k} className="card"><b>{b.t}</b><p className="mu">~{b.d} мин · {b.ex.length} упражнений</p><div className="row"><Link className="btn" to={`/work/${k}`}>Начать</Link><button className="btn g" onClick={()=>del(k)}>Удалить</button></div></div>)}</>}
export function Challenge(){
 const [c,setC]=useStore('chal',null);const t=iso(new Date())
 const day=i=>{const d=new Date(c.start);d.setDate(d.getDate()+i);return iso(d)}
 if(!c)return <><h1>Челлендж</h1>{[['7 дней мобильности',7],['7 дней тренировок',7],['30 дней режима',30]].map(([name,days])=><div key={name} className="card row sp"><b>{name}</b><button className="btn" onClick={()=>setC({name,days,start:t,done:[]})}>Начать</button></div>)}<p className="mu">Отмечайте каждый день честно, пропуск не страшен.</p></>
 const idx=Math.floor((new Date(t)-new Date(c.start))/864e5),inr=idx>=0&&idx<c.days
 return <><h1>{c.name}</h1><div className="card"><div className="big">{c.done.length}/{c.days}</div><div className="bar" style={{margin:'8px 0'}}><i style={{width:c.done.length/c.days*100+'%'}}/></div>
 {inr?<button className="btn" onClick={()=>setC({...c,done:c.done.includes(t)?c.done.filter(x=>x!==t):[...c.done,t]})}>{c.done.includes(t)?'Отменить отметку':'Отметить сегодня'}</button>:<p className="mu">Челлендж завершён.</p>}</div>
 <div>{[...Array(c.days)].map((_,i)=><span key={i} className={'chip '+(c.done.includes(day(i))?'d ':'')+(day(i)===t?'t':'')}>{i+1}</span>)}</div><br/><button className="btn g" onClick={()=>setC(null)}>Сбросить челлендж</button></>}
export function Events(){
 const [E,setE]=useStore('events',[]);const [n,setN]=useState('');const [d,setD]=useState('');const [er,setEr]=useState('')
 const add=ev=>{ev.preventDefault();if(n.trim().length<2||!d){setEr('Введите название и дату');return}setEr('');setE([...E,{id:Date.now(),n:n.trim(),d}].sort((a,b)=>a.d.localeCompare(b.d)));setN('');setD('')}
 const left=x=>Math.round((new Date(x)-new Date(iso(new Date())))/864e5)
 return <><h1>Соревнования</h1><form className="card" onSubmit={add} noValidate><label>Название</label><input value={n} onChange={x=>setN(x.target.value)}/><label>Дата</label><input type="date" value={d} onChange={x=>setD(x.target.value)}/><div className="err">{er}</div><button className="btn">Добавить</button></form>
 {!E.length&&<p className="mu">Событий пока нет.</p>}{E.map(x=>{const l=left(x.d);return <div key={x.id} className="card row sp"><div><b>{x.n}</b><div className="mu">{x.d}</div></div><div className="row"><span className="big">{l>=0?l:'—'}</span><span className="mu">{l>=0?'дней':'прошло'}</span><button className="btn g" onClick={()=>setE(E.filter(z=>z.id!==x.id))}>Удалить</button></div></div>})}
 <p className="note">Готовьтесь по плану и с тренером. Никакой сгонки веса и обезвоживания.</p></>}
const CL={'Перед тренировкой':['Выпил(а) воды','Сделал(а) разминку 5 минут','Самочувствие нормальное','Место свободно и безопасно'],'После тренировки':['Заминка и растяжка','Выпил(а) воды','Записал(а) заметки']}
export function Check(){
 const [K,setK]=useStore('chk',{});const t=iso(new Date());const c=K[t]||{}
 return <><h1>Чек-листы</h1>{Object.entries(CL).map(([g,L])=><div key={g} className="card"><b>{g}</b>{L.map(x=><label key={x} style={{display:'flex',gap:10,alignItems:'center',padding:'6px 0',fontSize:16,color:'var(--tx)'}}><input type="checkbox" style={{width:22,margin:0}} checked={!!c[x]} onChange={()=>setK({...K,[t]:{...c,[x]:!c[x]}})}/>{x}</label>)}</div>)}</>}
