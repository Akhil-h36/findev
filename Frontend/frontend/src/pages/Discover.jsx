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

const BACKEND = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')

function resolveUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (!url.startsWith('/')) url = '/' + url
  return BACKEND + url
}

function adaptProfile(raw, index = 0) {
  let photos = []
  if (raw.images && raw.images.length > 0) {
    photos = raw.images.map((img) => ({
      url:        resolveUrl(img.url || img.image) || null,
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
  const rawStack = raw.tech_stack_data ?? raw.stack
  if (Array.isArray(rawStack)) {
    stackArr = rawStack
  } else if (rawStack && typeof rawStack === 'object') {
    stackArr = Object.keys(rawStack).filter(k => rawStack[k])
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
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, gap:16 }}>
      <div style={{ width:300, height:480, borderRadius:28, background:'linear-gradient(135deg,#ede8ff,#c4b5fd)', opacity:0.5, animation:'pulse 1.5s ease-in-out infinite' }} />
      <p style={{ fontFamily:'var(--mono)', fontSize:12, color:'#a78bfa', letterSpacing:'1px' }}>loading profiles...</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, gap:12 }}>
      <div style={{ fontSize:52, filter:'drop-shadow(0 6px 16px rgba(139,92,246,0.3))' }}>💜</div>
      <p style={{ fontFamily:'var(--sans)', fontSize:17, fontWeight:700, color:'#2e1065', letterSpacing:'-0.3px' }}>You've seen everyone!</p>
      <p style={{ fontFamily:'var(--mono)', fontSize:11, color:'#b0a8cc', letterSpacing:'0.5px' }}>Check back later for new devs</p>
    </div>
  )
}

// ── Liked-profile preview banner ─────────────────────────────────────
function LikedByBanner({ profile, onBack }) {
  return (
    <div style={{
      display:      'flex',
      alignItems:   'center',
      gap:          10,
      padding:      '12px 24px',
      background:   'linear-gradient(90deg,#f5f0ff,#ede8ff,#f5f0ff)',
      borderBottom: '1px solid #ddd6fe',
      fontFamily:   'var(--mono)',
      fontSize:     12,
      color:        '#5b21b6',
      flexShrink:   0,
    }}>
      <span style={{ fontSize: 16, filter: 'drop-shadow(0 2px 6px rgba(139,92,246,0.4))' }}>💜</span>
      <span><strong>{profile.name}</strong> liked your profile — like back to match!</span>
      <button
        onClick={onBack}
        style={{
          marginLeft:   'auto',
          background:   'linear-gradient(135deg, #f5f0ff, #ede8ff)',
          border:       '1px solid #c4b5fd',
          borderRadius: 10,
          padding:      '4px 12px',
          fontSize:     11,
          color:        '#7c3aed',
          cursor:       'pointer',
          fontFamily:   'var(--mono)',
          fontWeight:   600,
          transition:   'all 0.15s',
        }}
      >
        ← back
      </button>
    </div>
  )
}

