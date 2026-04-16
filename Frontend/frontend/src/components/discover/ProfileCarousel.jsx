// src/components/discover/ProfileCarousel.jsx
import { useState, useEffect, useRef } from 'react'

const GRAD = [
  'linear-gradient(155deg,#c4b5fd 0%,#8b5cf6 55%,#5b21b6 100%)',
  'linear-gradient(155deg,#bfdbfe 0%,#60a5fa 55%,#1d4ed8 100%)',
  'linear-gradient(155deg,#d1fae5 0%,#6ee7b7 50%,#059669 100%)',
  'linear-gradient(155deg,#fce7f3 0%,#f9a8d4 50%,#db2777 100%)',
]

const CARD_TRANSITION = 'transform 0.45s cubic-bezier(0.16,1,0.3,1), filter 0.45s ease, opacity 0.45s ease, width 0.45s cubic-bezier(0.16,1,0.3,1), height 0.45s cubic-bezier(0.16,1,0.3,1)'

function getSlotStyle(offset, total) {
  // normalize offset to range [-floor(total/2), ceil(total/2)]
  let o = ((offset % total) + total) % total
  if (o > Math.floor(total / 2)) o -= total

  if (o === 0) return {
    width: 392, height: 560,
    transform: 'translate(-50%, -50%) scale(1) rotateY(0deg)',
    filter: 'brightness(1)',
    zIndex: 10, opacity: 1,
    isCenter: true,
    cursor: 'default',
    pointerEvents: 'none',
    boxShadow: '0 32px 80px rgba(124, 67, 216, 0.22), 0 8px 24px rgba(0,0,0,0.10)',
  }
  if (o === 1 || o === -1) {
    const left = o === -1
    return {
      width: 192, height: 320,
      transform: `translate(calc(-50% ${left ? '- 270px' : '+ 270px'}), -50%) scale(0.88) rotateY(${left ? 22 : -22}deg)`,
      filter: 'brightness(0.55) saturate(0.7)',
      zIndex: 5, opacity: 0.85,
      isCenter: false,
      cursor: 'pointer',
      pointerEvents: 'auto',
      boxShadow: '0 8px 24px rgba(109,40,217,0.08)',
    }
  }
  return {
    width: 192, height: 320,
    transform: 'translate(-50%, -50%) scale(0.7) translateZ(-200px)',
    filter: 'brightness(0)', zIndex: 1, opacity: 0,
    isCenter: false, cursor: 'default', pointerEvents: 'none', boxShadow: 'none',
  }
}

