import {Ring} from './fx.jsx'
import Bolt3D from './Bolt3D.jsx'
import {useState,useEffect,useRef} from 'react'
import {Link,useParams,useNavigate} from 'react-router-dom'
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer} from 'recharts'
import {useStore,load,save,clearAll,iso,weekN,fmt} from './store'
import {EX,TIMED,BLOCKS,WEEK,DAYS,sets} from './data'
const unit=id=>TIMED.includes(id)?' с':''
export function Setup({onDone}){
 const [f,setF]=useState({name:'',age:'',level:'Начальный',section:false});const [e,setE]=useState({})
 const go=ev=>{ev.preventDefault();const er={};if(!f.name.trim())er.name='Введите имя';if(!(f.age>=8&&f.age<=80))er.age='Возраст от 8 до 80';setE(er);if(Object.keys(er).length)return
  save('start',iso(new Date()));onDone({...f,name:f.name.trim()})}
 return <><h1>ZEUS</h1><p className="mu">Короткая настройка. Данные хранятся только на этом устройстве.</p>
 <form className="card" onSubmit={go} noValidate><label>Имя</label><input value={f.name} onChange={x=>setF({...f,name:x.target.value})}/><div className="err">{e.name}</div>
 <label>Возраст</label><input type="number" value={f.age} onChange={x=>setF({...f,age:+x.target.value})}/><div className="err">{e.age}</div>
 <label>Уровень</label><select value={f.level} onChange={x=>setF({...f,level:x.target.value})}><option>Начальный</option><option>Средний</option></select>
 <label><input type="checkbox" style={{width:'auto',marginRight:8}} checked={f.section} onChange={x=>setF({...f,section:x.target.checked})}/>Хожу в секцию борьбы</label><br/><br/>
 <button className="btn">Начать программу</button></form>
 <p className="note">Домашние упражнения развивают физподготовку, но не заменяют борьбу с партнёром и тренером.</p></>}
export function Dashboard({profile}){
 const H=load('hist',[]),now=new Date(),wk=weekN(),key=WEEK[(now.getDay()+6)%7],full=H.filter(x=>x.done)
 const mon=new Date(now);mon.setDate(now.getDate()-((now.getDay()+6)%7));const ds=new Set(full.map(x=>x.date))
 let st=0;const c=new Date();if(!ds.has(iso(c)))c.setDate(c.getDate()-1);while(ds.has(iso(c))){st++;c.setDate(c.getDate()-1)}
 const pl=WEEK.filter(Boolean).length,wd=full.filter(x=>new Date(x.date)>=new Date(iso(mon))).length
 const rc=load('rc',{})[iso(now)];const last=H[H.length-1]
 const tip=!rc?'Отметьте самочувствие в разделе «Отдых».':rc.fat>=4||rc.sleep<6?'Высокая усталость или мало сна: выберите восстановление.':'Состояние в норме: тренируйтесь по плану.'
 return <><div className="hero"><Bolt3D/></div><h1>Привет, {profile.name}</h1><p className="mu">Неделя {wk} из 8{wk%4===0?'. Разгрузка: меньше подходов.':''}</p>
 <div className="card key"><div className="mu">Тренировка дня</div>{key?<><h2 style={{margin:'4px 0'}}>{BLOCKS[key].t}</h2><p className="mu">{BLOCKS[key].d} мин · {BLOCKS[key].ex.length} упражнений</p><Link className="btn" to={`/work/${key}`}>Начать тренировку</Link></>:<h2>День отдыха</h2>}<p className="note" style={{marginTop:12}}>{tip}</p></div>
 <div className="row" style={{marginBottom:12}}>{DAYS.map((d,i)=>{const t=new Date(mon);t.setDate(mon.getDate()+i);const id=iso(t);return <div key={d} className={'day '+(ds.has(id)?'d ':'')+(id===iso(now)?'t':'')}>{d}<br/>{ds.has(id)?'✓':WEEK[i]?'·':'–'}</div>})}</div>
 <div className="grid"><div className="card"><div className="big">{full.length}</div><div className="mu">тренировок</div></div><div className="card"><div className="big">{Math.round(full.reduce((a,x)=>a+x.sec,0)/60)}</div><div className="mu">минут</div></div><div className="card"><div className="big">{st}</div><div className="mu">дней подряд</div></div></div>
 <div className="card"><div className="row sp"><span>План недели</span><span className="mu">{Math.min(wd,pl)}/{pl}</span></div><div className="bar"><i style={{width:Math.min(100,wd/pl*100)+'%'}}/></div></div>
 <div className="card"><div className="mu">Последняя тренировка</div><p style={{margin:'4px 0'}}>{last?`${last.title} · ${last.date} · ${last.done?'завершена':'не завершена'}`:'Пока нет данных'}</p></div></>}
