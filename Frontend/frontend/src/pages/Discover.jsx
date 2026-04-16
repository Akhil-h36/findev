// src/pages/Discover.jsx
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar         from '../components/discover/Sidebar'
import ProfileCarousel from '../components/discover/ProfileCarousel'
import ProfileDetail   from '../components/discover/ProfileDetail'
import ChatPanel       from '../components/discover/ChatPanel'
import MatchOverlay    from '../components/discover/MatchOverlay'
import Toast           from '../components/ui/Toast'
import { useAuth }     from '../context/AuthContext'
import api             from '../api/auth'

// ── Gradient / emoji pools for placeholder avatars ───────────────────
const GRAD = [
  'linear-gradient(155deg,#c4b5fd 0%,#8b5cf6 55%,#5b21b6 100%)',
  'linear-gradient(155deg,#bfdbfe 0%,#60a5fa 55%,#1d4ed8 100%)',
  'linear-gradient(155deg,#d1fae5 0%,#6ee7b7 50%,#059669 100%)',
  'linear-gradient(155deg,#fce7f3 0%,#f9a8d4 50%,#db2777 100%)',
]
const EMOJIS = ['🧑‍💻','👩‍💻','🦀','🌸','☁️','🤖','🎨','🏔️']

function adaptProfile(raw, index = 0) {
  let photos = []
  if (raw.images && raw.images.length > 0) {
    photos = raw.images.map((img) => ({
      url:        img.url || null,
      is_primary: img.is_primary,
      bg:         null,
      emoji:      null,
      caption:    null,
    }))
  } else {
    photos = [{
      url:     null,
      bg:      GRAD[index % GRAD.length],
      emoji:   EMOJIS[index % EMOJIS.length],
      caption: 'no photos yet',
    }]
  }

  let stackArr = []
  if (Array.isArray(raw.stack)) {
    stackArr = raw.stack
  } else if (raw.stack && typeof raw.stack === 'object') {
    stackArr = Object.keys(raw.stack).filter(k => raw.stack[k])
  }

  const initials = raw.username
    ? [raw.username[0].toUpperCase(), (raw.username[1] || 'V').toUpperCase()]
    : ['D', 'V']

  return {
    id:         raw.id,
    name:       raw.username,
    username:   raw.username,
    age:        '',
    initials,
    bio:        raw.bio || '',
    experience: raw.years_experience ? `${raw.years_experience} yr${raw.years_experience !== 1 ? 's' : ''}` : 'N/A',
    location:   '',
    philosophy: raw.coding_philosophy || '',
    openSource: '',
    github:     raw.github_url || '',
    stack:      stackArr,
    stackColors: stackArr.map(() => '#8b5cf6'),
    photos,
    is_online:  raw.is_online,
    color:      GRAD[index % GRAD.length].match(/#[a-f0-9]{6}/gi)?.[1] || '#c4b5fd',
    compat:     { stack: 0, vibe: 0, collab: 0 },
    messages:   [],
  }
}

// ── Skeletons / empty states ─────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', gap:16 }}>
      <div style={{ width:300, height:470, borderRadius:22, background:'linear-gradient(135deg,#ede8ff,#c4b5fd)', opacity:0.5, animation:'pulse 1.5s ease-in-out infinite' }} />
      <p style={{ fontFamily:'var(--mono)', fontSize:12, color:'#8b7eb8' }}>loading profiles...</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', gap:12 }}>
      <div style={{ fontSize:48 }}>💜</div>
      <p style={{ fontFamily:'var(--sans)', fontSize:16, fontWeight:600, color:'#2e1065' }}>You've seen everyone!</p>
      <p style={{ fontFamily:'var(--mono)', fontSize:12, color:'#8b7eb8' }}>Check back later for new devs</p>
    </div>
  )
}

// ── Logout button (temporary — remove once route protection is in place) ──
function LogoutButton({ onLogout }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onLogout}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:     'fixed',
        top:          18,
        right:        22,
        zIndex:       1000,
        display:      'flex',
        alignItems:   'center',
        gap:          7,
        padding:      '8px 16px',
        borderRadius: 12,
        border:       '1.5px solid rgba(139,92,246,0.22)',
        background:   hovered ? '#fef2f2' : 'white',
        color:        hovered ? '#dc2626' : '#8b84b8',
        fontFamily:   'var(--mono)',
        fontSize:     12,
        fontWeight:   500,
        cursor:       'pointer',
        transition:   'all 0.15s ease',
        boxShadow:    '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* power icon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"/>
        <line x1="12" y1="2" x2="12" y2="12"/>
      </svg>
      logout
    </button>
  )
}

