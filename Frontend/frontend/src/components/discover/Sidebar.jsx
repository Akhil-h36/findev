// src/components/discover/Sidebar.jsx
import { useState } from 'react'

export default function Sidebar({ sideTab, setSideTab, likedUsers, matched, chatProfile, onOpenChat, onCloseChat }) {
  const newCount = likedUsers.filter(u => u.isNew).length

  return (
    <aside style={s.sidebar}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logo}>
          <div style={s.logoMark}>&lt;/&gt;</div>
          <span style={s.logoText}>DevMatch</span>
        </div>
        <div style={s.onlinePill}>
          <span style={s.onlineDotPulse} />
          <span style={s.onlineText}>42 online</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        <Tab
          label="Liked"
          count={newCount}
          active={sideTab === 'liked'}
          onClick={() => { setSideTab('liked'); onCloseChat() }}
        />
        <Tab
          label="Matched"
          count={matched.length}
          active={sideTab === 'matched'}
          onClick={() => setSideTab('matched')}
        />
      </div>

      {/* Content */}
      <div style={s.content}>
        {sideTab === 'liked'
          ? <LikedSection   users={likedUsers} onOpen={onOpenChat} />
          : <MatchedSection matched={matched} activeChatId={chatProfile?.id} onOpen={onOpenChat} />
        }
      </div>
    </aside>
  )
}

function Tab({ label, count, active, onClick }) {
  return (
    <button onClick={onClick} style={{ ...s.tab, ...(active ? s.tabActive : {}) }}>
      <span>{label}</span>
      {count > 0 && (
        <span style={{ ...s.badge, ...(active ? s.badgeActive : {}) }}>{count}</span>
      )}
      {active && <span style={s.tabUnderline} />}
    </button>
  )
}

function LikedSection({ users, onOpen }) {
  return (
    <>
      <div style={s.sectionHead}>
        <span style={s.sectionCode}>// new.likes</span>
        <span style={s.sectionCount}>{users.filter(u => u.isNew).length}</span>
      </div>
      <div style={s.likedGrid}>
        {users.map(u => <LikedCard key={u.id} user={u} onOpen={onOpen} />)}
      </div>
      {users.length === 0 && <EmptyHint icon="👀" text="No likes yet — keep swiping!" />}
    </>
  )
}

function LikedCard({ user, onOpen }) {
  const [hov, setHov] = useState(false)
  const fp = {
    id: user.id, name: user.name, initials: user.initials,
    color: user.color, stack: user.stack.split(' · '),
    messages: [
      { from: 'them', text: `Hey! I loved your profile 👋 Your stack is amazing!` },
      { from: 'me',   text: `Thanks! Your ${user.stack} combo looks super interesting` },
    ],
  }
  return (
    <div
      style={{ ...s.likedCard, ...(hov ? s.likedCardHov : {}) }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onOpen(fp)}
    >
      {user.isNew && <span style={s.newBadge} />}
      <div style={{ ...s.likedAv, background: user.color }}>{user.initials[0]}</div>
      <div style={s.likedName}>{user.name}</div>
      <div style={s.likedStack}>{user.stack}</div>
      <div style={s.likedCta}>View →</div>
    </div>
  )
}

function MatchedSection({ matched, activeChatId, onOpen }) {
  if (!matched.length) return (
    <EmptyHint icon="💜" text="No matches yet — start swiping to find your dev soulmate" />
  )
  return (
    <>
      <div style={s.sectionHead}>
        <span style={s.sectionCode}>// matched.list()</span>
        <span style={s.sectionCount}>{matched.length}</span>
      </div>
      <div style={s.matchList}>
        {matched.map(p => (
          <MatchedRow key={p.id} profile={p} isActive={activeChatId === p.id} onOpen={onOpen} />
        ))}
      </div>
    </>
  )
}

function MatchedRow({ profile, isActive, onOpen }) {
  const [hov, setHov] = useState(false)
  const last = profile.messages?.length
    ? profile.messages[profile.messages.length - 1]
    : null
  return (
    <div
      style={{ ...s.matchRow, ...(hov && !isActive ? s.matchRowHov : {}), ...(isActive ? s.matchRowActive : {}) }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onOpen(profile)}
    >
      <div style={s.matchAvWrap}>
        <div style={{ ...s.matchAv, background: profile.color || '#c4b5fd' }}>
          {profile.initials?.[0]}
        </div>
        <span style={s.activeDot} />
      </div>
      <div style={s.matchInfo}>
        <div style={s.matchName}>{profile.name}</div>
        <div style={s.matchPreview}>
          {last ? `${last.from === 'me' ? 'You: ' : ''}${last.text}` : "It's a match! Say hi 👋"}
        </div>
      </div>
      <div style={s.matchMeta}>
        <div style={s.matchTime}>now</div>
        {!isActive && <div style={s.unreadBadge}>1</div>}
      </div>
    </div>
  )
}

function EmptyHint({ icon, text }) {
  return (
    <div style={s.emptyWrap}>
      <div style={s.emptyIcon}>{icon}</div>
      <div style={s.emptyText}>{text}</div>
    </div>
  )
}

