// @ts-nocheck
/* eslint-disable */
import { motion } from 'framer-motion'
import { useFunnel } from '../store/funnel'

const M = motion as any
const f = "'Clash Display','Unbounded',sans-serif"

const SPORTS = [
  {id:'football',label:'Футбол',sub:'EPL · La Liga · UCL'},
  {id:'tennis',label:'Теннис',sub:'ATP · WTA · Grand Slam'},
  {id:'basket',label:'Баскетбол',sub:'NBA · EuroLeague'},
  {id:'cs2',label:'CS2',sub:'Majors · IEM · ESL'},
  {id:'hockey',label:'Хоккей',sub:'NHL · KHL · IIHF'},
]
const STAKES = [
  {value:12,label:'Мелко',sub:'До €20 за ставку',range:'€5 — 20'},
  {value:50,label:'Средне',sub:'Рабочий банк',range:'€20 — 100'},
  {value:200,label:'Крупно',sub:'Опытный игрок',range:'€100+'},
]
const EXPS = [
  {id:'rookie',label:'Новичок',sub:'Меньше года'},
  {id:'player',label:'Середняк',sub:'1 — 3 года'},
  {id:'predator',label:'Хищник',sub:'3+ лет · ROI+'},
]

function Bar({step}:{step:number}) {
  return (
    <div className="flex gap-[5px] mb-7">
      {[1,2,3].map(i=>(
        <div key={i} className="flex-1 h-[2.5px] rounded-sm overflow-hidden" style={{background:'rgba(255,255,255,.1)'}}>
          <M.div className="h-full rounded-sm" style={{background:'linear-gradient(90deg,#7C3AED,#A78BFA)',transformOrigin:'left'}}
            initial={{scaleX:0}} animate={{scaleX:i<=step?1:0}} transition={{duration:.5}} />
        </div>
      ))}
    </div>
  )
}

function Row({label,sub,right,onClick}:{label:string;sub:string;right?:string;onClick:()=>void}) {
  return (
    <M.div whileTap={{scale:.985,x:2}} onClick={onClick}
      className="flex items-center gap-4 px-5 py-4 rounded-[14px] cursor-pointer"
      style={{background:'#18152A',border:'1px solid rgba(255,255,255,.08)'}}>
      <div className="flex-1 min-w-0">
        <div style={{fontFamily:f,fontWeight:700,fontSize:17,letterSpacing:'-.018em',lineHeight:1.2}}>{label}</div>
        <div className="text-[12px] mt-[2px]" style={{color:'rgba(255,255,255,.45)'}}>{sub}</div>
      </div>
      {right
        ? <div className="font-mono font-bold text-[13px]" style={{color:'#A78BFA'}}>{right}</div>
        : <div className="text-[18px]" style={{color:'#A78BFA'}}>›</div>}
    </M.div>
  )
}

function CalibLayout({step,q,accent,children}:{step:number;q:string;accent:string;children:React.ReactNode}) {
  return (
    <M.div initial={{opacity:0,x:40}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-40}}
      transition={{duration:.35}} className="h-full flex flex-col px-5 pt-[76px] pb-6" style={{background:'#04020D'}}>
      <Bar step={step} />
      <div className="font-mono text-[10px] font-semibold tracking-[.4em] uppercase mb-3" style={{color:'#A78BFA'}}>
        Вопрос 0{step} / 03
      </div>
      <h2 style={{fontFamily:f,fontWeight:700,fontSize:'clamp(34px,10vw,42px)',lineHeight:.96,letterSpacing:'.01em',marginBottom:32}}
        dangerouslySetInnerHTML={{__html:q.replace('%%',`<span style="color:#A78BFA">${accent}</span>`)}} />
      <div className="flex flex-col gap-[10px] overflow-y-auto">{children}</div>
    </M.div>
  )
}

export function CalibSport() {
  const {go,setSport} = useFunnel()
  const pick = (id:string) => { setSport(id); setTimeout(()=>go('calib-stake'),280) }
  return (
    <CalibLayout step={1} q="Какой спорт %%" accent="твой?">
      {SPORTS.map(s=><Row key={s.id} label={s.label} sub={s.sub} onClick={()=>pick(s.id)} />)}
    </CalibLayout>
  )
}
export function CalibStake() {
  const {go,setStake} = useFunnel()
  const pick = (v:number) => { setStake(v); setTimeout(()=>go('calib-exp'),280) }
  return (
    <CalibLayout step={2} q="Как %%" accent="ставишь?">
      {STAKES.map(s=><Row key={s.value} label={s.label} sub={s.sub} right={s.range} onClick={()=>pick(s.value)} />)}
    </CalibLayout>
  )
}
export function CalibExp() {
  const {go,setExp} = useFunnel()
  const pick = (id:string) => { setExp(id); setTimeout(()=>go('loading'),280) }
  return (
    <CalibLayout step={3} q="%% играешь?" accent="Сколько">
      {EXPS.map(e=><Row key={e.id} label={e.label} sub={e.sub} onClick={()=>pick(e.id)} />)}
    </CalibLayout>
  )
}