// ── Main component ───────────────────────────────────────────────────
export default function Discover() {
  const navigate       = useNavigate()
  const { logout }     = useAuth()   // ← from AuthContext

  const [profiles,   setProfiles]  = useState([])
  const [idx,        setIdx]       = useState(0)
  const [loading,    setLoading]   = useState(true)
  const [error,      setError]     = useState(null)
  const [matched,    setMatched]   = useState([])
  const [sideTab,    setSideTab]   = useState('liked')
  const [chat,       setChat]      = useState(null)
  const [matchPopup, setMP]        = useState(null)
  const [toast,      setToast]     = useState(null)
  const [flyClass,   setFly]       = useState('')

  useEffect(() => {
    setLoading(true)
    api.get('/discover/')
      .then(res => {
        const adapted = (res.data.results || res.data).map((p, i) => adaptProfile(p, i))
        setProfiles(adapted)
        setIdx(0)
      })
      .catch(err => {
        console.error('Discovery fetch failed:', err)
        // If 401 the token is stale — send back to login
        if (err.response?.status === 401) {
          logout()
          navigate('/login')
        } else {
          setError('Could not load profiles. Please try again.')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Logout handler ────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    logout()           // clears tokens from localStorage / AuthContext
    navigate('/login')
  }, [logout, navigate])

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }, [])

  const nextProfile = useCallback(() => {
    setFly('')
    setIdx(i => i + 1)
  }, [])

  const handleLike = useCallback(() => {
    if (!profiles[idx]) return
    setFly('fly-right')
    const p = profiles[idx]
    api.post(`/swipe/${p.id}/`, { action: 'like' })
      .then(res => {
        if (res.data.status === 'match') {
          setFly('')
          setMatched(prev => prev.find(m => m.id === p.id) ? prev : [...prev, p])
          setMP(p)
        } else {
          showToast('💜 Liked ' + p.name)
          setTimeout(nextProfile, 600)
        }
      })
      .catch(() => {
        showToast('💜 Liked ' + p.name)
        setTimeout(nextProfile, 600)
      })
  }, [idx, profiles, nextProfile, showToast])

  const handleReject = useCallback(() => {
    if (!profiles[idx]) return
    setFly('fly-left')
    const p = profiles[idx]
    api.post(`/swipe/${p.id}/`, { action: 'reject' }).catch(() => {})
    showToast('👋 Passed on ' + p.name)
    setTimeout(nextProfile, 600)
  }, [idx, profiles, nextProfile, showToast])

  const handleSuperLike = useCallback(() => {
    showToast('⭐ Super liked!')
    setTimeout(handleLike, 200)
  }, [handleLike, showToast])

  useEffect(() => {
    const onKey = (e) => {
      if (chat || matchPopup) return
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleLike()
      if (e.key === 'ArrowLeft'  || e.key === 'Shift') handleReject()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [chat, matchPopup, handleLike, handleReject])

  const onMatchChat = () => {
    const p = matchPopup
    setMP(null); nextProfile()
    setChat({ ...p, messages: p.messages || [] })
    setSideTab('matched')
  }
  const onMatchSkip = () => {
    showToast('✨ ' + matchPopup.name + ' added to Matched!')
    setMP(null); nextProfile()
  }

  const profile = profiles[idx]

  // ── Shared sidebar props ──────────────────────────────────────────
  const sidebarProps = {
    sideTab, setSideTab,
    likedUsers: [],
    matched,
    chatProfile: chat,
    onOpenChat:  setChat,
    onCloseChat: () => setChat(null),
  }

  if (loading) return (
    <div style={s.root}>
      <Sidebar {...sidebarProps} />
      <main style={s.main}><LoadingSkeleton /></main>
      <LogoutButton onLogout={handleLogout} />
    </div>
  )

  if (error) return (
    <div style={s.root}>
      <Sidebar {...sidebarProps} />
      <main style={s.main}>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', gap:12 }}>
          <div style={{ fontSize:40 }}>⚠️</div>
          <p style={{ fontFamily:'var(--mono)', fontSize:13, color:'#f43f5e' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ background:'#8b5cf6', color:'white', border:'none', borderRadius:12, padding:'10px 20px', cursor:'pointer', fontFamily:'var(--sans)' }}>Retry</button>
        </div>
      </main>
      <LogoutButton onLogout={handleLogout} />
    </div>
  )

  if (!profile) return (
    <div style={s.root}>
      <Sidebar {...sidebarProps} />
      <main style={s.main}><EmptyState /></main>
      <LogoutButton onLogout={handleLogout} />
    </div>
  )

  return (
    <div style={s.root}>
      <Sidebar {...sidebarProps} />

      <main style={s.main}>
        {chat ? (
          <ChatPanel profile={chat} onClose={() => setChat(null)} />
        ) : (
          <>
            <ProfileCarousel
              key={profile.id}
              profile={profile}
              onLike={handleLike}
              onReject={handleReject}
              onSuperLike={handleSuperLike}
              flyClass={flyClass}
            />
            <ProfileDetail profile={profile} />
          </>
        )}
      </main>

      {matchPopup && <MatchOverlay other={matchPopup} onChat={onMatchChat} onSkip={onMatchSkip} />}
      {toast       && <Toast message={toast} />}

      {/* Temporary logout — remove once ProtectedRoute is wired up */}
      <LogoutButton onLogout={handleLogout} />
    </div>
  )
}

const s = {
  root: { display:'flex', height:'100vh', overflow:'hidden', fontFamily:'var(--sans)', background:'white' },
  main: { flex:1, overflowY:'auto', background:'white', position:'relative', minWidth:0 },
}