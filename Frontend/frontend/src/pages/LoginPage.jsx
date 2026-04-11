// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/layout/Background'
import Navbar from '../components/layout/Navbar'
import FloatingInput from '../components/ui/FloatingInput'
import { login } from '../api/auth'
import { useAuth } from '../context/AuthContext'

function PanelBadge({ icon, iconBg, title, sub, animClass }) {
  return (
    <div
      className={`bg-white rounded-2xl px-5 py-[14px] flex items-center gap-3 w-full max-w-[280px] mb-4 ${animClass}`}
      style={{ border: '1px solid rgba(139,92,246,0.12)', boxShadow: '0 2px 24px rgba(124,58,237,0.07)' }}
    >
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 text-base" style={{ background: iconBg }}>
        {icon}
      </div>
      <div className="text-xs text-text-mid leading-snug">
        <strong className="block text-[13px] text-text-dark font-semibold mb-px">{title}</strong>
        {sub}
      </div>
    </div>
  )
}

export default function LoginPage() {
  const navigate     = useNavigate()
  const { saveAuth } = useAuth()

  const [form, setForm]     = useState({ username: '', password: '' })
  const [status, setStatus] = useState('idle')
  const [errMsg, setErrMsg] = useState('')

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }))

  const handleLogin = async () => {
    if (!form.username || !form.password) { setErrMsg('Please fill in all fields.'); return }
    setStatus('loading'); setErrMsg('')
    try {
      const { data } = await login({ username: form.username, password: form.password })
      if (data.status === 'success') {
        setStatus('success')
        saveAuth({ access: data.access, refresh: data.refresh })
        setTimeout(() => navigate('/discover'), 900)
      } else {
        setStatus('error'); setErrMsg(data.message || 'Login failed.')
      }
    } catch (err) {
      setStatus('error')
      setErrMsg(err.response?.data?.error || err.response?.data?.detail || 'Something went wrong.')
    }
  }

  const btnLabel = { idle: 'git commit --to-match', loading: 'authenticating...', success: '✓ welcome back', error: 'git commit --to-match' }[status]

  return (
    <div className="min-h-screen flex relative bg-white animate-page-enter">
      <Background />
      <Navbar />

      {/* LEFT PANEL */}
      <div className="flex-1 flex flex-col justify-center px-20 pt-[120px] pb-[80px] relative z-10">    
        <div className="max-w-[380px] w-full">

          <p className="font-mono text-[11px] text-lavender-500 uppercase tracking-[1.5px] mb-5 flex items-center gap-2 animate-fade-up">
            <span className="inline-block w-6 h-px bg-lavender-400" />
            where devs find their match
          </p>

          <h1
            className="font-serif font-light text-text-dark mb-4 leading-[1.12] tracking-[-1.5px] animate-fade-up-1"
            style={{ fontSize: 'clamp(38px, 5vw, 56px)' }}
          >
            Find your<br />
            <em className="italic text-lavender-600">perfect merge.</em>
          </h1>

          <p className="text-[15px] text-text-soft leading-relaxed max-w-[420px] mb-[52px] animate-fade-up-2">
            Connect with developers who speak your language — in code and in life.
          </p>

          <div className="animate-fade-up-3">
            <FloatingInput id="l-username" label="Username" type="text" value={form.username} onChange={set('username')} />
            <FloatingInput id="l-pass" label="Password" type="password" value={form.password} onChange={set('password')} />

            <div className="text-right -mt-3 mb-7">
              <span className="text-xs text-lavender-500 font-mono cursor-pointer hover:text-lavender-700 transition-colors">
                forgot_password()
              </span>
            </div>

            {errMsg && (
              <p className="text-xs font-mono text-red-500 mb-4 bg-red-50 px-4 py-2 rounded-xl border border-red-100">{errMsg}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={status === 'loading'}
              className="w-full py-4 mt-2 rounded-2xl font-sans text-[15px] font-medium text-white border-0 cursor-pointer relative overflow-hidden transition-all"
              style={{ background: status === 'success' ? '#16a34a' : status === 'loading' ? '#7c3aed' : '#1e1b4b' }}
              onMouseEnter={(e) => { if (status === 'idle' || status === 'error') { e.currentTarget.style.background = '#6d28d9'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(109,40,217,0.24)' } }}
              onMouseLeave={(e) => { if (status === 'idle' || status === 'error') { e.currentTarget.style.background = '#1e1b4b'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' } }}
            >
              <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.08),transparent)' }} />
              {btnLabel}
            </button>

            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(139,92,246,0.12)' }} />
              <span className="text-xs text-text-ghost font-mono">or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(139,92,246,0.12)' }} />
            </div>

            <button
              onClick={() => navigate('/signup')}
              className="w-full py-4 rounded-2xl font-sans text-[15px] font-medium border-0 cursor-pointer transition-all hover:-translate-y-px"
              style={{ background: '#f0ecff', color: 'rgb(124, 58, 237)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e9e4ff' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f0ecff' }}
            >
              Continue with GitHub <span className="font-mono opacity-60 text-xs ml-1">/ OAuth</span>
            </button>

            <p className="mt-6 text-[13px] text-text-soft text-center">
              New to Findev?{' '}
              <span onClick={() => navigate('/signup')} className="text-lavender-600 cursor-pointer font-medium hover:text-lavender-700 transition-colors">
                Create account ↗
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div
        className="w-[420px] flex-shrink-0 flex flex-col justify-center items-center px-12 py-20 relative z-10 overflow-hidden"
        style={{ background: '#faf9ff', borderLeft: '1px solid rgba(139,92,246,0.12)' }}
      >
        <div className="text-center mb-10">
          <div className="font-serif text-[52px] font-light text-lavender-700 leading-none mb-1">2.4k</div>
          <div className="font-mono text-xs text-text-soft uppercase tracking-[1px]">matches this week</div>
        </div>

        <PanelBadge icon="⚡" iconBg="#f0ecff" title="Stack Match 94%"    sub="React · TypeScript · Node"  animClass="animate-float-badge" />
        <PanelBadge icon="🌿" iconBg="#fef3c7" title="Priya matched you!" sub="She's into Rust + Go too"   animClass="animate-float-badge2" />
        <PanelBadge icon="✓"  iconBg="#dcfce7" title="First PR merged"    sub="3 collabs this month"       animClass="animate-float-badge3" />

        <p className="font-mono text-[11px] text-text-ghost text-center mt-7">
          findev.io // v1.0.0-stable
        </p>
      </div>
    </div>
  )
}