// ── Logout button ──
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
        padding:      '7px 15px',
        borderRadius: 12,
        border:       '1.5px solid rgba(139,92,246,0.22)',
        background:   hovered ? '#fef2f2' : 'rgba(255,255,255,0.95)',
        color:        hovered ? '#dc2626' : '#9d8ec0',
        fontFamily:   'var(--mono)',
        fontSize:     11.5,
        fontWeight:   500,
        cursor:       'pointer',
        transition:   'all 0.15s ease',
        boxShadow:    hovered ? '0 4px 16px rgba(220,38,38,0.15)' : '0 2px 12px rgba(139,92,246,0.08)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  const { logout }     = useAuth()

  const [profiles,     setProfiles]     = useState([])
  const [idx,          setIdx]          = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [sideTab,      setSideTab]      = useState('liked')
  const [chat,         setChat]         = useState(null)
  const [matchPopup,   setMP]           = useState(null)
  const [toast,        setToast]        = useState(null)
  const [flyClass,     setFly]          = useState('')
  const [matches,      setMatches]      = useState([])
  const [pendingLikes, setPendingLikes] = useState([])
  const [likedPreview, setLikedPreview] = useState(null)

  const refreshMatches = useCallback(async () => {
    try {
      const res = await api.get('/matches/')
      setMatches(res.data.matches.map((p, i) => adaptProfile(p, i)))
      setPendingLikes(res.data.pending_likes.map((p, i) => adaptProfile(p, i)))
    } catch (err) {
      console.error('Error refreshing matches', err)
    }
  }, [])

  useEffect(() => {
    refreshMatches()
    const interval = setInterval(refreshMatches, 5000)
    return () => clearInterval(interval)
  }, [refreshMatches])

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
        if (err.response?.status === 401) {
          logout(); navigate('/login')
        } else {
          setError('Could not load profiles. Please try again.')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleLogout = useCallback(() => {
    logout(); navigate('/login')
  }, [logout, navigate])

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }, [])

  const handleOpenLikedProfile = useCallback((user) => {
    setChat(null)
    setLikedPreview(user)
    setSideTab('liked')
  }, [])

  const handleBackToDiscover = useCallback(() => {
    setLikedPreview(null)
  }, [])

  const clearFly = useCallback(() => {
    setTimeout(() => setFly(''), 50)
  }, [])

  const doSwipe = useCallback((targetProfile, action) => {
    api.post(`/swipe/${targetProfile.id}/`, { action })
      .then(res => {
        if (action === 'like' && res.data.status === 'match') {
          setMatches(prev => {
            const alreadyThere = prev.some(m => m.id === targetProfile.id)
            return alreadyThere ? prev : [...prev, targetProfile]
          })
          setPendingLikes(prev => prev.filter(u => u.id !== targetProfile.id))
          setMP(targetProfile)
        } else if (action === 'like') {
          showToast('💜 Liked ' + targetProfile.name)
        } else {
          showToast('👋 Passed on ' + targetProfile.name)
          setPendingLikes(prev => prev.filter(u => u.id !== targetProfile.id))
        }

        setProfiles(prev => prev.filter(p => p.id !== targetProfile.id))

        if (likedPreview && likedPreview.id === targetProfile.id) {
          setPendingLikes(prev => prev.filter(u => u.id !== targetProfile.id))
          setLikedPreview(null)
        } else {
          setIdx(prev => prev + 1)
          clearFly()
        }
      })
      .catch(() => {
        if (action === 'like') showToast('💜 Liked ' + targetProfile.name)
        else showToast('👋 Passed on ' + targetProfile.name)

        setProfiles(prev => prev.filter(p => p.id !== targetProfile.id))
        setPendingLikes(prev => prev.filter(u => u.id !== targetProfile.id))

        if (likedPreview && likedPreview.id === targetProfile.id) {
          setLikedPreview(null)
        } else {
          setIdx(prev => prev + 1)
          clearFly()
        }
      })
  }, [likedPreview, clearFly, showToast])

  const handleLike = useCallback(() => {
    const target = likedPreview || profiles[0]
    if (!target) return
    if (!likedPreview) setFly('fly-right')
    doSwipe(target, 'like')
  }, [likedPreview, profiles, doSwipe])

  const handleReject = useCallback(() => {
    const target = likedPreview || profiles[0]
    if (!target) return
    if (!likedPreview) setFly('fly-left')
    doSwipe(target, 'reject')
  }, [likedPreview, profiles, doSwipe])

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
    setMP(null)
    setChat({ ...p, messages: p.messages || [] })
    setSideTab('matched')
  }
  const onMatchSkip = () => {
    showToast('✨ ' + matchPopup.name + ' added to Matched!')
    setMP(null)
  }

  const handleOpenMatchChat = useCallback((user) => {
    setLikedPreview(null)
    setChat({ ...user, messages: user.messages || [] })
  }, [])

  const discoveryProfile = profiles[0]
  const displayProfile   = likedPreview || discoveryProfile

  const sidebarProps = {
    sideTab,
    setSideTab,
    likedUsers:         pendingLikes,
    matched:            matches,
    activePreviewId:    likedPreview?.id ?? null,
    onOpenLikedProfile: handleOpenLikedProfile,
    onOpenMatchChat:    handleOpenMatchChat,
    onCloseChat:        () => setChat(null),
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
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, gap:12 }}>
          <div style={{ fontSize:40 }}>⚠️</div>
          <p style={{ fontFamily:'var(--mono)', fontSize:13, color:'#f43f5e' }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', color:'white', border:'none', borderRadius:14, padding:'10px 24px', cursor:'pointer', fontFamily:'var(--sans)', fontWeight:600, boxShadow:'0 4px 16px rgba(139,92,246,0.4)' }}>Retry</button>
        </div>
      </main>
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
            {likedPreview && (
              <LikedByBanner profile={likedPreview} onBack={handleBackToDiscover} />
            )}

            {!displayProfile ? (
              <EmptyState />
            ) : (
              <div style={s.contentSplit}>

                {/* ── Carousel zone: tall enough to show the full card ── */}
                <div style={s.carouselZone}>
                  <ProfileCarousel
                    key={`${displayProfile.id}-${idx}`}
                    profile={displayProfile}
                    onLike={handleLike}
                    onReject={handleReject}
                    onSuperLike={handleSuperLike}
                    flyClass={likedPreview ? '' : flyClass}
                  />
                </div>

                {/* ── Detail zone ── */}
                <div style={s.detailZone}>
                  <ProfileDetail profile={displayProfile} />
                </div>

              </div>
            )}
          </>
        )}
      </main>

      {matchPopup && <MatchOverlay other={matchPopup} onChat={onMatchChat} onSkip={onMatchSkip} />}
      {toast       && <Toast message={toast} />}

      <LogoutButton onLogout={handleLogout} />
    </div>
  )
}

const s = {
  root: {
    display:    'flex',
    height:     '100vh',
    overflow:   'hidden',
    fontFamily: 'var(--sans)',
    background: '#fcfaff',
  },
  
  main: {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    overflowY:     'auto',
    overflowX:     'hidden',
    background:    'linear-gradient(180deg, #fdfcff 0%, #f9f7ff 30%, white 60%)',
    position:      'relative',
    minWidth:      0,
  },
  contentSplit: {
    display:       'flex',
    flexDirection: 'column',
    width:         '100%',
  },

  // KEY FIX: height must accommodate the center card (480px) + side cards overflow
  // + action buttons below (they sit at bottom:16 inside the 480px card, so they're inside)
  // + dot nav (paddingBottom 12 + dotRow ~20px) + top breathing room
  // Total: 480px card + ~80px breathing room top/bottom + 30px dots = 590px
  carouselZone: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    width:          '100%',
    height:         '590px',       // ← was 580px with 50px padding eating into card
    position:       'relative',
    paddingTop:     '44px',        // breathing room above the 3D carousel center
    paddingBottom:  '0px',
    boxSizing:      'border-box',
    overflow:       'visible',     // allow side cards to peek out
    zIndex:         10,
    flexShrink:     0,
  },

  detailZone: {
    width: '100%',
    borderTop: '1px solid #f0ecff',
  },
}