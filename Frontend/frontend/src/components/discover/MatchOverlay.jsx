// src/components/discover/MatchOverlay.jsx
export default function MatchOverlay({ other, onChat, onSkip }) {
  return (
    <div style={s.overlay}>
      <div style={s.card}>
        <div style={s.ring1} /><div style={s.ring2} />

        <div style={s.sparkle}>✨</div>
        <div style={s.title}>It's a Match!</div>
        <div style={s.sub}>// mutual_like.confirmed()</div>

        <div style={s.avRow}>
          <Av letter="Y" color="#ddd6fe" />
          <div style={s.heart}>💜</div>
          <Av letter={other.initials?.[0] || '?'} color={other.color || '#c4b5fd'} />
        </div>

        <div style={s.names}>
          <Chip>You</Chip>
          <span style={s.amp}>&amp;</span>
          <Chip>{other.name}</Chip>
        </div>

        <p style={s.tagline}>
          You both liked each other! Start talking about{' '}
          <span style={s.hint}>{other.stack?.[0] || 'code'}</span>
        </p>

        <div style={s.btns}>
          <button style={{ ...s.btn, ...s.btnChat }} onClick={onChat}>
            💬 Start Chat
          </button>
          <button style={{ ...s.btn, ...s.btnSkip }} onClick={onSkip}>
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  )
}

function Av({ letter, color }) {
  return <div style={{ ...s.av, background: color }}>{letter}</div>
}
function Chip({ children }) {
  return <span style={s.chip}>{children}</span>
}

const s = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(20,5,55,0.82)',
    backdropFilter: 'blur(14px)',
    zIndex: 999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'matchIn 0.35s ease',
  },
  card: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    gap: 13, maxWidth: 330, padding: '38px 28px 30px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 28, textAlign: 'center',
    position: 'relative', overflow: 'hidden',
  },
  ring1: {
    position: 'absolute', width: 320, height: 320, borderRadius: '50%',
    border: '1px solid rgba(167,139,250,0.12)',
    top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
    pointerEvents: 'none',
  },
  ring2: {
    position: 'absolute', width: 200, height: 200, borderRadius: '50%',
    border: '1px solid rgba(167,139,250,0.08)',
    top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
    pointerEvents: 'none',
  },
  sparkle: { fontSize: 28, lineHeight: 1 },
  title: {
    fontSize: 38, fontWeight: 700,
    background: 'linear-gradient(135deg,#e9d5ff,white,#c4b5fd)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    letterSpacing: '-1px', lineHeight: 1.1,
  },
  sub: { fontFamily: 'var(--mono)', fontSize: 10, color: 'rgba(255,255,255,0.35)' },
  avRow: { display: 'flex', alignItems: 'center', gap: 14, margin: '4px 0' },
  av: {
    width: 68, height: 68, borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 24, fontWeight: 700, color: '#4c1d95',
    boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
  },
  heart: { fontSize: 24, animation: 'heartBeat 0.85s ease infinite' },
  names: { display: 'flex', alignItems: 'center', gap: 9, marginTop: -2 },
  chip: {
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 20, padding: '4px 14px',
    fontSize: 12, fontWeight: 600, color: 'white',
  },
  amp: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
  tagline: { color: 'rgba(255,255,255,0.6)', fontSize: 13, lineHeight: 1.7, margin: 0 },
  hint: { fontFamily: 'var(--mono)', color: '#a78bfa', fontWeight: 600 },
  btns: { display: 'flex', gap: 9, marginTop: 3 },
  btn: {
    padding: '10px 20px', borderRadius: 12,
    fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.18s', border: 'none',
  },
  btnChat: {
    background: 'white', color: '#6d28d9',
    boxShadow: '0 4px 18px rgba(255,255,255,0.12)',
  },
  btnSkip: {
    background: 'rgba(255,255,255,0.07)',
    color: 'rgba(255,255,255,0.72)',
    border: '1px solid rgba(255,255,255,0.12)',
  },
}