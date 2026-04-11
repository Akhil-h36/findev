// src/components/layout/Navbar.jsx
import { useNavigate } from 'react-router-dom'

/* ── Findev logo — keyboard icon + wordmark matching the brand logo ── */
function FindevLogo() {
  return (
    <div
      className="flex items-center gap-2 cursor-pointer select-none"
      onClick={() => window.location.href = '/landing'}
    >
      {/* Mini keyboard SVG echoing the logo mark */}
      <svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Top row keys */}
        <rect x="1"  y="1"  width="3.2" height="3" rx="0.7" stroke="#a78bfa" strokeWidth="1.2" fill="none"/>
        <rect x="5.2" y="1" width="3.2" height="3" rx="0.7" stroke="#a78bfa" strokeWidth="1.2" fill="none"/>
        <rect x="9.4" y="1" width="3.2" height="3" rx="0.7" stroke="#a78bfa" strokeWidth="1.2" fill="none"/>
        {/* Heart key (center top) */}
        <rect x="13.6" y="1" width="3.2" height="3" rx="0.7" stroke="#c4b5fd" strokeWidth="1.2" fill="none"/>
        <path d="M14.8 2.1 C14.8 1.75 15.1 1.5 15.2 1.75 C15.3 1.5 15.6 1.75 15.6 2.1 C15.6 2.4 15.2 2.75 15.2 2.75 C15.2 2.75 14.8 2.4 14.8 2.1Z" fill="#c4b5fd"/>
        <rect x="17.8" y="1" width="3.2" height="3" rx="0.7" stroke="#a78bfa" strokeWidth="1.2" fill="none"/>
        <rect x="22"  y="1" width="4.8" height="3" rx="0.7" stroke="#a78bfa" strokeWidth="1.2" fill="none"/>
        {/* Bottom row — spacebar */}
        <rect x="1"  y="5.5" width="3.2" height="3" rx="0.7" stroke="#c4b5fd" strokeWidth="1.2" fill="none"/>
        <rect x="5.2" y="5.5" width="3.2" height="3" rx="0.7" stroke="#c4b5fd" strokeWidth="1.2" fill="none"/>
        <rect x="9.4" y="5.5" width="13.4" height="3" rx="0.7" stroke="#c4b5fd" strokeWidth="1.2" fill="none"/>
        <rect x="23.8" y="5.5" width="3" height="3" rx="0.7" stroke="#c4b5fd" strokeWidth="1.2" fill="none"/>
      </svg>

      {/* Wordmark */}
      <span
        className="font-serif font-light tracking-[-0.5px] leading-none"
        style={{ fontSize: 20, color: '#6d28d9' }}
      >
        fin<span style={{ color: '#1e1b4b', fontStyle: 'italic' }}>dev</span>
      </span>
      <sup className="font-mono text-[9px] text-lavender-400 -mt-2">β</sup>
    </div>
  )
}

export default function Navbar() {
  const navigate = useNavigate()

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-12 py-5"
      style={{
        background:   'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(139,92,246,0.12)',
      }}
    >
      <FindevLogo />

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/login')}
          className="text-[13px] font-medium text-text-mid bg-none border-none cursor-pointer px-4 py-2 rounded-[20px] transition-all hover:bg-[#f0ecff] hover:text-lavender-700"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          Sign in
        </button>
        <button
          onClick={() => navigate('/signup')}
          className="text-[13px] font-medium text-white border-none cursor-pointer px-[22px] py-[9px] rounded-[20px] transition-all"
          style={{ background: '#7c3aed', fontFamily: 'DM Sans, sans-serif' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#6d28d9'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.28)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          Get started
        </button>
      </div>
    </nav>
  )
}