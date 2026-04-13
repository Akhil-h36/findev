// src/components/discover/ChatPanel.jsx
import { useState, useRef, useEffect } from 'react'

const REPLIES = [
  "Ha that's exactly what I was thinking 😄",
  "Interesting! Have you tried useCallback here?",
  "Yes!! That's such a clean pattern",
  "Wait — bun or npm for this project?",
  "This is why I love TypeScript tbh 😌",
  "Let's hop on a quick video call to discuss?",
  "Your take on monorepos is spot on",
  "Have you seen the new React 19 compiler?",
]
const rand = arr => arr[Math.floor(Math.random()*arr.length)]

export default function ChatPanel({ profile, onClose }) {
  const [msgs,   setMsgs]   = useState(profile.messages||[])
  const [input,  setInput]  = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef()

  useEffect(()=>{ setMsgs(profile.messages||[]) }, [profile.id])
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) }, [msgs, typing])

  const send = () => {
    const text = input.trim()
    if (!text) return
    setMsgs(m=>[...m, {from:'me', text}])
    setInput('')
    setTyping(true)
    setTimeout(()=>{
      setTyping(false)
      setMsgs(m=>[...m, {from:'them', text:rand(REPLIES)}])
    }, 1000+Math.random()*700)
  }

  const onKey = e => { if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); send() }}

  return (
    <div style={s.panel}>

      {/* Header */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={onClose}>←</button>
        <div style={s.headerAvWrap}>
          <div style={{ ...s.headerAv, background:profile.color||'#ddd6fe' }}>{profile.initials[0]}</div>
          <span style={s.onlineDot}/>
        </div>
        <div style={s.headerInfo}>
          <div style={s.headerName}>{profile.name}</div>
          <div style={s.headerStatus}>● active now</div>
        </div>
        <div style={s.headerBtns}>
          <HeaderBtn icon="⏺" label="Video"/>
          <HeaderBtn icon="⬡" label="GitHub"/>
        </div>
      </div>

      {/* Stack strip */}
      {profile.stack?.length>0 && (
        <div style={s.strip}>
          <span style={s.stripLabel}>common stack</span>
          {profile.stack.slice(0,4).map(t=><span key={t} style={s.stripTag}>{t}</span>)}
        </div>
      )}

      {/* Messages */}
      <div style={s.msgs}>
        {msgs.length===0 && (
          <div style={s.emptyState}>
            <div style={{ ...s.emptAv, background:profile.color||'#ddd6fe' }}>{profile.initials[0]}</div>
            <div style={s.emptyTitle}>Matched with {profile.name} 🎉</div>
            <div style={s.emptySub}>You both liked each other. Be the first to say hello!</div>
            <button style={s.iceBreaker} onClick={()=>setInput("Hey! Our stacks are so similar — have you explored GraphQL subscriptions? 👋")}>
              💡 Try an ice-breaker
            </button>
          </div>
        )}

        {msgs.map((m,i)=><Bubble key={i} msg={m} profile={profile}/>)}

        {typing && (
          <div style={s.msgRow}>
            <div style={{ ...s.msgAv, background:profile.color||'#ddd6fe' }}>{profile.initials[0]}</div>
            <div style={{ ...s.bubble, ...s.bubbleThem }}><Dots/></div>
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {/* Input */}
      <div style={s.inputArea}>
        <textarea
          style={s.textarea}
          placeholder={`Message ${profile.name}...`}
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={onKey}
          rows={1}
        />
        <button style={{ ...s.sendBtn, opacity:input.trim()?1:0.4 }} onClick={send} disabled={!input.trim()}>
          ↑
        </button>
      </div>
    </div>
  )
}

function HeaderBtn({ icon, label }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      style={{ ...s.hBtn, ...(hov?s.hBtnHov:{}) }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
    >
      {icon} {label}
    </button>
  )
}

function Bubble({ msg, profile }) {
  const isMe = msg.from==='me'
  return (
    <div style={{ ...s.msgRow, ...(isMe?s.msgRowMe:{}) }}>
      {!isMe && <div style={{ ...s.msgAv, background:profile.color||'#ddd6fe' }}>{profile.initials[0]}</div>}
      <div style={{ ...s.bubble, ...(isMe?s.bubbleMe:s.bubbleThem) }}>{msg.text}</div>
    </div>
  )
}

function Dots() {
  return (
    <div style={{ display:'flex', gap:4, padding:'3px 2px', alignItems:'center' }}>
      {[0,1,2].map(i=>(
        <div key={i} style={{
          width:6, height:6, borderRadius:'50%', background:'#a78bfa',
          animation:`pulse 1.2s ease ${i*0.2}s infinite`,
        }}/>
      ))}
    </div>
  )
}

const s = {
  panel: {
    display:'flex', flexDirection:'column',
    height:'100%', background:'white',
    animation:'fadeIn 0.25s ease',
  },
  header: {
    background:'white', borderBottom:'1px solid #ede9fe',
    padding:'13px 20px',
    display:'flex', alignItems:'center', gap:11, flexShrink:0,
    boxShadow:'0 1px 0 #ede9fe',
  },
  backBtn: {
    background:'#faf9ff', border:'1px solid #ede9fe',
    borderRadius:9, padding:'6px 11px',
    cursor:'pointer', fontSize:17, color:'#8b5cf6',
    fontFamily:'var(--sans)', transition:'all 0.2s',
    fontWeight:500,
  },
  headerAvWrap: { position:'relative', flexShrink:0 },
  headerAv: {
    width:40, height:40, borderRadius:'50%',
    border:'2px solid rgba(255,255,255,0.9)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:16, fontWeight:700, color:'#4c1d95',
    boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
  },
  onlineDot: {
    position:'absolute', bottom:0, right:0,
    width:10, height:10, borderRadius:'50%',
    background:'#10b981', border:'2px solid white', display:'block',
  },
  headerInfo: { flex:1 },
  headerName: { fontSize:15, fontWeight:700, color:'#2e1065' },
  headerStatus: { fontFamily:'var(--mono)', fontSize:10, color:'#10b981' },
  headerBtns: { display:'flex', gap:7 },
  hBtn: {
    background:'#faf9ff', border:'1px solid #ede9fe',
    borderRadius:8, padding:'6px 11px',
    cursor:'pointer', fontSize:11, fontWeight:600, color:'#5b21b6',
    display:'flex', alignItems:'center', gap:5,
    fontFamily:'var(--sans)', transition:'all 0.2s',
  },
  hBtnHov: { background:'#ede8ff', borderColor:'#c4b5fd', color:'#6d28d9' },

  strip: {
    background:'#faf9ff', borderBottom:'1px solid #ede9fe',
    padding:'7px 20px',
    display:'flex', alignItems:'center', gap:7, flexShrink:0, flexWrap:'wrap',
  },
  stripLabel: { fontFamily:'var(--mono)', fontSize:9, color:'#8b7eb8', letterSpacing:'0.5px' },
  stripTag: {
    fontFamily:'var(--mono)', fontSize:10,
    padding:'2px 8px', borderRadius:20,
    border:'1px solid #ddd6fe',
    background:'white', color:'#5b21b6',
  },

  msgs: {
    flex:1, overflowY:'auto', padding:18,
    display:'flex', flexDirection:'column', gap:10,
  },
  emptyState: {
    display:'flex', flexDirection:'column', alignItems:'center',
    justifyContent:'center', padding:'40px 20px', gap:10, textAlign:'center',
  },
  emptAv: {
    width:68, height:68, borderRadius:'50%',
    border:'3px solid #ddd6fe',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:24, fontWeight:700, color:'#4c1d95',
    boxShadow:'0 4px 16px rgba(139,92,246,0.15)',
    marginBottom:4,
  },
  emptyTitle: { fontSize:17, fontWeight:700, color:'#2e1065' },
  emptySub:   { fontSize:13, color:'#8b7eb8', lineHeight:1.65 },
  iceBreaker: {
    marginTop:6, background:'#ede8ff',
    border:'1px solid #c4b5fd', borderRadius:20,
    padding:'8px 18px', fontSize:13, fontWeight:600,
    color:'#6d28d9', cursor:'pointer', fontFamily:'var(--sans)',
    transition:'all 0.2s',
  },

  msgRow: { display:'flex', gap:8, alignItems:'flex-end' },
  msgRowMe: { flexDirection:'row-reverse' },
  msgAv: {
    width:28, height:28, borderRadius:'50%', flexShrink:0,
    border:'1.5px solid rgba(255,255,255,0.8)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:11, fontWeight:700, color:'#4c1d95',
    boxShadow:'0 1px 4px rgba(0,0,0,0.08)',
  },
  bubble: {
    maxWidth:'66%', padding:'9px 14px',
    borderRadius:18, fontSize:14, lineHeight:1.5,
  },
  bubbleThem: {
    background:'#faf9ff', border:'1px solid #ede9fe',
    color:'#2e1065', borderBottomLeftRadius:4,
  },
  bubbleMe: {
    background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    color:'white', borderBottomRightRadius:4,
    boxShadow:'0 2px 12px rgba(109,40,217,0.25)',
  },

  inputArea: {
    background:'white', borderTop:'1px solid #ede9fe',
    padding:'12px 18px',
    display:'flex', gap:9, alignItems:'flex-end', flexShrink:0,
  },
  textarea: {
    flex:1, background:'#faf9ff', border:'1.5px solid #ede9fe',
    borderRadius:13, padding:'10px 14px',
    fontFamily:'var(--sans)', fontSize:14, color:'#2e1065',
    outline:'none', resize:'none', transition:'all 0.2s',
    minHeight:40, maxHeight:96,
  },
  sendBtn: {
    width:38, height:38, borderRadius:11, flexShrink:0,
    background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    border:'none', cursor:'pointer',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:17, color:'white', transition:'all 0.2s',
    boxShadow:'0 2px 10px rgba(109,40,217,0.3)',
  },
}