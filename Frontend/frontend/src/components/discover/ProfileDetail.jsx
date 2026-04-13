// src/components/discover/ProfileDetail.jsx
import { useEffect, useRef } from 'react'

const GALLERY_BG = ['#ede8ff','#dbeafe','#d1fae5','#fef3c7','#ffe4e6','#fce7f3']
const GALLERY_H  = [130, 168, 146, 178, 136, 158]

export default function ProfileDetail({ profile }) {
  const ref = useRef()
  useEffect(() => { if(ref.current) ref.current.scrollTop = 0 }, [profile.id])

  return (
    <div style={s.section}>

      <SectionLabel>// bio</SectionLabel>
      <Card>
        <CardTitle>About</CardTitle>
        <p style={s.bioText}>{profile.bio}</p>
        {profile.github && (
          <div style={s.ghRow}>
            <span style={s.ghIcon}>⬡</span>
            <span style={s.ghText}>{profile.github}</span>
          </div>
        )}
      </Card>

      <SectionLabel>// quick.info</SectionLabel>
      <Card>
        <CardTitle>Quick Info</CardTitle>
        <div style={s.infoGrid}>
          {[
            { k:'Experience', v:profile.experience },
            { k:'Location',   v:profile.location   },
            { k:'Philosophy', v:profile.philosophy  },
            { k:'Open Source',v:profile.openSource  },
          ].map(({k,v})=>(
            <div key={k} style={s.infoItem}>
              <div style={s.infoKey}>{k}</div>
              <div style={s.infoVal}>{v}</div>
            </div>
          ))}
        </div>
      </Card>

      <SectionLabel>// tech.stack</SectionLabel>
      <Card>
        <CardTitle>Stack</CardTitle>
        <div style={s.stackRow}>
          {profile.stack.map((t,i)=>(
            <span key={t} style={s.techBadge}>
              <span style={{ ...s.techDot, background: profile.stackColors[i] }}/>
              {t}
            </span>
          ))}
        </div>
      </Card>

      <SectionLabel>// compatibility.score</SectionLabel>
      <Card>
        <CardTitle>Match Analysis</CardTitle>
        <div style={s.compatWrap}>
          <CompatBar label="Tech Stack"   pct={profile.compat.stack}/>
          <CompatBar label="Work Vibe"    pct={profile.compat.vibe}/>
          <CompatBar label="Collab Style" pct={profile.compat.collab}/>
        </div>
      </Card>

      <SectionLabel>// gallery</SectionLabel>
      <Card>
        <CardTitle>Photos</CardTitle>
        <div style={s.masonry}>
          {profile.photos.map((ph,i)=>(
            <div key={i} style={{ ...s.galleryItem, height: GALLERY_H[i%GALLERY_H.length], background: ph.bg||GALLERY_BG[i%GALLERY_BG.length] }}>
              <span style={s.galleryEmoji}>{ph.emoji}</span>
              <span style={s.galleryLabel}>{ph.caption}</span>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ height:52 }}/>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={s.label}>
      <span>{children}</span>
      <div style={s.labelLine}/>
    </div>
  )
}
function Card({ children }) {
  return <div style={s.card}>{children}</div>
}
function CardTitle({ children }) {
  return (
    <div style={s.cardTitle}>
      <span style={s.titleBar}/>
      {children}
    </div>
  )
}
function CompatBar({ label, pct }) {
  return (
    <div style={s.compatRow}>
      <div style={s.compatLabel}>{label}</div>
      <div style={s.barBg}>
        <div style={{ ...s.barFill, width:`${pct}%` }}/>
      </div>
      <div style={s.compatPct}>{pct}%</div>
    </div>
  )
}

const s = {
  section: { padding:'24px 28px', background:'white' },

  label: {
    fontFamily:'var(--mono)', fontSize:10, color:'#8b7eb8',
    textTransform:'uppercase', letterSpacing:'1.1px',
    marginBottom:12, display:'flex', alignItems:'center', gap:8,
  },
  labelLine: { flex:1, height:1, background:'#ede9fe' },

  card: {
    background:'white', border:'1px solid #ede9fe',
    borderRadius:16, padding:'18px 20px',
    marginBottom:14,
    boxShadow:'0 1px 8px rgba(139,92,246,0.06)',
  },
  cardTitle: {
    fontSize:11, fontWeight:700, color:'#8b7eb8',
    textTransform:'uppercase', letterSpacing:'0.8px',
    fontFamily:'var(--mono)', marginBottom:12,
    display:'flex', alignItems:'center', gap:7,
  },
  titleBar: {
    display:'inline-block', width:3, height:12,
    borderRadius:2, background:'#8b5cf6', flexShrink:0,
  },
  bioText: { fontSize:15, lineHeight:1.8, color:'#2e1065' },
  ghRow: { display:'flex', alignItems:'center', gap:7, marginTop:12, color:'#8b5cf6' },
  ghIcon: { fontSize:15 },
  ghText: { fontFamily:'var(--mono)', fontSize:12 },

  infoGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 },
  infoItem: {
    background:'#faf9ff', border:'1px solid #ede9fe',
    borderRadius:10, padding:'11px 13px',
  },
  infoKey: {
    fontFamily:'var(--mono)', fontSize:9, color:'#8b7eb8',
    textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4,
  },
  infoVal: { fontSize:13, fontWeight:600, color:'#2e1065' },

  stackRow: { display:'flex', flexWrap:'wrap', gap:7 },
  techBadge: {
    display:'inline-flex', alignItems:'center', gap:5,
    fontFamily:'var(--mono)', fontSize:11,
    padding:'5px 10px', borderRadius:8,
    border:'1px solid #ede9fe',
    background:'#faf9ff', color:'#5b21b6',
    transition:'all 0.2s',
  },
  techDot: { width:6, height:6, borderRadius:'50%', flexShrink:0 },

  compatWrap: { display:'flex', flexDirection:'column', gap:12 },
  compatRow:  { display:'flex', alignItems:'center', gap:10 },
  compatLabel:{ fontSize:12, color:'#8b7eb8', width:100, flexShrink:0 },
  barBg: { flex:1, height:6, background:'#ede8ff', borderRadius:3, overflow:'hidden' },
  barFill: {
    height:'100%', borderRadius:3,
    background:'linear-gradient(90deg,#a78bfa,#8b5cf6)',
    transition:'width 1.3s cubic-bezier(0.16,1,0.3,1)',
  },
  compatPct: { fontFamily:'var(--mono)', fontSize:12, color:'#8b5cf6', width:34, textAlign:'right', flexShrink:0 },

  masonry: { columns:3, gap:8 },
  galleryItem: {
    breakInside:'avoid', marginBottom:8,
    borderRadius:10,
    border:'1px solid rgba(255,255,255,0.6)',
    cursor:'pointer', transition:'all 0.2s',
    display:'flex', flexDirection:'column',
    alignItems:'center', justifyContent:'center', gap:6,
    overflow:'hidden',
  },
  galleryEmoji: { fontSize:28 },
  galleryLabel: {
    fontSize:9, color:'rgba(255,255,255,0.8)',
    fontFamily:'var(--mono)', paddingBottom:7,
    textShadow:'0 1px 4px rgba(0,0,0,0.25)',
  },
}