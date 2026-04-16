// src/components/discover/ProfileDetail.jsx
import { useEffect, useRef } from 'react'

const GALLERY_BG = ['#ede8ff','#dbeafe','#d1fae5','#fef3c7','#ffe4e6','#fce7f3']
const GALLERY_H  = [130, 168, 146, 178, 136, 158]

export default function ProfileDetail({ profile }) {
  const ref = useRef()
  useEffect(() => { if (ref.current) ref.current.scrollTop = 0 }, [profile.id])

  const stack      = profile.stack || []
  const stackColors = profile.stackColors || stack.map(() => '#8b5cf6')
  const photos     = profile.photos || []
  const compat     = profile.compat || { stack: 0, vibe: 0, collab: 0 }

  const infoItems = [
    { k: 'Experience', v: profile.experience },
    { k: 'Location',   v: profile.location   },
    { k: 'Philosophy', v: profile.philosophy  },
    { k: 'Open Source',v: profile.openSource  },
  ].filter(item => item.v)

  return (
    <div ref={ref} style={s.root}>

      {/* Bio */}
      <Section label="// bio">
        <CardTitle>About</CardTitle>
        <p style={s.bioText}>{profile.bio || 'No bio yet.'}</p>
        {profile.github && (
          <div style={s.ghRow}>
            <span style={s.ghIcon}>⬡</span>
            <a href={profile.github} target="_blank" rel="noreferrer" style={s.ghLink}>
              {profile.github}
            </a>
          </div>
        )}
      </Section>

      {infoItems.length > 0 && (
        <Section label="// quick.info">
          <CardTitle>Quick Info</CardTitle>
          <div style={s.infoGrid}>
            {infoItems.map(({ k, v }) => (
              <div key={k} style={s.infoItem}>
                <div style={s.infoKey}>{k}</div>
                <div style={s.infoVal}>{v}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {stack.length > 0 && (
        <Section label="// tech.stack">
          <CardTitle>Stack</CardTitle>
          <div style={s.stackRow}>
            {stack.map((t, i) => (
              <span key={t} style={s.techBadge}>
                <span style={{ ...s.techDot, background: stackColors[i] || '#8b5cf6' }} />
                {t}
              </span>
            ))}
          </div>
        </Section>
      )}

      {(compat.stack > 0 || compat.vibe > 0 || compat.collab > 0) && (
        <Section label="// compatibility.score">
          <CardTitle>Match Analysis</CardTitle>
          <div style={s.compatWrap}>
            <CompatBar label="Tech Stack"   pct={compat.stack}  />
            <CompatBar label="Work Vibe"    pct={compat.vibe}   />
            <CompatBar label="Collab Style" pct={compat.collab} />
          </div>
        </Section>
      )}

      {photos.length > 0 && (
        <Section label="// gallery">
          <CardTitle>Photos</CardTitle>
          <div style={s.masonry}>
            {photos.map((ph, i) => (
              <div
                key={i}
                style={{
                  ...s.galleryItem,
                  height: GALLERY_H[i % GALLERY_H.length],
                  background: ph.url
                    ? `url(${ph.url}) center/cover no-repeat`
                    : (ph.bg || GALLERY_BG[i % GALLERY_BG.length]),
                }}
              >
                {!ph.url && <span style={s.galleryEmoji}>{ph.emoji}</span>}
                {ph.caption && <span style={s.galleryLabel}>{ph.caption}</span>}
              </div>
            ))}
          </div>
        </Section>
      )}

      <div style={{ height: 60 }} />
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div style={s.section}>
      <div style={s.sectionLabel}>
        <span style={s.labelCode}>{label}</span>
        <div style={s.labelLine} />
      </div>
      <div style={s.card}>{children}</div>
    </div>
  )
}

function CardTitle({ children }) {
  return (
    <div style={s.cardTitle}>
      <span style={s.titleBar} />
      {children}
    </div>
  )
}

function CompatBar({ label, pct }) {
  return (
    <div style={s.compatRow}>
      <div style={s.compatLabel}>{label}</div>
      <div style={s.barBg}>
        <div style={{ ...s.barFill, width: `${pct}%` }} />
      </div>
      <div style={s.compatPct}>{pct}%</div>
    </div>
  )
}

const s = {
  root: {
    padding: '20px 24px',
    background: 'white',
  },
  section: {
    marginBottom: 6,
  },
  sectionLabel: {
    fontFamily: 'var(--mono)', fontSize: 9.5, color: '#b0a8cc',
    textTransform: 'uppercase', letterSpacing: '1px',
    marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8,
  },
  labelCode: { flexShrink: 0 },
  labelLine: { flex: 1, height: 1, background: 'linear-gradient(to right, #ede9fe, transparent)' },
  card: {
    background: 'white',
    border: '1px solid #ecffed',
    borderRadius: 16, padding: '17px 18px',
    marginBottom: 14,
    boxShadow: '0 1px 6px rgba(139,92,246,0.04)',
  },
  cardTitle: {
    fontSize: 10, fontWeight: 700, color: '#a89ec8',
    textTransform: 'uppercase', letterSpacing: '0.7px',
    fontFamily: 'var(--mono)', marginBottom: 12,
    display: 'flex', alignItems: 'center', gap: 7,
  },
  titleBar: {
    display: 'inline-block', width: 3, height: 11,
    borderRadius: 2, background: '#8b5cf6', flexShrink: 0,
  },
  bioText: { fontSize: 14, lineHeight: 1.85, color: '#2e1065', margin: 0 },
  ghRow: { display: 'flex', alignItems: 'center', gap: 7, marginTop: 12 },
  ghIcon: { fontSize: 14, color: '#8b5cf6' },
  ghLink: {
    fontFamily: 'var(--mono)', fontSize: 11,
    color: '#8b5cf6', textDecoration: 'none',
  },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 },
  infoItem: {
    background: '#faf8ff', border: '1px solid #f0ecff',
    borderRadius: 11, padding: '10px 12px',
  },
  infoKey: {
    fontFamily: 'var(--mono)', fontSize: 8.5, color: '#b0a8cc',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4,
  },
  infoVal: { fontSize: 12, fontWeight: 600, color: '#2e1065' },
  stackRow: { display: 'flex', flexWrap: 'wrap', gap: 7 },
  techBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontFamily: 'var(--mono)', fontSize: 11,
    padding: '5px 10px', borderRadius: 9,
    border: '1px solid #f0ecff', background: '#faf8ff', color: '#5b21b6',
  },
  techDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  compatWrap: { display: 'flex', flexDirection: 'column', gap: 13 },
  compatRow: { display: 'flex', alignItems: 'center', gap: 10 },
  compatLabel: { fontSize: 12, color: '#a89ec8', width: 96, flexShrink: 0 },
  barBg: { flex: 1, height: 5, background: '#ede8ff', borderRadius: 3, overflow: 'hidden' },
  barFill: {
    height: '100%', borderRadius: 3,
    background: 'linear-gradient(90deg,#c4b5fd,#8b5cf6)',
    transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)',
  },
  compatPct: {
    fontFamily: 'var(--mono)', fontSize: 11, color: '#8b5cf6',
    width: 32, textAlign: 'right', flexShrink: 0,
  },
  masonry: { columns: 3, gap: 7 },
  galleryItem: {
    breakInside: 'avoid', marginBottom: 7, borderRadius: 11,
    border: '1px solid rgba(255,255,255,0.6)',
    cursor: 'pointer', display: 'flex',
    flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 6, overflow: 'hidden',
  },
  galleryEmoji: { fontSize: 26 },
  galleryLabel: {
    fontSize: 9, color: 'rgba(255,255,255,0.8)',
    fontFamily: 'var(--mono)', paddingBottom: 7,
    textShadow: '0 1px 4px rgba(0,0,0,0.25)',
  },
}