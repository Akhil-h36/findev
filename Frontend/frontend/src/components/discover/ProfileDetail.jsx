// src/components/discover/ProfileDetail.jsx
import { useEffect, useRef } from 'react'

const GALLERY_BG = [
  'linear-gradient(135deg,#ede8ff,#c4b5fd)',
  'linear-gradient(135deg,#dbeafe,#93c5fd)',
  'linear-gradient(135deg,#d1fae5,#6ee7b7)',
  'linear-gradient(135deg,#fce7f3,#f9a8d4)',
  'linear-gradient(135deg,#fef3c7,#fde68a)',
  'linear-gradient(135deg,#ffe4e6,#fda4af)',
]
const GALLERY_H = [130, 168, 146, 178, 136, 158]

export default function ProfileDetail({ profile }) {
  const ref = useRef()
  useEffect(() => { if (ref.current) ref.current.scrollTop = 0 }, [profile.id])

  const stack       = profile.stack      || []
  const stackColors = profile.stackColors || stack.map(() => '#8b5cf6')
  const photos      = profile.photos     || []
  const compat      = profile.compat     || { stack: 0, vibe: 0, collab: 0 }

  const infoItems = [
    { k: 'Experience', v: profile.experience, icon: '⚡' },
    { k: 'Location',   v: profile.location,   icon: '◈' },
    { k: 'Philosophy', v: profile.philosophy,  icon: '✦' },
    { k: 'Open Source',v: profile.openSource,  icon: '⬡' },
  ].filter(item => item.v)

  return (
    <div ref={ref} style={s.root}>

      {/* Decorative top accent */}
      <div style={s.topAccent}>
        <div style={s.accentLine} />
        <span style={s.accentLabel}>profile details</span>
        <div style={s.accentLine} />
      </div>

      {/* Bio */}
      <Section label="bio" icon="✦">
        <div style={s.bioCard}>
          <div style={s.bioQuoteMark}>"</div>
          <p style={s.bioText}>{profile.bio || 'No bio yet — still writing their origin story.'}</p>
          {profile.github && (
            <a href={profile.github} target="_blank" rel="noreferrer" style={s.ghLink}>
              <span style={s.ghIcon}>⬡</span>
              <span>{profile.github.replace('https://github.com/', '@')}</span>
            </a>
          )}
        </div>
      </Section>

      {infoItems.length > 0 && (
        <Section label="quick info" icon="◈">
          <div style={s.infoGrid}>
            {infoItems.map(({ k, v, icon }) => (
              <div key={k} style={s.infoItem}>
                <div style={s.infoIconWrap}>
                  <span style={s.infoIcon}>{icon}</span>
                </div>
                <div style={s.infoKey}>{k}</div>
                <div style={s.infoVal}>{v}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {stack.length > 0 && (
        <Section label="tech stack" icon="⬡">
          <div style={s.stackWrap}>
            {stack.map((t, i) => (
              <span key={t} style={{
                ...s.techBadge,
                '--dot-color': stackColors[i] || '#8b5cf6',
              }}>
                <span style={{ ...s.techDot, background: stackColors[i] || '#8b5cf6' }} />
                {t}
              </span>
            ))}
          </div>
        </Section>
      )}

      {(compat.stack > 0 || compat.vibe > 0 || compat.collab > 0) && (
        <Section label="compatibility" icon="♥">
          <div style={s.compatCard}>
            <div style={s.compatSummary}>
              <div style={s.compatScore}>{Math.round((compat.stack + compat.vibe + compat.collab) / 3)}%</div>
              <div style={s.compatLabel}>overall match</div>
            </div>
            <div style={s.compatBars}>
              <CompatBar label="Tech Stack"   pct={compat.stack}  color="#8b5cf6" />
              <CompatBar label="Work Vibe"    pct={compat.vibe}   color="#a78bfa" />
              <CompatBar label="Collab Style" pct={compat.collab} color="#c4b5fd" />
            </div>
          </div>
        </Section>
      )}

      {photos.length > 0 && (
        <Section label="gallery" icon="◉">
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
                <div style={s.galleryShimmer} />
              </div>
            ))}
          </div>
        </Section>
      )}

      <div style={{ height: 60 }} />
    </div>
  )
}

function Section({ label, icon, children }) {
  return (
    <div style={s.section}>
      <div style={s.sectionHeader}>
        <span style={s.sectionIcon}>{icon}</span>
        <span style={s.sectionLabel}>{label}</span>
        <div style={s.sectionLine} />
      </div>
      {children}
    </div>
  )
}

function CompatBar({ label, pct, color }) {
  return (
    <div style={s.compatRow}>
      <div style={s.compatRowLabel}>{label}</div>
      <div style={s.barBg}>
        <div style={{
          ...s.barFill,
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}55, ${color})`,
        }} />
      </div>
      <div style={{ ...s.compatPct, color }}>{pct}%</div>
    </div>
  )
}

const s = {
  root: {
    padding: '0 0 16px',
    background: 'white',
    minHeight: 0,
  },

  topAccent: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '20px 24px 14px',
  },
  accentLine: {
    flex: 1,
    height: 1,
    background: 'linear-gradient(to right, transparent, #e9e3ff)',
  },
  accentLabel: {
    fontFamily: 'var(--mono)',
    fontSize: 9,
    color: '#c4b5fd',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    whiteSpace: 'nowrap',
  },

  section: {
    padding: '0 20px 4px',
    marginBottom: 4,
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },
  sectionIcon: {
    fontSize: 11,
    color: '#8b5cf6',
    lineHeight: 1,
  },
  sectionLabel: {
    fontFamily: 'var(--mono)',
    fontSize: 9.5,
    color: '#a78bfa',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  sectionLine: {
    flex: 1,
    height: 1,
    background: 'linear-gradient(to right, #ede9fe, transparent)',
  },

  /* Bio */
  bioCard: {
    background: 'linear-gradient(145deg, #faf8ff 0%, #f5f0ff 100%)',
    border: '1px solid #ede8ff',
    borderRadius: 20,
    padding: '20px 22px 18px',
    marginBottom: 14,
    position: 'relative',
    overflow: 'hidden',
  },
  bioQuoteMark: {
    position: 'absolute',
    top: -8,
    left: 16,
    fontSize: 72,
    color: '#ede8ff',
    fontFamily: 'Georgia, serif',
    lineHeight: 1,
    userSelect: 'none',
    pointerEvents: 'none',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 1.9,
    color: '#3b1a7a',
    margin: 0,
    position: 'relative',
    zIndex: 1,
    fontStyle: 'italic',
    letterSpacing: '0.1px',
  },
  ghLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    marginTop: 14,
    fontFamily: 'var(--mono)',
    fontSize: 11,
    color: '#7c3aed',
    textDecoration: 'none',
    background: 'rgba(139,92,246,0.08)',
    border: '1px solid rgba(139,92,246,0.2)',
    borderRadius: 20,
    padding: '4px 12px 4px 10px',
    transition: 'all 0.2s',
  },
  ghIcon: { fontSize: 13, color: '#8b5cf6' },

  /* Info grid */
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    marginBottom: 14,
  },
  infoItem: {
    background: 'linear-gradient(145deg, #faf8ff, #f5f0ff)',
    border: '1px solid #ede8ff',
    borderRadius: 16,
    padding: '14px 14px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
    transition: 'all 0.2s',
  },
  infoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 10,
    background: 'linear-gradient(135deg, #ede8ff, #ddd6fe)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  infoIcon: { fontSize: 13, color: '#7c3aed' },
  infoKey: {
    fontFamily: 'var(--mono)',
    fontSize: 8.5,
    color: '#b0a8cc',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  infoVal: {
    fontSize: 12.5,
    fontWeight: 600,
    color: '#2e1065',
    lineHeight: 1.3,
  },

  /* Stack */
  stackWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 14,
  },
  techBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'var(--mono)',
    fontSize: 11.5,
    padding: '6px 12px',
    borderRadius: 12,
    border: '1px solid #ede8ff',
    background: 'linear-gradient(135deg, #faf8ff, #f0ecff)',
    color: '#5b21b6',
    fontWeight: 500,
    letterSpacing: '0.2px',
    transition: 'all 0.2s',
  },
  techDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    flexShrink: 0,
  },

  /* Compatibility */
  compatCard: {
    background: 'linear-gradient(145deg, #faf8ff, #f5f0ff)',
    border: '1px solid #ede8ff',
    borderRadius: 20,
    padding: '18px 20px',
    marginBottom: 14,
    display: 'flex',
    gap: 20,
    alignItems: 'center',
  },
  compatSummary: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
    width: 64,
    padding: '10px 0',
    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    borderRadius: 16,
    boxShadow: '0 4px 20px rgba(139,92,246,0.35)',
  },
  compatScore: {
    fontSize: 22,
    fontWeight: 700,
    color: 'white',
    letterSpacing: '-1px',
    lineHeight: 1,
  },
  compatLabel: {
    fontFamily: 'var(--mono)',
    fontSize: 8,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    textAlign: 'center',
    lineHeight: 1.3,
  },
  compatBars: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  compatRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  compatRowLabel: {
    fontSize: 11,
    color: '#9d8ec0',
    width: 78,
    flexShrink: 0,
    fontFamily: 'var(--mono)',
  },
  barBg: {
    flex: 1,
    height: 6,
    background: '#ede8ff',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
    transition: 'width 1.4s cubic-bezier(0.16,1,0.3,1)',
  },
  compatPct: {
    fontFamily: 'var(--mono)',
    fontSize: 11,
    width: 32,
    textAlign: 'right',
    flexShrink: 0,
    fontWeight: 600,
  },

  /* Gallery */
  masonry: {
    columns: 3,
    gap: 8,
    marginBottom: 14,
  },
  galleryItem: {
    breakInside: 'avoid',
    marginBottom: 8,
    borderRadius: 14,
    border: '1.5px solid rgba(255,255,255,0.7)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 2px 12px rgba(139,92,246,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  galleryShimmer: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
    pointerEvents: 'none',
  },
  galleryEmoji: {
    fontSize: 28,
    filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))',
  },
  galleryLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'var(--mono)',
    padding: '3px 10px',
    background: 'rgba(0,0,0,0.25)',
    backdropFilter: 'blur(6px)',
    borderRadius: 20,
    position: 'absolute',
    bottom: 8,
    textShadow: '0 1px 4px rgba(0,0,0,0.3)',
    letterSpacing: '0.3px',
  },
}