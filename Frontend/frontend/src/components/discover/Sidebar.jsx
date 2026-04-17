// src/components/discover/Sidebar.jsx
import React from 'react';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#c4b5fd,#8b5cf6)',
  'linear-gradient(135deg,#bfdbfe,#60a5fa)',
  'linear-gradient(135deg,#d1fae5,#34d399)',
  'linear-gradient(135deg,#fce7f3,#f9a8d4)',
  'linear-gradient(135deg,#fef3c7,#fbbf24)',
  'linear-gradient(135deg,#ffe4e6,#fb7185)',
]

function getGradient(username = '') {
  const idx = username.charCodeAt(0) % AVATAR_GRADIENTS.length
  return AVATAR_GRADIENTS[idx]
}

export default function Sidebar({
  sideTab,
  setSideTab,
  likedUsers = [],
  matched = [],
  activePreviewId = null,
  onOpenLikedProfile,
  onOpenMatchChat,
  onCloseChat,
}) {
  const pendingCount = likedUsers.length

  return (
    <aside style={s.sidebar}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.logoWrap}>
          <div style={s.logoMark}>
            <span style={s.logoMarkText}>&lt;/&gt;</span>
          </div>
          <div>
            <div style={s.logoText}>DevMatch</div>
            <div style={s.logoSub}>find your pair programmer</div>
          </div>
        </div>
        <div style={s.onlinePill}>
          <span style={s.onlineDot} />
          <span style={s.onlineText}>42 online</span>
        </div>
      </div>

      {/* Decorative bar */}
      <div style={s.headerAccent} />

      {/* Tabs */}
      <div style={s.tabs}>
        <Tab
          label="Liked You"
          count={pendingCount}
          active={sideTab === 'liked'}
          onClick={() => { setSideTab('liked'); onCloseChat?.(); }}
        />
        <Tab
          label="Matched"
          count={matched.length}
          active={sideTab === 'matched'}
          onClick={() => setSideTab('matched')}
        />
      </div>

      {/* Grid content */}
      <div style={s.content}>
        {sideTab === 'liked' ? (
          <LikedGrid
            users={likedUsers}
            activePreviewId={activePreviewId}
            onOpen={onOpenLikedProfile}
          />
        ) : (
          <MatchedGrid
            users={matched}
            onOpen={onOpenMatchChat}
          />
        )}
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <span style={s.footerText}>✦ swipe to connect ✦</span>
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
    </button>
  )
}

function AvatarCard({ user, isActive, onClick, showDot }) {
  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??'
  const gradient = getGradient(user.username || '')
  const stackLabel = user.stack?.slice(0, 2).join(' · ') || ''
  const shortName = user.username
    ? (user.username.length > 9 ? user.username.slice(0, 8) + '…' : user.username)
    : 'Dev'

  return (
    <div
      style={{
        ...s.card,
        ...(isActive ? s.cardActive : {}),
      }}
      onClick={onClick}
    >
      {showDot && <span style={s.cardDot} />}

      <div style={{ ...s.avatarOuter, ...(isActive ? s.avatarOuterActive : {}) }}>
        <div style={{ ...s.avatar, background: gradient }}>
          {user.photos?.[0]?.url ? (
            <img
              src={user.photos[0].url}
              alt={user.username}
              style={s.avatarImg}
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
          ) : (
            <span style={s.avatarInitials}>{initials}</span>
          )}
          {user.is_online && <span style={s.onlineIndicator} />}
        </div>
      </div>

      <div style={s.cardName}>{shortName}</div>

      {stackLabel && (
        <div style={s.cardStack}>{stackLabel}</div>
      )}
    </div>
  )
}

function LikedGrid({ users, activePreviewId, onOpen }) {
  if (users.length === 0) {
    return (
      <div style={s.empty}>
        <div style={s.emptyEmoji}>👀</div>
        <div style={s.emptyTitle}>No likes yet</div>
        <div style={s.emptyText}>Keep swiping to get noticed!</div>
        <div style={s.emptyHint}>✦ ✦ ✦</div>
      </div>
    )
  }

  return (
    <div>
      <div style={s.sectionHint}>Tap to review & like back 💜</div>
      <div style={s.grid}>
        {users.map(user => (
          <AvatarCard
            key={user.id}
            user={user}
            isActive={user.id === activePreviewId}
            onClick={() => onOpen(user)}
            showDot
          />
        ))}
      </div>
    </div>
  )
}

function MatchedGrid({ users, onOpen }) {
  if (users.length === 0) {
    return (
      <div style={s.empty}>
        <div style={s.emptyEmoji}>💬</div>
        <div style={s.emptyTitle}>No matches yet</div>
        <div style={s.emptyText}>Match with someone to start chatting</div>
        <div style={s.emptyHint}>✦ ✦ ✦</div>
      </div>
    )
  }

  return (
    <div>
      <div style={s.sectionHint}>Mutual matches · tap to chat 💬</div>
      <div style={s.grid}>
        {users.map(user => (
          <AvatarCard
            key={user.id}
            user={user}
            isActive={false}
            onClick={() => onOpen(user)}
            showDot={user.is_online}
          />
        ))}
      </div>
    </div>
  )
}

