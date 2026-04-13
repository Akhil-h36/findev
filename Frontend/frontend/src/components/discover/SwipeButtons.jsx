// src/components/discover/SwipeButtons.jsx
import { useState } from 'react'

export default function SwipeButtons({ onLike, onReject, onSuperLike }) {
  return (
    <div style={s.wrap}>
      <Btn onClick={onReject}    icon="✕" label="Reject"    kbd="Shift"
        size="lg" restBg="#fff0f3" restBorder="#fda4af" restColor="#f43f5e"
        hoverBg="#f43f5e" tiltDir={-1} />

      <Btn onClick={onSuperLike} icon="★" label="Super"
        size="sm" restBg="#fffbeb" restBorder="#fcd34d" restColor="var(--accent-amber)"
        hoverBg="var(--accent-amber)" tiltDir={0} />

      <Btn onClick={onLike}      icon="♥" label="Like"     kbd="Enter"
        size="lg" restBg="var(--pastel-purple)" restBorder="var(--purple-light)" restColor="var(--purple)"
        hoverBg="var(--purple)" tiltDir={1} />
    </div>
  )
}

function Btn({ onClick, icon, label, kbd, size, restBg, restBorder, restColor, hoverBg, tiltDir }) {
  const [hov, setHov] = useState(false)
  const dim = size === 'lg' ? 54 : 38
  const fs  = size === 'lg' ? 22 : 16
  const rot = hov && tiltDir !== 0 ? `scale(1.12) rotate(${tiltDir * 12}deg)` : hov ? 'scale(1.12)' : 'scale(1)'

  return (
    <div style={s.btn} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick}>
      <div style={{
        ...s.circle,
        width: dim, height: dim, fontSize: fs,
        background:  hov ? hoverBg    : restBg,
        borderColor: hov ? hoverBg    : restBorder,
        color:       hov ? 'white'    : restColor,
        transform: rot,
        boxShadow: hov ? `0 6px 22px ${hov && hoverBg.startsWith('#') ? hoverBg+'55' : 'rgba(139,92,246,0.3)'}` : 'none',
      }}>
        {icon}
      </div>
      <span style={s.label}>{label}</span>
      {kbd && <span style={s.kbd}>{kbd}</span>}
    </div>
  )
}

const s = {
  wrap: {
    display:'flex', alignItems:'center', justifyContent:'center',
    gap:22, padding:'18px 0 14px',
    background:'white',
    borderBottom:'1px solid var(--border-light)',
    position:'sticky', top:0, zIndex:50,
  },
  btn: {
    display:'flex', flexDirection:'column', alignItems:'center',
    gap:5, cursor:'pointer', userSelect:'none',
  },
  circle: {
    borderRadius:'50%',
    display:'flex', alignItems:'center', justifyContent:'center',
    border:'2px solid',
    transition:'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
  },
  label: {
    fontFamily:'var(--mono)', fontSize:10, fontWeight:600,
    color:'var(--text-muted)', letterSpacing:0.4, textTransform:'uppercase',
  },
  kbd: {
    fontFamily:'var(--mono)', fontSize:9, color:'var(--text-faint)',
    background:'var(--surface)', border:'1px solid var(--border-light)',
    padding:'1px 6px', borderRadius:4,
  },
}