export function Plan(){
 const wk=weekN()
 return <><h1>План на 8 недель</h1><p className="mu">Недели 4 и 8 — разгрузка. Сейчас: неделя {wk}.</p>
 {[1,2,3,4,5,6,7,8].map(w=><details key={w} className="card" open={w===wk}><summary><b>Неделя {w}</b>{w%4===0&&<span className="mu"> разгрузка</span>}</summary>
 {WEEK.map((k,i)=>k?<div key={i} style={{margin:'10px 0'}}><b>{DAYS[i]}: {BLOCKS[k].t}</b> <span className="mu">{BLOCKS[k].d} мин</span><ol>{sets(k,w).map((x,j)=><li key={j}>{EX[x.id].n}: {x.s}×{x.r}{unit(x.id)}, отдых {x.rest} с</li>)}</ol></div>:<p key={i} className="mu">{DAYS[i]}: отдых</p>)}</details>)}
 <p className="note">Разминка 5 мин и заминка 5 мин в каждой тренировке. При боли или головокружении остановитесь и сообщите взрослому.</p></>}
export function Library(){
 const [q,setQ]=useState('');const [lv,setLv]=useState(0);const [fo,setFo]=useState(false)
 const [fav,setFav]=useStore('fav',[]);const [nt,setNt]=useStore('notes',{})
 const r=Object.entries(EX).filter(([id,x])=>(x.n+x.e+x.m).toLowerCase().includes(q.toLowerCase())&&(!lv||x.lv===lv)&&(!fo||fav.includes(id)))
 return <><h1>Упражнения</h1><input placeholder="Поиск" aria-label="Поиск" value={q} onChange={e=>setQ(e.target.value)}/>
 <div className="row"><select style={{width:'auto'}} value={lv} onChange={e=>setLv(+e.target.value)}><option value={0}>Любой уровень</option><option value={1}>Уровень 1</option><option value={2}>Уровень 2</option></select>
 <label><input type="checkbox" style={{width:'auto',marginRight:6}} checked={fo} onChange={e=>setFo(e.target.checked)}/>Избранное</label></div><br/>
 {r.length?r.map(([id,x])=><details key={id} className="card"><summary><b>{x.n}</b> <span className="mu">{x.m} · ур. {x.lv}</span></summary>
 <p className="mu">{x.e}</p><ol>{x.s.map((s,i)=><li key={i}>{s}</li>)}</ol><p><b>Дыхание:</b> {x.br}<br/><b>Ошибки:</b> {x.er}<br/><b>Проще:</b> {x.ez}<br/><b>Сложнее:</b> {x.hd}</p>
 <textarea rows={2} placeholder="Личная заметка" aria-label="Заметка" value={nt[id]||''} onChange={e=>setNt({...nt,[id]:e.target.value})}/>
 <button className="btn g" onClick={()=>setFav(fav.includes(id)?fav.filter(z=>z!==id):[...fav,id])}>{fav.includes(id)?'Убрать из избранного':'В избранное'}</button></details>):<p className="mu">Ничего не найдено. Измените фильтры.</p>}</>}
