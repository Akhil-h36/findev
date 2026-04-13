// src/components/discover/Sidebar.jsx
import { useState } from 'react'

export default function Sidebar({ sideTab, setSideTab, likedUsers, matched, chatProfile, onOpenChat, onCloseChat }) {
  const newCount = likedUsers.filter(u => u.isNew).length

  return (
    <aside style={s.sidebar}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logoMark}>&lt;/&gt;</div>
        <span style={s.logoText}>DevMatch</span>
        <div style={s.statusPill}>
          <span style={s.statusDot}/>
          <span>42 online</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        <Tab label="Liked"   count={newCount}       active={sideTab==='liked'}   onClick={()=>{ setSideTab('liked'); onCloseChat() }}/>
        <Tab label="Matched" count={matched.length} active={sideTab==='matched'} onClick={()=>setSideTab('matched')}/>
      </div>

      {/* Content */}
      <div style={s.content}>
        {sideTab === 'liked'
          ? <LikedSection   users={likedUsers} onOpen={onOpenChat}/>
          : <MatchedSection matched={matched}  activeChatId={chatProfile?.id} onOpen={onOpenChat}/>
        }
      </div>
    </aside>
  )
}

function Tab({ label, count, active, onClick }) {
  return (
    <button onClick={onClick} style={{ ...s.tab, ...(active ? s.tabActive : {}) }}>
      {label}
      {count > 0 && <span style={{ ...s.badge, ...(active ? s.badgeActive : {}) }}>{count}</span>}
      {active && <span style={s.underline}/>}
    </button>
  )
}

function LikedSection({ users, onOpen }) {
  return (
    <>
      <div style={s.sectionLabel}>
        <span style={s.sectionLabelCode}>// new.likes</span>
        <span style={s.sectionLabelCount}>{users.filter(u=>u.isNew).length} new</span>
      </div>
      <div style={s.likedGrid}>
        {users.map(u => <LikedCard key={u.id} user={u} onOpen={onOpen}/>)}
      </div>
    </>
  )
}

function LikedCard({ user, onOpen }) {
  const [hov, setHov] = useState(false)
  const fp = {
    id:user.id, name:user.name, initials:user.initials,
    color:user.color, stack:user.stack.split(' · '),
    messages:[
      { from:'them', text:`Hey! I loved your profile 👋 Your stack is amazing!` },
      { from:'me',   text:`Thanks! Your ${user.stack} combo looks super interesting` },
    ],
  }
  return (
    <div
      style={{ ...s.likedCard, ...(hov?s.likedCardHov:{}) }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>onOpen(fp)}
    >
      {user.isNew && <span style={s.newDot}/>}
      <div style={{ ...s.likedAv, background: user.color }}>{user.initials[0]}</div>
      <div style={s.likedName}>{user.name}</div>
      <div style={s.likedStack}>{user.stack}</div>
      <div style={s.likedCta}>View →</div>
    </div>
  )
}

function MatchedSection({ matched, activeChatId, onOpen }) {
  if (!matched.length) return (
    <div style={s.empty}>
      <div style={s.emptyIcon}>💜</div>
      <div style={s.emptyTitle}>No matches yet</div>
      <div style={s.emptyText}>Start swiping to find your dev soulmate</div>
    </div>
  )
  return (
    <>
      <div style={s.sectionLabel}>
        <span style={s.sectionLabelCode}>// matched.list()</span>
        <span style={s.sectionLabelCount}>{matched.length}</span>
      </div>
      {matched.map(p=>(
        <MatchedRow key={p.id} profile={p} isActive={activeChatId===p.id} onOpen={onOpen}/>
      ))}
    </>
  )
}

function MatchedRow({ profile, isActive, onOpen }) {
  const [hov, setHov] = useState(false)
  const last = profile.messages?.length
    ? profile.messages[profile.messages.length-1]
    : null
  return (
    <div
      style={{ ...s.matchedRow, ...(hov&&!isActive?s.matchedRowHov:{}), ...(isActive?s.matchedRowActive:{}) }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>onOpen(profile)}
    >
      <div style={s.matchedAvWrap}>
        <div style={{ ...s.matchedAv, background:profile.color||'var(--pastel-mid)' }}>{profile.initials[0]}</div>
        <span style={s.onlineDot}/>
      </div>
      <div style={s.matchedInfo}>
        <div style={s.matchedName}>{profile.name}</div>
        <div style={s.matchedMsg}>{last ? `${last.from==='me'?'You: ':''}${last.text}` : "It's a match! Say hi 👋"}</div>
      </div>
      <div style={s.matchedRight}>
        <div style={s.matchedTime}>now</div>
        {!isActive && <div style={s.unread}>1</div>}
      </div>
    </div>
  )
}

