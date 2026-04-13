// src/components/discover/ProfileCarousel.jsx
// One person's photos shown as a 3-card carousel.
// Center card = main, large, bright.
// Side cards = smaller, dimmer, rotated slightly.
// Clicking a side card rotates it to center with animation.

import { useState, useEffect } from 'react'

export default function ProfileCarousel({ profile, onLike, onReject, onSuperLike, flyClass }) {
  const photos = profile.photos || []
  const total  = photos.length
  const [centerIdx, setCenterIdx] = useState(0)
  const [animating, setAnimating] = useState(false)

  // Reset to first photo whenever the profile changes
  useEffect(() => { setCenterIdx(0) }, [profile.id])

  const leftIdx  = (centerIdx - 1 + total) % total
  const rightIdx = (centerIdx + 1) % total

  const rotateTo = (newCenter) => {
    if (animating || newCenter === centerIdx) return
    setAnimating(true)
    setCenterIdx(newCenter)
    setTimeout(() => setAnimating(false), 450)
  }

  const flyStyle = flyClass === 'fly-right'
    ? { animation: 'flyRight 0.52s cubic-bezier(0.16,1,0.3,1) forwards' }
    : flyClass === 'fly-left'
      ? { animation: 'flyLeft 0.52s cubic-bezier(0.16,1,0.3,1) forwards' }
      : {}

  return (
    <div style={s.root}>

      {/* ── Subtle background ── */}
      <div style={s.bg} />

      {/* ── 3-card stage ── */}
      <div style={{ ...s.stage, ...flyStyle }}>

        {/* LEFT card */}
        <PhotoCard
          photo={photos[leftIdx]}
          profile={profile}
          position="left"
          onClick={() => rotateTo(leftIdx)}
        />

        {/* CENTER card */}
        <PhotoCard
          photo={photos[centerIdx]}
          profile={profile}
          position="center"
        />

        {/* RIGHT card */}
        <PhotoCard
          photo={photos[rightIdx]}
          profile={profile}
          position="right"
          onClick={() => rotateTo(rightIdx)}
        />
      </div>

      {/* ── Photo dots ── */}
      <div style={s.dots}>
        {photos.map((_, i) => (
          <span
            key={i}
            style={{ ...s.dot, ...(i === centerIdx ? s.dotActive : {}) }}
            onClick={() => rotateTo(i)}
          />
        ))}
      </div>

      {/* ── Floating action buttons ── */}
      <div style={s.actionRow}>
        <ActionBtn
          onClick={onReject}
          symbol="✕"
          hint="Shift"
          size={58}
          idleColor="#f43f5e"
          idleBorder="rgba(244,63,94,0.25)"
          idleBg="white"
          hoverBg="#f43f5e"
          rotateDeg={-10}
        />
        <ActionBtn
          onClick={onSuperLike}
          symbol="★"
          size={44}
          idleColor="#f59e0b"
          idleBorder="rgba(245,158,11,0.25)"
          idleBg="white"
          hoverBg="#f59e0b"
          rotateDeg={0}
        />
        <ActionBtn
          onClick={onLike}
          symbol="♥"
          hint="Enter"
          size={58}
          idleColor="#8b5cf6"
          idleBorder="rgba(139,92,246,0.25)"
          idleBg="white"
          hoverBg="#8b5cf6"
          rotateDeg={10}
        />
      </div>

    </div>
  )
}