const s = {
  sidebar: {
    width: 280, flexShrink: 0,
    background: '#fdfcff',
    borderRight: '1px solid #ede9fe',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },

  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '15px 16px 13px',
    borderBottom: '1px solid #ede9fe',
    flexShrink: 0,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 9 },
  logoMark: {
    width: 30, height: 30,
    background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: 'white',
    letterSpacing: '-0.5px',
  },
  logoText: {
    fontSize: 15, fontWeight: 700, color: '#1e0a40',
    letterSpacing: '-0.4px',
  },
  onlinePill: {
    display: 'flex', alignItems: 'center', gap: 5,
    background: '#f0fdf4', border: '1px solid #bbf7d0',
    padding: '3px 9px', borderRadius: 20,
  },
  onlineDotPulse: {
    width: 6, height: 6, borderRadius: '50%',
    background: '#22c55e', display: 'inline-block',
    animation: 'pulse 2s infinite',
  },
  onlineText: { fontFamily: 'var(--mono)', fontSize: 10, color: '#16a34a' },

  tabs: {
    display: 'flex',
    borderBottom: '1px solid #ede9fe',
    padding: '0 14px', flexShrink: 0,
  },
  tab: {
    flex: 1, padding: '11px 0',
    fontSize: 13, fontWeight: 600,
    color: '#b0a8cc', cursor: 'pointer',
    textAlign: 'center', position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    background: 'none', border: 'none',
    fontFamily: 'var(--sans)', transition: 'color 0.18s',
  },
  tabActive: { color: '#7c3aed' },
  tabUnderline: {
    position: 'absolute', bottom: 0, left: '20%', right: '20%',
    height: 2.5, background: '#8b5cf6',
    borderRadius: '3px 3px 0 0', display: 'block',
  },
  badge: {
    fontSize: 10, fontWeight: 700,
    minWidth: 17, height: 17, borderRadius: 10,
    display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', padding: '0 4px',
    background: '#ede8ff', color: '#6d28d9',
    transition: 'all 0.18s',
  },
  badgeActive: { background: '#8b5cf6', color: 'white' },

  content: { flex: 1, overflowY: 'auto', padding: '14px 12px 10px' },

  sectionHead: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 11, marginTop: 2,
  },
  sectionCode: { fontFamily: 'var(--mono)', fontSize: 9.5, color: '#a89ec8', letterSpacing: '0.7px' },
  sectionCount: {
    fontFamily: 'var(--mono)', fontSize: 10, color: '#8b5cf6',
    background: '#ede8ff', border: '1px solid #ddd6fe',
    padding: '1px 8px', borderRadius: 20, fontWeight: 700,
  },

  likedGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 },
  likedCard: {
    background: 'white', border: '1px solid #ede9fe',
    borderRadius: 13, padding: '13px 10px 11px',
    cursor: 'pointer', transition: 'all 0.18s',
    textAlign: 'center', position: 'relative', overflow: 'hidden',
  },
  likedCardHov: {
    borderColor: '#c4b5fd', transform: 'translateY(-2px)',
    boxShadow: '0 4px 18px rgba(139,92,246,0.10)',
  },
  newBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 7, height: 7, borderRadius: '50%',
    background: '#8b5cf6', display: 'block',
    boxShadow: '0 0 0 2px white',
  },
  likedAv: {
    width: 46, height: 46, borderRadius: '50%',
    margin: '0 auto 8px',
    border: '2.5px solid rgba(255,255,255,0.9)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 17, fontWeight: 700, color: '#3b0764',
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
  },
  likedName: { fontSize: 12, fontWeight: 600, color: '#1e0a40', marginBottom: 2 },
  likedStack: { fontFamily: 'var(--mono)', fontSize: 9, color: '#a89ec8', marginBottom: 7 },
  likedCta: { fontSize: 10, fontWeight: 700, color: '#8b5cf6', fontFamily: 'var(--mono)' },

  matchList: { display: 'flex', flexDirection: 'column', gap: 2 },
  matchRow: {
    display: 'flex', alignItems: 'center', gap: 11,
    padding: '9px 9px', borderRadius: 13,
    cursor: 'pointer', transition: 'all 0.18s',
    border: '1px solid transparent',
  },
  matchRowHov: { background: '#faf8ff', borderColor: '#ede9fe' },
  matchRowActive: { background: '#ede8ff', borderColor: '#ddd6fe' },
  matchAvWrap: { position: 'relative', flexShrink: 0 },
  matchAv: {
    width: 42, height: 42, borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 15, fontWeight: 700, color: '#3b0764',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
  },
  activeDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: '50%',
    background: '#22c55e', border: '2px solid white', display: 'block',
  },
  matchInfo: { flex: 1, minWidth: 0 },
  matchName: { fontSize: 13, fontWeight: 600, color: '#1e0a40', marginBottom: 2 },
  matchPreview: {
    fontSize: 11, color: '#a89ec8',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  matchMeta: { textAlign: 'right', flexShrink: 0 },
  matchTime: { fontSize: 10, color: '#d4c8f7', marginBottom: 4 },
  unreadBadge: {
    background: '#8b5cf6', color: 'white',
    fontSize: 9, fontWeight: 700, minWidth: 16, height: 16,
    borderRadius: 8, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '0 4px', marginLeft: 'auto',
  },

  emptyWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '48px 20px', textAlign: 'center', gap: 10,
  },
  emptyIcon: { fontSize: 34, marginBottom: 2 },
  emptyText: { fontSize: 12, color: '#a89ec8', lineHeight: 1.7, maxWidth: 180 },
}