const s = {
  sidebar: {
    width: 288, flexShrink: 0,
    background: 'white',
    borderRight: '1px solid #ede9fe',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },

  /* Header */
  header: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '16px 16px 12px',
    borderBottom: '1px solid #ede9fe',
    flexShrink: 0,
  },
  logoMark: {
    width: 28, height: 28,
    background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    borderRadius: 7,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 500, color: 'white',
  },
  logoText: { fontSize: 15, fontWeight: 700, color: '#2e1065', letterSpacing: '-0.3px', flex: 1 },
  statusPill: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontFamily: 'var(--mono)', fontSize: 10, color: '#8b7eb8',
    background: '#f3f0ff', border: '1px solid #ede9fe',
    padding: '3px 9px', borderRadius: 20,
  },
  statusDot: {
    width: 5, height: 5, borderRadius: '50%',
    background: '#10b981', display: 'inline-block',
    animation: 'pulse 2s infinite',
  },

  /* Tabs */
  tabs: {
    display: 'flex', borderBottom: '1px solid #ede9fe',
    padding: '0 14px', flexShrink: 0,
  },
  tab: {
    flex: 1, padding: '12px 0',
    fontSize: 13, fontWeight: 600, color: '#8b7eb8',
    cursor: 'pointer', textAlign: 'center',
    position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
    background: 'none', border: 'none', fontFamily: 'var(--sans)',
    transition: 'color 0.2s',
  },
  tabActive: { color: '#8b5cf6' },
  underline: {
    position: 'absolute', bottom: 0, left: '16%', right: '16%',
    height: 2, background: '#8b5cf6', borderRadius: '2px 2px 0 0', display: 'block',
  },
  badge: {
    fontSize: 10, fontWeight: 700,
    minWidth: 16, height: 16, borderRadius: 8,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
    background: '#ede8ff', color: '#6d28d9',
  },
  badgeActive: { background: '#8b5cf6', color: 'white' },

  /* Content scroll */
  content: { flex: 1, overflowY: 'auto', padding: '14px 12px' },

  sectionLabel: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 10, marginTop: 2,
  },
  sectionLabelCode: { fontFamily: 'var(--mono)', fontSize: 10, color: '#8b7eb8', letterSpacing: '0.8px' },
  sectionLabelCount: {
    fontFamily: 'var(--mono)', fontSize: 10, color: '#8b5cf6',
    background: '#ede8ff', border: '1px solid #ddd6fe',
    padding: '1px 7px', borderRadius: 20,
  },

  /* Liked grid */
  likedGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  likedCard: {
    background: '#faf9ff', border: '1px solid #ede9fe',
    borderRadius: 12, padding: '12px 10px',
    cursor: 'pointer', transition: 'all 0.2s',
    textAlign: 'center', position: 'relative',
    overflow: 'hidden',
  },
  likedCardHov: {
    borderColor: '#a78bfa', transform: 'translateY(-2px)',
    boxShadow: '0 4px 16px rgba(139,92,246,0.12)',
    background: 'white',
  },
  newDot: {
    position: 'absolute', top: 8, right: 8,
    width: 7, height: 7, borderRadius: '50%', background: '#8b5cf6', display: 'block',
  },
  likedAv: {
    width: 48, height: 48, borderRadius: '50%',
    margin: '0 auto 7px',
    border: '2px solid rgba(255,255,255,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 700, color: '#4c1d95',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  likedName: { fontSize: 12, fontWeight: 600, color: '#2e1065', marginBottom: 2 },
  likedStack: { fontFamily: 'var(--mono)', fontSize: 9, color: '#8b7eb8', marginBottom: 6 },
  likedCta: {
    fontSize: 10, fontWeight: 700, color: '#8b5cf6',
    fontFamily: 'var(--mono)', letterSpacing: '0.3px',
  },

  /* Matched rows */
  matchedRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 10px', borderRadius: 12,
    cursor: 'pointer', transition: 'all 0.2s',
    border: '1px solid transparent', marginBottom: 3,
  },
  matchedRowHov: { background: '#faf9ff', borderColor: '#ede9fe' },
  matchedRowActive: { background: '#ede8ff', borderColor: '#ddd6fe' },
  matchedAvWrap: { position: 'relative', flexShrink: 0 },
  matchedAv: {
    width: 44, height: 44, borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 16, fontWeight: 700, color: '#4c1d95',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  onlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: '50%',
    background: '#10b981', border: '2px solid white', display: 'block',
  },
  matchedInfo: { flex: 1, minWidth: 0 },
  matchedName: { fontSize: 13, fontWeight: 600, color: '#2e1065', marginBottom: 2 },
  matchedMsg: { fontSize: 11, color: '#8b7eb8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  matchedRight: { textAlign: 'right', flexShrink: 0 },
  matchedTime: { fontSize: 10, color: '#c4b5fd', marginBottom: 3 },
  unread: {
    background: '#8b5cf6', color: 'white',
    fontSize: 9, fontWeight: 700, minWidth: 16, height: 16,
    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '0 4px', marginLeft: 'auto',
  },

  /* Empty state */
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '52px 20px', textAlign: 'center',
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: 600, color: '#2e1065', marginBottom: 6 },
  emptyText: { fontSize: 12, color: '#8b7eb8', lineHeight: 1.65 },
}