export function Workout(){
 const {key}=useParams();const nav=useNavigate();const b=BLOCKS[key]
 const [s,setS]=useState(()=>{const x=load('sess',null);return x&&x.key===key?x:{key,i:0,sec:0,items:b?sets(key,weekN()).map(y=>({...y,d:Array(y.s).fill(0)})):[]}})
 const [end,setEnd]=useState(null);const [pa,setPa]=useState(null);const [now,setNow]=useState(Date.now());const [rep,setRep]=useState(null)
 const t0=useRef(Date.now());const [rpe,setRpe]=useState('');const [feel,setFeel]=useState('Хорошо');const [note,setNote]=useState('');const [err,setErr]=useState('')
 useEffect(()=>{save('sess',s)},[s])
 useEffect(()=>{if(!end)return;const id=setInterval(()=>setNow(Date.now()),250);return()=>clearInterval(id)},[end])
 if(!b)return <p>Тренировка не найдена. <Link to="/">На главную</Link></p>
 const it=s.items[s.i],ex=EX[it.id],left=end?Math.max(0,Math.ceil((end-now)/1000)):pa??it.rest
 const upd=fn=>setS(p=>{const n=structuredClone(p);fn(n);return n})
 const elapsed=()=>Math.round(s.sec+(Date.now()-t0.current)/1000)
 const to=n=>{upd(x=>{x.i+=n});setEnd(null);setPa(null)}
 const tot=s.items.reduce((a,x)=>a+x.s,0),dn=s.items.reduce((a,x)=>a+x.d.filter(v=>v===1).length,0),sk=s.items.reduce((a,x)=>a+x.d.filter(v=>v===2).length,0)
 const finish=()=>setRep({sec:elapsed()})
 if(rep){const submit=e=>{e.preventDefault();if(!(rpe>=1&&rpe<=10)){setErr('Укажите число от 1 до 10');return}
  save('hist',[...load('hist',[]),{id:Date.now(),date:iso(new Date()),title:b.t,sec:rep.sec,done:dn===tot,sets:dn,total:tot,skipped:sk,rpe:+rpe,feel,note}]);localStorage.removeItem('wf:sess');nav('/progress')}
  return <><h1>Отчёт</h1><div className="grid"><div className="card"><div className="big">{Math.round(rep.sec/60)}</div><div className="mu">минут</div></div><div className="card"><div className="big">{dn}/{tot}</div><div className="mu">подходов</div></div><div className="card"><div className="big">{sk}</div><div className="mu">пропущено</div></div></div>
  {dn<tot&&<p className="note">Тренировка выполнена не полностью и не будет засчитана как завершённая.</p>}
  <form className="card" onSubmit={submit}><label>Тяжесть (1–10)</label><input type="number" value={rpe} onChange={e=>setRpe(e.target.value)}/><div className="err">{err}</div>
  <label>Самочувствие</label><select value={feel} onChange={e=>setFeel(e.target.value)}><option>Хорошо</option><option>Нормально</option><option>Устал(а)</option></select>
  <label>Заметки</label><textarea rows={3} value={note} onChange={e=>setNote(e.target.value)}/><div className="row"><button className="btn">Сохранить</button><button type="button" className="btn g" onClick={()=>{save('sess',{...s,sec:rep.sec});nav('/')}}>Продолжить позже</button></div></form></>}
 return <><div className="row sp"><span className="mu">{b.t}</span><button className="btn g" onClick={finish}>Остановить</button></div><div className="bar" style={{margin:'10px 0'}}><i style={{width:dn/tot*100+'%'}}/></div>
 <p className="mu">Упражнение {s.i+1} из {s.items.length}</p><h1>{ex.n}</h1><p>{it.s}×{it.r}{unit(it.id)} · отдых {it.rest} с</p>
 <div className="row" style={{margin:'10px 0'}}>{it.d.map((v,i)=><button key={i} className={'set '+(v===1?'d':'')} aria-label={`Подход ${i+1}`} onClick={()=>{navigator.vibrate?.(30);upd(x=>{const c=x.items[x.i];c.d[i]=c.d[i]===1?0:1});if(v!==1){setEnd(Date.now()+it.rest*1000);setPa(null)}}}>{v===2?'–':i+1}</button>)}</div>
 <div className="card"><Ring left={left} total={it.rest}/><div className="row">
 <button className="btn" onClick={()=>{setEnd(Date.now()+left*1000);setPa(null)}}>Start</button>
 <button className="btn g" onClick={()=>{if(end){setPa(left);setEnd(null)}}}>Pause</button>
 <button className="btn g" onClick={()=>{setEnd(null);setPa(null)}}>Reset</button></div></div>
 <ol>{ex.s.map((x,i)=><li key={i}>{x}</li>)}</ol><p className="mu">Ошибки: {ex.er}</p>
 <div className="row"><button className="btn g" disabled={!s.i} onClick={()=>to(-1)}>Предыдущее</button>
 <button className="btn g" onClick={()=>{upd(x=>{const c=x.items[x.i];c.d=c.d.map(v=>v===1?1:2)});s.i===s.items.length-1?finish():to(1)}}>Пропустить</button>
 <button className="btn" onClick={()=>s.i===s.items.length-1?finish():to(1)}>{s.i===s.items.length-1?'Завершить':'Следующее'}</button></div></>}
