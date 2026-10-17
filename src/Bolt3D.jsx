import {useEffect,useRef} from 'react'
import * as THREE from 'three'
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js'
export default function Bolt3D(){
 const ref=useRef(null)
 useEffect(()=>{
  const el=ref.current;if(!el)return
  let r;try{r=new THREE.WebGLRenderer({antialias:true,alpha:true})}catch{return}
  r.setPixelRatio(Math.min(window.devicePixelRatio,2));r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.1
  el.appendChild(r.domElement)
  const sc=new THREE.Scene(),pm=new THREE.PMREMGenerator(r),env=new RoomEnvironment()
  sc.environment=pm.fromScene(env,0.04).texture
  const cam=new THREE.PerspectiveCamera(32,1,.1,50);cam.position.set(0,0,10.5)
  const sh=new THREE.Shape();[[1,3],[-1.5,-.2],[-.2,-.2],[-1,-3],[1.6,.4],[.3,.4]].forEach(([x,y],i)=>i?sh.lineTo(x,y):sh.moveTo(x,y))
  const geo=new THREE.ExtrudeGeometry(sh,{depth:.5,bevelEnabled:true,bevelThickness:.14,bevelSize:.1,bevelSegments:8});geo.center()
  const mat=new THREE.MeshStandardMaterial({color:new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--ac').trim()||'#FFC83D'),metalness:1,roughness:.24,envMapIntensity:1.25})
  const m=new THREE.Mesh(geo,mat);sc.add(m)
  const size=()=>{const w=el.clientWidth,h=el.clientHeight;r.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix()};size()
  const ro=new ResizeObserver(size);ro.observe(el)
  const calm=window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let px=0,py=0,raf;const mv=e=>{px=e.clientX/innerWidth-.5;py=e.clientY/innerHeight-.5};addEventListener('pointermove',mv)
  const loop=t=>{const s=t/1000;m.rotation.y+=((calm?.35:Math.sin(s*.7)*.55+px*.9)-m.rotation.y)*.06;m.rotation.x+=((calm?0:py*.5)-m.rotation.x)*.06;m.position.y=calm?0:Math.sin(s*1.2)*.12;r.render(sc,cam);raf=requestAnimationFrame(loop)}
  raf=requestAnimationFrame(loop)
  return()=>{cancelAnimationFrame(raf);removeEventListener('pointermove',mv);ro.disconnect();geo.dispose();mat.dispose();sc.environment?.dispose();pm.dispose();env.dispose();r.dispose();r.domElement.remove()}
 },[])
 return <div ref={ref} style={{width:'100%',height:'100%'}} aria-hidden="true"/>
}
