// src/components/discover/ProfileCarousel.jsx
import { useState, useEffect, useRef } from 'react'

const CARD_W = 300
const CARD_H = 470
const SIDE_W = 210
const SIDE_H = 340

const CARD_TRANSITION = 'transform 0.5s cubic-bezier(0.16,1,0.3,1), filter 0.5s ease, opacity 0.5s ease, width 0.5s cubic-bezier(0.16,1,0.3,1), height 0.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.4s ease'

function getSlotStyle(offset, total) {
  let o = offset
  if (o >  total / 2) o -= total
  if (o < -total / 2) o += total

  if (o === 0) return {
    width: CARD_W + 'px', height: CARD_H + 'px',
    transform: `translate(-50%, -50%)`,
    filter: 'brightness(1)',
    zIndex: 10, opacity: 1,
    boxShadow: '0 28px 70px rgba(109,40,217,0.28), 0 8px 24px rgba(0,0,0,0.14)',
    cursor: 'default', pointerEvents: 'auto',
  }
  if (o === 1 || o === -1) {
    const left = o === -1
    const tx = left ? `calc(-50% - 295px)` : `calc(-50% + 295px)`
    return {
      width: SIDE_W + 'px', height: SIDE_H + 'px',
      transform: `translate(${tx}, -50%) translateZ(-90px) rotateY(${left ? 28 : -28}deg)`,
      filter: 'brightness(0.6)',
      zIndex: 5, opacity: 1,
      boxShadow: '0 8px 28px rgba(109,40,217,0.10)',
      cursor: 'pointer', pointerEvents: 'auto',
    }
  }
  return {
    width: SIDE_W + 'px', height: SIDE_H + 'px',
    transform: `translate(-50%, -50%) translateZ(-300px) rotateY(0deg)`,
    filter: 'brightness(0)',
    zIndex: 1, opacity: 0,
    boxShadow: 'none',
    cursor: 'default', pointerEvents: 'none',
  }
}