export function Progress(){
 const H=load('hist',[]);const [from,setFrom]=useState('')
 const L=H.filter(x=>!from||x.date>=from)
 const by={};L.filter(x=>x.done).forEach(x=>{const d=new Date(x.date);d.setDate(d.getDate()-((d.getDay()+6)%7));const k=iso(d).slice(5);by[k]=(by[k]||0)+Math.round(x.sec/60)})
 const data=Object.entries(by).sort().slice(-8).map(([w,m])=>({w,m}))
 if(!H.length)return <><h1>Прогресс</h1><div className="card"><p className="mu">Пока нет тренировок. Данные появятся после первой сессии.</p><Link className="btn" to="/">На главную</Link></div></>
 return <><h1>Прогресс</h1><label>С даты</label><input type="date" value={from} onChange={e=>setFrom(e.target.value)}/>
 <div className="card"><b>Минуты по неделям</b><p className="mu">Измеренные данные</p><div style={{height:180}}><ResponsiveContainer><BarChart data={data}><XAxis dataKey="w" stroke="#8B93A7"/><YAxis stroke="#8B93A7"/><Tooltip/><Bar dataKey="m" fill="#FFC83D" radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div></div>
 <h2>История</h2>{L.slice().reverse().map(x=><div key={x.id} className="card"><div className="row sp"><b>{x.title}</b><span className="mu">{x.date}</span></div><p className="mu">{x.done?'Завершена':'Не завершена'} · {Math.round(x.sec/60)} мин · {x.sets}/{x.total} подходов<br/>Самооценка: {x.rpe}/10, {x.feel}</p>{x.note&&<p>{x.note}</p>}</div>)}</>}
