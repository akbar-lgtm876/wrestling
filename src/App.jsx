import {Page,useFx} from './fx.jsx'
import {useEffect} from 'react'
import {HashRouter,Routes,Route,NavLink,Navigate} from 'react-router-dom'
import {useStore} from './store'
import {Setup,Dashboard,Plan,Library,Workout,Progress,Recovery,Goals,Settings} from './pages.jsx'
import {Rounds,Sleep,Badges,Journal} from './extra.jsx'
import {More,Backup,Rank,Test,Builder,Challenge,Events,Check} from './extra2.jsx'
export default function App(){
 const [profile,setProfile]=useStore('profile',null)
 const [theme,setTheme]=useStore('theme','dark')
 const [accent,setAccent]=useStore('accent','gold')
 useFx()
 useEffect(()=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.accent=accent},[theme,accent])
 const bolt=<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6z" fill="var(--ac)"/></svg>
 if(!profile)return <><div className="top">{bolt}ZEUS</div><div className="meander"/><main><Setup onDone={setProfile}/></main></>
 const R=[['/',<Dashboard profile={profile}/>],['/plan',<Plan/>],['/lib',<Library/>],['/work/:key',<Workout/>],['/rounds',<Rounds/>],['/progress',<Progress/>],['/goals',<Goals/>],['/rec',<Recovery/>],['/sleep',<Sleep/>],['/badges',<Badges/>],['/journal',<Journal/>],['/more',<More accent={accent} setAccent={setAccent}/>],['/backup',<Backup/>],['/rank',<Rank/>],['/test',<Test/>],['/builder',<Builder/>],['/challenge',<Challenge/>],['/events',<Events/>],['/check',<Check/>],['/set',<Settings theme={theme} setTheme={setTheme} onReset={()=>setProfile(null)}/>]]
 return <HashRouter><div className="top">{bolt}ZEUS</div><div className="meander"/><main><Page><Routes>{R.map(([p,e])=><Route key={p} path={p} element={e}/>)}<Route path="*" element={<Navigate to="/"/>}/></Routes></Page></main>
 <nav aria-label="Навигация">{[['/','Главная'],['/plan','План'],['/rounds','Раунды'],['/lib','Упражн.'],['/progress','Прогресс'],['/more','Ещё']].map(([t,l])=><NavLink key={t} to={t} end={t==='/'}>{l}</NavLink>)}</nav></HashRouter>
}