export default function ProfileCarousel({ profile, onLike, onReject, onSuperLike, flyClass }) {
  const photos   = profile.photos || []
  const total    = photos.length
  const [center, setCenter] = useState(0)
  const cardRefs  = useRef([])
  const centerRef = useRef(0)
  const lockRef   = useRef(false)

  useEffect(() => {
    setCenter(0)
    centerRef.current = 0
  }, [profile.id])

  useEffect(() => {
    centerRef.current = center
    cardRefs.current.forEach((el, i) => {
      if (!el) return
      const offset = i - center
      const style  = getSlotStyle(offset, total)
      el.style.width      = style.width
      el.style.height     = style.height
      el.style.transform  = style.transform
      el.style.filter     = style.filter
      el.style.zIndex     = style.zIndex
      el.style.opacity    = style.opacity
      el.style.boxShadow  = style.boxShadow
      el.style.cursor     = style.cursor
      el.style.pointerEvents = style.pointerEvents

      const overlay = el.querySelector('[data-overlay]')
      const buttons = el.querySelector('[data-buttons]')
      const taphint = el.querySelector('[data-taphint]')
      if (overlay) overlay.style.display = offset === 0 ? 'block' : 'none'
      if (buttons) buttons.style.display = offset === 0 ? 'flex'  : 'none'
      if (taphint) taphint.style.display = offset === 0 ? 'none'  : 'block'
    })
  }, [center, total])

  const rotateTo = (idx) => {
    if (lockRef.current || idx === centerRef.current) return
    lockRef.current = true
    setCenter(idx)
    setTimeout(() => { lockRef.current = false }, 520)
  }

  const flyStyle = flyClass === 'fly-right'
    ? { animation: 'flyRight 0.52s cubic-bezier(0.16,1,0.3,1) forwards' }
    : flyClass === 'fly-left'
      ? { animation: 'flyLeft 0.52s cubic-bezier(0.16,1,0.3,1) forwards' }
      : {}

  return (
    <div style={s.root}>
      <div style={s.ambient} />

      {/* Fixed-height perspective container so absolute cards have a real parent */}
      <div style={s.perspective}>
        <div style={{ ...s.stage, ...flyStyle }}>
          {photos.map((photo, i) => {
            const initOffset = i - 0
            const initStyle  = getSlotStyle(initOffset, total)

            return (
              <div
                key={`card-${i}`}
                ref={el => { cardRefs.current[i] = el }}
                onClick={() => rotateTo(i)}
                style={{
                  position: 'absolute',
                  top:  '50%',
                  left: '50%',
                  borderRadius: 22,
                  overflow: 'hidden',
                  border: '2.5px solid rgba(255,255,255,0.78)',
                  transition: CARD_TRANSITION,
                  willChange: 'transform, filter, opacity',
                  // initial styles — useEffect will keep these in sync
                  width:     initStyle.width,
                  height:    initStyle.height,
                  transform: initStyle.transform,
                  filter:    initStyle.filter,
                  zIndex:    initStyle.zIndex,
                  opacity:   initStyle.opacity,
                  boxShadow: initStyle.boxShadow,
                  cursor:    initStyle.cursor,
                  pointerEvents: initStyle.pointerEvents,
                }}
              >
                {/* Photo background */}
                <div style={{ ...s.cardBg, background: photo?.bg || '#ede8ff' }}>
                  <div style={s.emojiRingLg}>
                    <span style={{ fontSize: 60 }}>{photo?.emoji || '🧑‍💻'}</span>
                  </div>
                </div>

                {/* Tap hint — side cards only */}
                <div data-taphint="" style={{ ...s.tapHint, display: initOffset === 0 ? 'none' : 'block' }}>
                  {i < total / 2 ? '‹ tap' : 'tap ›'}
                </div>

                {/* Info overlay — center card only */}
                <div data-overlay="" style={{ ...s.overlay, display: initOffset === 0 ? 'block' : 'none' }}>
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

                {/* Floating action buttons — center card only */}
                <div
                  data-buttons=""
                  style={{ ...s.actionRow, display: initOffset === 0 ? 'flex' : 'none' }}
                  onClick={e => e.stopPropagation()}
                >
                  <ActionBtn symbol="✕" hint="Shift" size={54} idleColor="#f43f5e" idleBorder="rgba(244,63,94,0.3)"  hoverBg="#f43f5e" tilt={-10} onClick={onReject}    />
                  <ActionBtn symbol="★"              size={40} idleColor="#f59e0b" idleBorder="rgba(245,158,11,0.3)" hoverBg="#f59e0b" tilt={0}   onClick={onSuperLike} />
                  <ActionBtn symbol="♥" hint="Enter" size={54} idleColor="#8b5cf6" idleBorder="rgba(139,92,246,0.3)" hoverBg="#8b5cf6" tilt={10}  onClick={onLike}      />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dot indicators */}
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
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
        border: `2px solid ${hov ? hoverBg : idleBorder}`,
        background: hov ? hoverBg : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        color: hov ? 'white' : idleColor,
        transform: hov ? `scale(1.13) rotate(${tilt}deg)` : 'scale(1)',
        transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: hov ? `0 8px 28px ${hoverBg}66` : '0 4px 16px rgba(0,0,0,0.13)',
        cursor: 'pointer', outline: 'none', fontFamily: 'var(--sans)',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={(e) => { e.stopPropagation(); onClick?.() }}
    >
      <span style={{ fontSize: size > 46 ? 22 : 16, lineHeight: 1 }}>{symbol}</span>
      {hint && (
        <span style={{ fontSize: 8, fontFamily: 'var(--mono)', fontWeight: 700, opacity: 0.65, letterSpacing: '0.3px' }}>
          {hint}
        </span>
      )}
    </button>
  )
}

const s = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100vh',
    overflow: 'hidden',
    background: 'white',
    position: 'relative',
    boxSizing: 'border-box',
    paddingBottom: 28,
  },
  ambient: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse 80% 50% at 50% 28%, rgba(139,92,246,0.07) 0%, transparent 70%)',
  },
  perspective: {
    perspective: '1100px',
    perspectiveOrigin: '50% 50%',
    width: '100%',
    flex: 1,
    minHeight: 0,
    position: 'relative',   // ← critical: gives absolute children a real containing block
  },
  stage: {
    position: 'absolute',   // ← fills the perspective div
    inset: 0,
    transformStyle: 'preserve-3d',
  },
  cardBg: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  },
  emojiRingLg: {
    width: 130, height: 130, borderRadius: '50%',
    background: 'rgba(255,255,255,0.22)',
    backdropFilter: 'blur(8px)',
    border: '3px solid rgba(255,255,255,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 36px rgba(0,0,0,0.10)',
    marginBottom: 60,
  },
  tapHint: {
    position: 'absolute', bottom: 14, left: '50%',
    transform: 'translateX(-50%)',
    fontFamily: 'var(--mono)', fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: '0.8px', textTransform: 'uppercase', whiteSpace: 'nowrap',
    zIndex: 5,
  },
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: '90px 18px 84px',
    background: 'linear-gradient(to top, rgba(22,6,54,0.93) 0%, rgba(22,6,54,0.52) 55%, transparent 100%)',
    zIndex: 10, pointerEvents: 'none',
  },
  compatPill: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    background: 'rgba(139,92,246,0.40)', border: '1px solid rgba(167,139,250,0.5)',
    backdropFilter: 'blur(8px)', borderRadius: 20,
    padding: '3px 10px 3px 7px', marginBottom: 10,
  },
  compatDot: { width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' },
  compatText: { fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.3px' },
  nameRow: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 },
  name: { fontSize: 24, fontWeight: 700, color: 'white', letterSpacing: '-0.3px', lineHeight: 1.1 },
  age:  { fontSize: 18, fontWeight: 400, color: 'rgba(255,255,255,0.70)' },
  locRow: { display: 'flex', alignItems: 'center', gap: 5, marginBottom: 9 },
  locPin: { fontSize: 11, color: 'rgba(255,255,255,0.55)' },
  loc:   { fontSize: 12, color: 'rgba(255,255,255,0.78)' },
  sep:   { fontSize: 12, color: 'rgba(255,255,255,0.38)' },
  exp:   { fontSize: 12, color: 'rgba(255,255,255,0.68)', fontFamily: 'var(--mono)' },
  tagRow: { display: 'flex', gap: 5, flexWrap: 'wrap' },
  tag: {
    fontFamily: 'var(--mono)', fontSize: 10,
    color: 'rgba(255,255,255,0.88)',
    background: 'rgba(139,92,246,0.38)',
    border: '1px solid rgba(167,139,250,0.35)',
    padding: '3px 9px', borderRadius: 20, backdropFilter: 'blur(4px)',
  },
  actionRow: {
    position: 'absolute', bottom: 18, left: '50%',
    transform: 'translateX(-50%)',
    alignItems: 'center', gap: 14,
    zIndex: 30,
  },
  dotRow: {
    display: 'flex', gap: 6,
    paddingTop: 10, flexShrink: 0,
    position: 'relative', zIndex: 20,
  },
  dot: {
    width: 6, height: 6, borderRadius: '50%',
    background: 'rgba(139,92,246,0.22)',
    cursor: 'pointer', transition: 'all 0.25s',
  },
  dotActive: { background: '#8b5cf6', width: 22, borderRadius: 3 },
}