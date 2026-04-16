// src/components/discover/ProfileCard.jsx
// Full-viewport card — photos of ONE person cycle inside it.
// Floating reject/like buttons sit on top of the card.
// Name + stack overlay at the bottom of the image.

import { useState, useCallback } from 'react'

export default function ProfileCard({ profile, onLike, onReject, onSuperLike, flyClass }) {
  const [photoIdx, setPhotoIdx] = useState(0)
  const photos = profile.photos || []
  const total  = photos.length
  const photo = photos[photoIdx]

  const prevPhoto = useCallback((e) => {
    e.stopPropagation()
    setPhotoIdx(i => (i - 1 + total) % total)
  }, [total])

  const nextPhoto = useCallback((e) => {
    e.stopPropagation()
    setPhotoIdx(i => (i + 1) % total)
  }, [total])

  // tap left/right halves to navigate photos
  const handleCardTap = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x    = e.clientX - rect.left
    if (x < rect.width / 2) {
      setPhotoIdx(i => (i - 1 + total) % total)
    } else {
      setPhotoIdx(i => (i + 1) % total)
    }
  }, [total])

  // Reset photo index when profile changes
  useState(() => { setPhotoIdx(0) })

  const flyStyle = flyClass === 'fly-right'
    ? { animation: 'flyRight 0.52s cubic-bezier(0.16,1,0.3,1) forwards' }
    : flyClass === 'fly-left'
      ? { animation: 'flyLeft 0.52s cubic-bezier(0.16,1,0.3,1) forwards' }
      : {}

  return (
    <div style={{ ...s.wrap, ...flyStyle }}>

      {/* ── THE CARD ── */}
      <div style={{
        ...s.card,
        background: photo?.bg || '#ede8ff',
        backgroundImage: photo?.url ? `url(${photo.url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        }} onClick={handleCardTap}>

        {/* Photo indicator dots */}
        <div style={s.photoDots}>
          {photos.map((_, i) => (
            <div key={i} style={{ ...s.photoDot, ...(i === photoIdx ? s.photoDotActive : {}) }} />
          ))}
        </div>

        {/* Tap zones hint arrows — subtle */}
        <div style={s.tapLeft}  onClick={prevPhoto}>‹</div>
        <div style={s.tapRight} onClick={nextPhoto}>›</div>

        {/* Big emoji / photo placeholder */}
        {/* <div style={s.photoContent}>
          <div style={s.emojiWrap}>
            <span style={s.emoji}>{photo?.emoji || '🧑‍💻'}</span>
          </div>
          {photo?.caption && (
            <div style={s.photoCaption}>{photo.caption}</div>
          )}
        </div> */}
        {!photo?.url && (
        <div style={s.photoContent}>
            <div style={s.emojiWrap}>
            <span style={s.emoji}>{photo?.emoji || '🧑‍💻'}</span>
            </div>
            {photo?.caption && (
            <div style={s.photoCaption}>{photo.caption}</div>
          )}

        </div>
        )}

        {/* Bottom gradient overlay with name, age, stack */}
        <div style={s.overlay}>
          {/* Compat pill */}
          <div style={s.compatPill}>
            <span style={s.compatDot}/>
            <span style={s.compatText}>{profile.compat?.stack || 0}% match</span>
          </div>

          <div style={s.nameRow}>
            <span style={s.name}>{profile.name}</span>
            <span style={s.age}>{profile.age}</span>
          </div>
          <div style={s.locationRow}>
            <span style={s.locationPin}>◈</span>
            <span style={s.location}>{profile.location}</span>
            <span style={s.dot}>·</span>
            <span style={s.exp}>{profile.experience}</span>
          </div>
          <div style={s.tagRow}>
            {profile.stack?.slice(0, 4).map(t => (
              <span key={t} style={s.tag}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── FLOATING ACTION BUTTONS ── */}
      <div style={s.actionRow}>
        <RejectBtn onClick={onReject} />
        <SuperBtn  onClick={onSuperLike} />
        <LikeBtn   onClick={onLike} />
      </div>

    </div>
  )
}

/* ── Individual button components ── */

function RejectBtn({ onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      style={{ ...s.actionBtn, ...s.rejectBtn, ...(hov ? s.rejectHov : {}) }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onClick}
    >
      <span style={s.btnSymbol}>✕</span>
      <span style={s.btnLabel}>Shift</span>
    </button>
  )
}

function SuperBtn({ onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      style={{ ...s.actionBtn, ...s.superBtn, ...(hov ? s.superHov : {}) }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onClick}
    >
      <span style={{ ...s.btnSymbol, fontSize: 18 }}>★</span>
    </button>
  )
}

function LikeBtn({ onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      style={{ ...s.actionBtn, ...s.likeBtn, ...(hov ? s.likeHov : {}) }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={onClick}
    >
      <span style={s.btnSymbol}>♥</span>
      <span style={s.btnLabel}>Enter</span>
    </button>
  )
}

const s = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    position: 'relative',
  },

  /* THE CARD — fills the viewport */
  card: {
    flex: 1,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    userSelect: 'none',
    minHeight: 0,
  
  },

  /* Photo progress dots at top */
  photoDots: {
    position: 'absolute',
    top: 14,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: 5,
    zIndex: 20,
  },
  photoDot: {
    height: 3,
    width: 28,
    borderRadius: 3,
    background: 'rgba(255,255,255,0.35)',
    transition: 'all 0.3s',
  },
  photoDotActive: {
    background: 'rgba(255,255,255,0.95)',
    width: 40,
  },

  /* Tap zones */
  tapLeft: {
    position: 'absolute',
    top: '60%', left: 12,
    transform: 'translateY(-50%)',
    zIndex: 15,
    width: 32, height: 32,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255,255,255,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tapRight: {
    position: 'absolute',
    top: '50%', right: 12,
    transform: 'translateY(-50%)',
    zIndex: 15,
    width: 32, height: 32,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255,255,255,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },

  /* Center content */
  photoContent: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emojiWrap: {
    width: 140, height: 140,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.22)',
    backdropFilter: 'blur(8px)',
    border: '3px solid rgba(255,255,255,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
  },
  emoji: { fontSize: 64 },
  photoCaption: {
    fontFamily: 'var(--mono)',
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    background: 'rgba(0,0,0,0.2)',
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(255,255,255,0.15)',
    padding: '4px 14px',
    borderRadius: 20,
    letterSpacing: '0.5px',
  },

  /* Bottom name overlay */
  overlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: '80px 22px 20px',
    background: 'linear-gradient(to top, rgba(30,10,60,0.92) 0%, rgba(30,10,60,0.5) 50%, transparent 100%)',
    zIndex: 10,
  },
  compatPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    background: 'rgba(139,92,246,0.45)',
    border: '1px solid rgba(167,139,250,0.5)',
    backdropFilter: 'blur(8px)',
    borderRadius: 20,
    padding: '3px 10px 3px 7px',
    marginBottom: 10,
  },
  compatDot: {
    width: 6, height: 6, borderRadius: '50%',
    background: '#a78bfa', display: 'inline-block',
  },
  compatText: {
    fontFamily: 'var(--mono)', fontSize: 10,
    color: 'rgba(255,255,255,0.9)', letterSpacing: '0.3px',
  },
  nameRow: {
    display: 'flex', alignItems: 'baseline', gap: 8,
    marginBottom: 4,
  },
  name: {
    fontSize: 26, fontWeight: 700, color: 'white', letterSpacing: '-0.3px',
    lineHeight: 1.1,
  },
  age: {
    fontSize: 20, fontWeight: 400, color: 'rgba(255,255,255,0.75)',
  },
  locationRow: {
    display: 'flex', alignItems: 'center', gap: 5,
    marginBottom: 10,
  },
  locationPin: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  location: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  dot: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  exp: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--mono)' },
  tagRow: { display: 'flex', gap: 5, flexWrap: 'wrap' },
  tag: {
    fontFamily: 'var(--mono)', fontSize: 10,
    color: 'rgba(255,255,255,0.88)',
    background: 'rgba(139,92,246,0.4)',
    border: '1px solid rgba(167,139,250,0.35)',
    padding: '3px 9px', borderRadius: 20,
    backdropFilter: 'blur(4px)',
  },

  /* ── FLOATING ACTION BUTTONS ── */
  actionRow: {
    position: 'absolute',
    bottom: 28,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    zIndex: 30,
  },
  actionBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    border: 'none', cursor: 'pointer',
    transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
    fontFamily: 'var(--sans)',
    outline: 'none',
  },
  rejectBtn: {
    width: 60, height: 60,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.95)',
    border: '2px solid rgba(244,63,94,0.3)',
    boxShadow: '0 6px 24px rgba(244,63,94,0.2), 0 2px 8px rgba(0,0,0,0.12)',
    color: '#f43f5e',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
  },
  rejectHov: {
    transform: 'scale(1.12) rotate(-8deg)',
    background: '#f43f5e',
    color: 'white',
    boxShadow: '0 8px 30px rgba(244,63,94,0.45)',
    border: '2px solid #f43f5e',
  },
  superBtn: {
    width: 46, height: 46,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.95)',
    border: '2px solid rgba(245,158,11,0.3)',
    boxShadow: '0 4px 16px rgba(245,158,11,0.2), 0 2px 8px rgba(0,0,0,0.10)',
    color: '#f59e0b',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  superHov: {
    transform: 'scale(1.14)',
    background: '#f59e0b',
    color: 'white',
    boxShadow: '0 6px 24px rgba(245,158,11,0.45)',
  },
  likeBtn: {
    width: 60, height: 60,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.95)',
    border: '2px solid rgba(139,92,246,0.3)',
    boxShadow: '0 6px 24px rgba(139,92,246,0.22), 0 2px 8px rgba(0,0,0,0.12)',
    color: '#8b5cf6',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
  },
  likeHov: {
    transform: 'scale(1.12) rotate(8deg)',
    background: '#8b5cf6',
    color: 'white',
    boxShadow: '0 8px 30px rgba(139,92,246,0.45)',
    border: '2px solid #8b5cf6',
  },
  btnSymbol: { fontSize: 22, lineHeight: 1 },
  btnLabel: { fontSize: 9, fontFamily: 'var(--mono)', fontWeight: 600, letterSpacing: '0.3px', opacity: 0.7 },
}