export function Goals(){
 const [g,setG]=useStore('goals',[]);const [f,setF]=useState({title:'',target:'',due:''});const [e,setE]=useState('')
 const add=ev=>{ev.preventDefault();if(!f.title.trim()||!(f.target>0)||!f.due){setE('Заполните название, цель (больше 0) и срок');return}setE('');setG([...g,{id:Date.now(),title:f.title.trim(),target:+f.target,due:f.due,cur:0}]);setF({title:'',target:'',due:''})}
 const ch=(id,d)=>setG(g.map(x=>x.id===id?{...x,cur:Math.max(0,x.cur+d)}:x))
 return <><h1>Цели</h1><form className="card" onSubmit={add} noValidate><label>Название</label><input value={f.title} onChange={x=>setF({...f,title:x.target.value})}/><label>Целевой результат</label><input type="number" value={f.target} onChange={x=>setF({...f,target:x.target.value})}/><label>Срок</label><input type="date" value={f.due} onChange={x=>setF({...f,due:x.target.value})}/><div className="err">{e}</div><button className="btn">Добавить цель</button></form>
 {!g.length&&<p className="mu">Целей пока нет. Добавьте первую выше.</p>}
 {g.map(x=><div key={x.id} className="card"><div className="row sp"><b>{x.title}</b><span className="mu">до {x.due}</span></div><div className="bar" style={{margin:'8px 0'}}><i style={{width:Math.min(100,x.cur/x.target*100)+'%'}}/></div><div className="row sp"><span>{x.cur} / {x.target}</span><span className="row"><button className="btn g" onClick={()=>ch(x.id,-1)} aria-label="Минус">−</button><button className="btn g" onClick={()=>ch(x.id,1)} aria-label="Плюс">+</button><button className="btn g" onClick={()=>setG(g.filter(z=>z.id!==x.id))}>Удалить</button></span></div></div>)}</>}
export function Recovery(){
 const [R,setR]=useStore('rc',{});const t=iso(new Date());const c=R[t]||{};const [f,setF]=useState({sleep:c.sleep??'',fat:c.fat??'',rd:c.rd??''});const [e,setE]=useState('');const [ok,setOk]=useState(false)
 const go=ev=>{ev.preventDefault();if(!(f.sleep>=0&&f.sleep<=16&&f.sleep!=='')||!(f.fat>=1&&f.fat<=5)||!(f.rd>=1&&f.rd<=5)){setE('Сон 0–16 ч, усталость и готовность 1–5');return}setE('');setR({...R,[t]:{sleep:+f.sleep,fat:+f.fat,rd:+f.rd}});setOk(true)}
 return <><h1>Восстановление</h1><form className="card" onSubmit={go} noValidate>{[['sleep','Сон (часов)'],['fat','Усталость (1–5)'],['rd','Готовность тренироваться (1–5)']].map(([k,l])=><div key={k}><label>{l}</label><input type="number" step="0.5" value={f[k]} onChange={x=>setF({...f,[k]:x.target.value})}/></div>)}<div className="err">{e}</div><button className="btn">Сохранить отметку</button>{ok&&<span className="mu"> Сохранено</span>}</form>
 <div className="card"><b>Дыхание 4-6</b><p className="mu">Вдох 4 с, выдох 6 с, 5 циклов, сидя и расслабив плечи.</p></div>
 <p className="note">При боли, головокружении или необычных симптомах остановитесь и сообщите взрослому или обратитесь к врачу.</p></>}
export function Settings({theme,setTheme,onReset}){
 const [c,setC]=useState(false);const [m,setM]=useState('')
 const csv=()=>{const H=load('hist',[]);if(!H.length){setM('История пуста.');return}
  const rows=[['date','title','completed','minutes','sets_done','sets_total','rpe','feel','note'],...H.map(x=>[x.date,x.title,x.done,Math.round(x.sec/60),x.sets,x.total,x.rpe,x.feel,x.note])]
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n')],{type:'text/csv'}));a.download='zeus.csv';a.click();setM('Файл скачан.')}
 return <><h1>Настройки</h1><div className="card"><label>Тема</label><select value={theme} onChange={e=>setTheme(e.target.value)}><option value="dark">Тёмная</option><option value="light">Светлая</option></select></div>
 <div className="card"><button className="btn g" onClick={csv}>Экспорт истории в CSV</button> <span className="mu">{m}</span></div>
 <div className="card"><p className="mu">Удалит профиль, историю и заметки на этом устройстве.</p>{c?<div className="row"><span>Точно удалить?</span><button className="btn" onClick={()=>{clearAll();onReset()}}>Да, удалить</button><button className="btn g" onClick={()=>setC(false)}>Отмена</button></div>:<button className="btn g" onClick={()=>setC(true)}>Удалить все данные</button>}</div></>}