export default function ProfileCarousel({ profile, onLike, onReject, onSuperLike, flyClass }) {
  const photos = profile.photos || []
  const total  = photos.length
  const [center, setCenter] = useState(0)
  const flyingRef = useRef(false)

  useEffect(() => { setCenter(0) }, [profile.id])

  const rotateTo = (idx) => {
    if (flyingRef.current) return
    setCenter(idx)
  }

  // fly animation: animate then call swipe callback
  const triggerFly = (dir, cb) => {
    if (flyingRef.current) return
    flyingRef.current = true
    cb()
    setTimeout(() => { flyingRef.current = false }, 650)
  }

  const handleLike    = () => triggerFly('right', onLike)
  const handleReject  = () => triggerFly('left', onReject)
  const handleSuper   = () => triggerFly('right', onSuperLike)

  if (total === 0) return (
    <div style={s.root}>
      <div style={{ color: '#a78bfa', fontFamily: 'var(--mono)', fontSize: 13, margin: 'auto' }}>no photos yet</div>
    </div>
  )

  // flyClass controls the whole-carousel exit animation from Discover.jsx
  const stageStyle = flyClass === 'fly-right'
    ? { ...s.stage, animation: 'flyRight 0.52s cubic-bezier(0.16,1,0.3,1) forwards' }
    : flyClass === 'fly-left'
    ? { ...s.stage, animation: 'flyLeft 0.52s cubic-bezier(0.16,1,0.3,1) forwards' }
    : s.stage

  return (
    <div style={s.root}>
      <div style={s.ambient} />

      <div style={s.perspective}>
        <div style={stageStyle}>
          {photos.map((photo, i) => {
            const offset = i - center
            const slot   = getSlotStyle(offset, total)

            const bgStyle = photo.url
              ? { backgroundImage: `url(${photo.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: photo.bg || GRAD[i % GRAD.length] }

            return (
              <div
                key={`card-${i}`}
                onClick={() => !slot.isCenter && rotateTo(i)}
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  borderRadius: 24, overflow: 'hidden',
                  border: '2px solid rgba(255,255,255,0.7)',
                  transition: CARD_TRANSITION,
                  willChange: 'transform, filter, opacity, width, height',
                  width: slot.width, height: slot.height,
                  transform: slot.transform,
                  filter: slot.filter,
                  zIndex: slot.zIndex,
                  opacity: slot.opacity,
                  boxShadow: slot.boxShadow,
                  cursor: slot.cursor,
                  pointerEvents: slot.pointerEvents,
                }}
              >
                {/* Background */}
                <div style={{ position: 'absolute', inset: 0, ...bgStyle }}>
                  {!photo.url && (
                    <div style={s.emojiRing}>
                      <span style={{ fontSize: 56 }}>{photo.emoji || '🧑‍💻'}</span>
                    </div>
                  )}
                </div>

                {/* Side card overlay */}
                {!slot.isCenter && (
                  <div style={s.sideOverlay}>
                    <span style={s.sideArrow}>{offset < 0 ? '‹' : '›'}</span>
                  </div>
                )}

                {/* Center card — profile info */}
                {slot.isCenter && (
                  <div style={s.infoOverlay}>
                    <div style={s.compatPill}>
                      <span style={s.compatDot} />
                      <span style={s.compatText}>{profile.compat?.stack || '—'}% match</span>
                    </div>
                    <div style={s.nameRow}>
                      <span style={s.name}>{profile.name}</span>
                      {profile.age && <span style={s.age}>{profile.age}</span>}
                    </div>
                    <div style={s.locRow}>
                      {profile.location && <>
                        <span style={s.locPin}>◈</span>
                        <span style={s.loc}>{profile.location}</span>
                        <span style={s.sep}>·</span>
                      </>}
                      <span style={s.exp}>{profile.experience}</span>
                    </div>
                    <div style={s.tagRow}>
                      {profile.stack?.slice(0, 4).map(t => (
                        <span key={t} style={s.tag}>{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Center card — action buttons (separate layer, pointerEvents re-enabled) */}
                {slot.isCenter && (
                  <div
                    style={s.actionRow}
                    onClick={e => e.stopPropagation()}
                  >
                    <ActionBtn
                      symbol="✕" hint="Shift" size={56}
                      idleColor="#f43f5e" idleBorder="rgba(244,63,94,0.25)"
                      hoverBg="#f43f5e" tilt={-10}
                      onClick={handleReject}
                    />
                    <ActionBtn
                      symbol="★" size={42}
                      idleColor="#f59e0b" idleBorder="rgba(245,158,11,0.25)"
                      hoverBg="#f59e0b" tilt={0}
                      onClick={handleSuper}
                    />
                    <ActionBtn
                      symbol="♥" hint="Enter" size={56}
                      idleColor="#8b5cf6" idleBorder="rgba(139,92,246,0.25)"
                      hoverBg="#8b5cf6" tilt={10}
                      onClick={handleLike}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Dot nav */}
      <div style={s.dotRow}>
        {photos.map((_, i) => (
          <span
            key={i}
            style={{ ...s.dot, ...(i === center ? s.dotActive : {}) }}
            onClick={() => rotateTo(i)}
          />
        ))}
      </div>
    </div>
  )
}

function ActionBtn({ symbol, hint, size, idleColor, idleBorder, hoverBg, tilt, onClick }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      style={{
        width: size, height: size, borderRadius: '50%',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 1,
        border: `2px solid ${hov ? hoverBg : idleBorder}`,
        background: hov ? hoverBg : 'rgba(255,255,255,0.94)',
        backdropFilter: 'blur(10px)',
        color: hov ? 'white' : idleColor,
        transform: hov ? `scale(1.14) rotate(${tilt}deg)` : 'scale(1)',
        transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: hov ? `0 8px 28px ${hoverBg}55` : '0 3px 12px rgba(0,0,0,0.10)',
        cursor: 'pointer', outline: 'none',
        fontFamily: 'var(--sans)', pointerEvents: 'auto',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={(e) => { e.stopPropagation(); onClick?.() }}
    >
      <span style={{ fontSize: size > 46 ? 20 : 15, lineHeight: 1 }}>{symbol}</span>
      {hint && (
        <span style={{ fontSize: 7, fontFamily: 'var(--mono)', fontWeight: 700, opacity: 0.6, letterSpacing: '0.4px' }}>
          {hint}
        </span>
      )}
    </button>
  )
}

const s = {
  root: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    height: '100vh', overflow: 'hidden',
    background: 'white', position: 'relative',
    paddingBottom: 24, boxSizing: 'border-box',
  },
  ambient: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse 70% 45% at 50% 30%, rgba(139,92,246,0.055) 0%, transparent 70%)',
  },
  perspective: {
    perspective: '1200px', perspectiveOrigin: '50% 50%',
    width: '100%', flex: 1, minHeight: 0, position: 'relative',
  },
  stage: { position: 'absolute', inset: 0, transformStyle: 'preserve-3d' },
  emojiRing: {
    position: 'absolute', top: '42%', left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 120, height: 120, borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(8px)',
    border: '2.5px solid rgba(255,255,255,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  },
  sideOverlay: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(10,0,30,0.12)',
  },
  sideArrow: {
    fontSize: 28, color: 'rgba(255,255,255,0.7)',
    fontWeight: 300, lineHeight: 1,
  },
  infoOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: '88px 18px 88px',
    background: 'linear-gradient(to top, rgba(18,5,50,0.94) 0%, rgba(18,5,50,0.55) 55%, transparent 100%)',
    zIndex: 10, pointerEvents: 'none',
  },
  compatPill: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: 'rgba(139,92,246,0.35)',
    border: '1px solid rgba(167,139,250,0.45)',
    backdropFilter: 'blur(10px)',
    borderRadius: 20, padding: '3px 10px 3px 7px', marginBottom: 10,
  },
  compatDot: { width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' },
  compatText: { fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.3px' },
  nameRow: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 },
  name: { fontSize: 23, fontWeight: 700, color: 'white', letterSpacing: '-0.3px', lineHeight: 1.1 },
  age:  { fontSize: 18, fontWeight: 400, color: 'rgba(255,255,255,0.68)' },
  locRow: { display: 'flex', alignItems: 'center', gap: 5, marginBottom: 9 },
  locPin: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  loc:   { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  sep:   { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  exp:   { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontFamily: 'var(--mono)' },
  tagRow: { display: 'flex', gap: 5, flexWrap: 'wrap' },
  tag: {
    fontFamily: 'var(--mono)', fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    background: 'rgba(139,92,246,0.32)',
    border: '1px solid rgba(167,139,250,0.3)',
    padding: '3px 9px', borderRadius: 20,
    backdropFilter: 'blur(4px)',
  },
  actionRow: {
    position: 'absolute', bottom: 20, left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex', alignItems: 'center', gap: 14,
    zIndex: 30, pointerEvents: 'auto',
  },
  dotRow: {
    display: 'flex', gap: 6, paddingTop: 8,
    flexShrink: 0, position: 'relative', zIndex: 20,
  },
  dot: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'rgba(139,92,246,0.18)',
    cursor: 'pointer', transition: 'all 0.25s',
  },
  dotActive: { background: '#8b5cf6', width: 22, borderRadius: 3 },


}