/* ── Individual photo card ── */
function PhotoCard({ photo, profile, position, onClick }) {
  const isCenter = position === 'center'
  const isLeft   = position === 'left'

  return (
    <div
      style={{
        ...s.card,
        ...(isCenter ? s.cardCenter : isLeft ? s.cardLeft : s.cardRight),
      }}
      onClick={onClick}
    >
      {/* Full-bleed gradient background */}
      <div style={{ ...s.cardBg, background: photo?.bg || '#ede8ff' }}>

        {/* Big emoji in center */}
        <div style={{ ...s.emojiCircle, ...(isCenter ? s.emojiCircleCenter : s.emojiCircleSide) }}>
          <span style={{ fontSize: isCenter ? 58 : 38 }}>{photo?.emoji || '🧑‍💻'}</span>
        </div>

        {/* Caption pill — only on center */}
        {isCenter && photo?.caption && (
          <div style={s.captionPill}>
            <span style={s.captionText}>{photo.caption}</span>
          </div>
        )}

        {/* "Click to view" hint on side cards */}
        {!isCenter && (
          <div style={s.sideCta}>tap</div>
        )}
      </div>

      {/* Name + stack overlay — only on center card */}
      {isCenter && (
        <div style={s.overlay}>
          <div style={s.compatPill}>
            <span style={s.compatDot} />
            <span style={s.compatText}>{profile.compat?.stack || 0}% match</span>
          </div>
          <div style={s.nameRow}>
            <span style={s.name}>{profile.name}</span>
            <span style={s.age}>{profile.age}</span>
          </div>
          <div style={s.locRow}>
            <span style={s.locPin}>◈</span>
            <span style={s.loc}>{profile.location}</span>
            <span style={s.sep}>·</span>
            <span style={s.exp}>{profile.experience}</span>
          </div>
          <div style={s.tagRow}>
            {profile.stack?.slice(0, 4).map(t => (
              <span key={t} style={s.tag}>{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Action button ── */
function ActionBtn({ onClick, symbol, hint, size, idleColor, idleBorder, idleBg, hoverBg, rotateDeg }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      style={s.actionBtn}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
    >
      <div style={{
        width: size, height: size,
        borderRadius: '50%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
        border: `2px solid ${hov ? hoverBg : idleBorder}`,
        background: hov ? hoverBg : idleBg,
        color: hov ? 'white' : idleColor,
        transform: hov ? `scale(1.13) rotate(${rotateDeg}deg)` : 'scale(1) rotate(0deg)',
        transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: hov
          ? `0 8px 28px ${hoverBg}55`
          : '0 4px 16px rgba(0,0,0,0.10)',
        cursor: 'pointer',
      }}>
        <span style={{ fontSize: size > 50 ? 22 : 17, lineHeight: 1 }}>{symbol}</span>
        {hint && <span style={{ fontSize: 9, fontFamily: 'var(--mono)', fontWeight: 700, opacity: 0.65, letterSpacing: '0.3px' }}>{hint}</span>}
      </div>
    </div>
  )
}

/* ── Styles ── */
const s = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 0 20px',
    background: 'white',
    position: 'relative',
  },

  bg: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse 70% 50% at 50% 30%, rgba(139,92,246,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  /* Stage that holds all 3 cards side by side */
  stage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,           // gap is handled by transforms
    position: 'relative',
    width: '100%',
    height: 420,
  },

  /* ── Card base ── */
  card: {
    position: 'absolute',
    borderRadius: 24,
    overflow: 'hidden',
    transition: 'all 0.42s cubic-bezier(0.16, 1, 0.3, 1)',
    border: '2px solid rgba(255,255,255,0.7)',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
  },
  cardCenter: {
    width: 260,
    height: 380,
    transform: 'translateX(0px) scale(1) rotate(0deg)',
    zIndex: 10,
    cursor: 'default',
    boxShadow: '0 24px 64px rgba(109,40,217,0.22), 0 6px 20px rgba(0,0,0,0.10)',
    border: '2px solid rgba(255,255,255,0.9)',
  },
  cardLeft: {
    width: 190,
    height: 280,
    transform: 'translateX(-210px) scale(1) rotate(-5deg)',
    zIndex: 5,
    filter: 'brightness(0.72)',
    boxShadow: '0 8px 32px rgba(109,40,217,0.12)',
  },
  cardRight: {
    width: 190,
    height: 280,
    transform: 'translateX(210px) scale(1) rotate(5deg)',
    zIndex: 5,
    filter: 'brightness(0.72)',
    boxShadow: '0 8px 32px rgba(109,40,217,0.12)',
  },

  cardBg: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emojiCircle: {
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.28)',
    backdropFilter: 'blur(6px)',
    border: '2.5px solid rgba(255,255,255,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
  },
  emojiCircleCenter: { width: 110, height: 110 },
  emojiCircleSide:   { width: 76, height: 76 },

  captionPill: {
    position: 'absolute',
    bottom: 12,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.22)',
    backdropFilter: 'blur(6px)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 20,
    padding: '3px 12px',
  },
  captionText: {
    fontFamily: 'var(--mono)',
    fontSize: 10,
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: '0.4px',
  },

  sideCta: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: 'var(--mono)',
    fontSize: 9,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
  },

  /* Name / info overlay on center card */
  overlay: {
    padding: '14px 16px 14px',
    background: 'white',
    flexShrink: 0,
  },
  compatPill: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: 'rgba(139,92,246,0.10)',
    border: '1px solid rgba(139,92,246,0.20)',
    borderRadius: 20, padding: '2px 9px',
    marginBottom: 8,
  },
  compatDot: {
    width: 5, height: 5, borderRadius: '50%',
    background: '#8b5cf6', display: 'inline-block',
  },
  compatText: { fontFamily: 'var(--mono)', fontSize: 9, color: '#6d28d9', letterSpacing: '0.3px' },
  nameRow: { display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 3 },
  name: { fontSize: 20, fontWeight: 700, color: '#2e1065', letterSpacing: '-0.3px' },
  age:  { fontSize: 16, fontWeight: 400, color: '#8b7eb8' },
  locRow: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 },
  locPin: { fontSize: 10, color: '#a78bfa' },
  loc:   { fontSize: 11, color: '#8b7eb8' },
  sep:   { fontSize: 11, color: '#ddd6fe' },
  exp:   { fontSize: 11, color: '#8b7eb8', fontFamily: 'var(--mono)' },
  tagRow: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  tag: {
    fontFamily: 'var(--mono)', fontSize: 9,
    color: '#6d28d9',
    background: '#ede8ff',
    border: '1px solid #ddd6fe',
    padding: '2px 8px', borderRadius: 20,
  },

  /* Dots */
  dots: {
    display: 'flex', gap: 6, marginTop: 16,
  },
  dot: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'rgba(139,92,246,0.2)',
    cursor: 'pointer', transition: 'all 0.25s',
  },
  dotActive: {
    background: '#8b5cf6',
    width: 22,
    borderRadius: 3,
  },

  /* Floating action buttons row below the cards */
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
  },
  actionBtn: {
    cursor: 'pointer',
    userSelect: 'none',
  },
}