const s = {
  sidebar: {
    width: 270,
    background: 'linear-gradient(180deg, #fdfcff 0%, #f9f7ff 100%)',
    borderRight: '1px solid #ede8ff',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    flexShrink: 0,
    position: 'relative',
  },

  header: {
    padding: '20px 18px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
    flexShrink: 0,
  },
  logoMarkText: {
    color: 'white',
    fontWeight: 800,
    fontSize: 13,
    fontFamily: 'var(--mono)',
    letterSpacing: '-0.5px',
  },
  logoText: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1e1b4b',
    letterSpacing: '-0.4px',
    lineHeight: 1.1,
  },
  logoSub: {
    fontSize: 9,
    color: '#b0a8cc',
    fontFamily: 'var(--mono)',
    letterSpacing: '0.2px',
    marginTop: 1,
  },
  onlinePill: {
    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
    border: '1px solid #bbf7d0',
    padding: '4px 9px',
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    boxShadow: '0 2px 8px rgba(34,197,94,0.12)',
  },
  onlineDot: {
    width: 6,
    height: 6,
    background: '#22c55e',
    borderRadius: '50%',
    display: 'inline-block',
    boxShadow: '0 0 6px rgba(34,197,94,0.5)',
  },
  onlineText: {
    fontSize: 10,
    color: '#15803d',
    fontWeight: 600,
    fontFamily: 'var(--mono)',
  },

  headerAccent: {
    height: 2,
    background: 'linear-gradient(90deg, transparent, #c4b5fd, #8b5cf6, #c4b5fd, transparent)',
    opacity: 0.5,
    flexShrink: 0,
  },

  tabs: {
    display: 'flex',
    padding: '0 16px',
    borderBottom: '1px solid #ede8ff',
    gap: 4,
    background: 'rgba(250,248,255,0.8)',
  },
  tab: {
    padding: '12px 4px',
    border: 'none',
    background: 'none',
    fontSize: 12.5,
    fontWeight: 600,
    color: '#b0a8cc',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginRight: 12,
    borderBottom: '2px solid transparent',
    transition: 'color 0.15s, border-color 0.15s',
    fontFamily: 'var(--sans)',
    letterSpacing: '-0.1px',
  },
  tabActive: {
    color: '#7c3aed',
    borderBottom: '2px solid #7c3aed',
  },
  badge: {
    background: '#f0e8ff',
    color: '#8b5cf6',
    fontSize: 10,
    fontWeight: 700,
    padding: '1px 7px',
    borderRadius: 10,
    fontFamily: 'var(--mono)',
    transition: 'all 0.2s',
  },
  badgeActive: {
    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(139,92,246,0.4)',
  },

  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '14px 12px',
  },

  sectionHint: {
    fontSize: 10,
    color: '#b0a8cc',
    fontFamily: 'var(--mono)',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: '1px solid #f0ecff',
    letterSpacing: '0.2px',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 9,
  },

  card: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 7,
    padding: '16px 8px 12px',
    background: 'linear-gradient(145deg, #ffffff, #faf8ff)',
    border: '1.5px solid #f0ecff',
    borderRadius: 18,
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
    textAlign: 'center',
  },
  cardActive: {
    background: 'linear-gradient(145deg, #f5f0ff, #ede8ff)',
    borderColor: '#c4b5fd',
    boxShadow: '0 0 0 3px rgba(139,92,246,0.12), 0 4px 16px rgba(139,92,246,0.14)',
    transform: 'scale(1.02)',
  },
  cardDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: '0 0 6px rgba(139,92,246,0.5)',
  },

  avatarOuter: {
    padding: 2,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e9e3ff, #ddd6fe)',
    transition: 'all 0.2s',
  },
  avatarOuterActive: {
    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    boxShadow: '0 4px 14px rgba(139,92,246,0.4)',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
    border: '2.5px solid white',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    position: 'absolute',
    inset: 0,
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: 700,
    color: 'white',
    letterSpacing: '-0.5px',
    lineHeight: 1,
    textShadow: '0 1px 4px rgba(0,0,0,0.15)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 10,
    height: 10,
    background: '#22c55e',
    border: '2px solid white',
    borderRadius: '50%',
    boxShadow: '0 0 6px rgba(34,197,94,0.5)',
  },

  cardName: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1e1b4b',
    letterSpacing: '-0.2px',
    lineHeight: 1.2,
  },
  cardStack: {
    fontSize: 9,
    color: '#8b5cf6',
    fontFamily: 'var(--mono)',
    background: 'linear-gradient(135deg, #f0ecff, #ede8ff)',
    padding: '2px 8px',
    borderRadius: 8,
    letterSpacing: '0.2px',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    border: '1px solid #ddd6fe',
  },

  empty: {
    textAlign: 'center',
    padding: '36px 12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 4,
    filter: 'drop-shadow(0 4px 8px rgba(139,92,246,0.2))',
  },
  emptyTitle: {
    fontSize: 13.5,
    fontWeight: 700,
    color: '#3b1a7a',
    letterSpacing: '-0.2px',
  },
  emptyText: {
    fontSize: 11,
    color: '#b0a8cc',
    lineHeight: 1.6,
    fontFamily: 'var(--mono)',
  },
  emptyHint: {
    fontSize: 10,
    color: '#ddd6fe',
    marginTop: 4,
    letterSpacing: '4px',
  },

  footer: {
    padding: '12px 16px',
    borderTop: '1px solid #ede8ff',
    textAlign: 'center',
    background: 'linear-gradient(135deg, rgba(237,232,255,0.5), rgba(245,240,255,0.5))',
    flexShrink: 0,
  },
  footerText: {
    fontFamily: 'var(--mono)',
    fontSize: 9,
    color: '#c4b5fd',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
}