// src/pages/Discover.jsx
import { useState, useEffect, useCallback } from 'react'
import Sidebar         from '../components/discover/Sidebar'
import ProfileCarousel from '../components/discover/ProfileCarousel'
import ProfileDetail   from '../components/discover/ProfileDetail'
import ChatPanel       from '../components/discover/ChatPanel'
import MatchOverlay    from '../components/discover/MatchOverlay'
import Toast           from '../components/ui/Toast'
import { PROFILES, LIKED_USERS } from '../data/mockProfiles'

export default function Discover() {
  const [profiles]            = useState(PROFILES)
  const [idx,  setIdx]        = useState(0)
  const [liked]               = useState(LIKED_USERS)
  const [matched, setMatched] = useState([])
  const [sideTab, setSideTab] = useState('liked')
  const [chat,   setChat]     = useState(null)
  const [matchPopup, setMP]   = useState(null)
  const [toast,  setToast]    = useState(null)
  const [flyClass, setFly]    = useState('')

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }, [])

  const nextProfile = useCallback(() => {
    setFly('')
    setIdx(i => (i + 1) % profiles.length)
  }, [profiles.length])

  const handleLike = useCallback(() => {
    setFly('fly-right')
    const p = profiles[idx]
    if (Math.random() > 0.4) {
      setTimeout(() => {
        setFly('')
        setMatched(prev => prev.find(m => m.id===p.id) ? prev : [...prev, p])
        setMP(p)
      }, 520)
    } else {
      showToast('💜 Liked ' + p.name)
      setTimeout(nextProfile, 600)
    }
  }, [idx, profiles, nextProfile, showToast])

  const handleReject = useCallback(() => {
    setFly('fly-left')
    showToast('👋 Passed on ' + profiles[idx].name)
    setTimeout(nextProfile, 600)
  }, [idx, profiles, nextProfile, showToast])

  const handleSuperLike = useCallback(() => {
    showToast('⭐ Super liked!')
    setTimeout(handleLike, 200)
  }, [handleLike, showToast])

  useEffect(() => {
    const onKey = (e) => {
      if (chat || matchPopup) return
      if (e.key==='ArrowRight' || e.key==='Enter') handleLike()
      if (e.key==='ArrowLeft'  || e.key==='Shift') handleReject()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [chat, matchPopup, handleLike, handleReject])

  const onMatchChat = () => {
    const p = matchPopup
    setMP(null); nextProfile()
    setChat({ ...p, messages: p.messages||[] })
    setSideTab('matched')
  }
  const onMatchSkip = () => {
    showToast('✨ ' + matchPopup.name + ' added to Matched!')
    setMP(null); nextProfile()
  }

  const profile = profiles[idx]

  return (
    <div style={s.root}>
      <Sidebar
        sideTab={sideTab} setSideTab={setSideTab}
        likedUsers={liked} matched={matched}
        chatProfile={chat}
        onOpenChat={setChat} onCloseChat={() => setChat(null)}
      />

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

      {matchPopup && <MatchOverlay other={matchPopup} onChat={onMatchChat} onSkip={onMatchSkip}/>}
      {toast && <Toast message={toast}/>}
    </div>
  )
}

const s = {
  root: { display:'flex', height:'100vh', overflow:'hidden', fontFamily:'var(--sans)', background:'white' },
  main: { flex:1, overflowY:'auto', background:'white', position:'relative', minWidth:0 },
}