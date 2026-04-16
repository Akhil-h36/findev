// src/pages/OTPPage.jsx
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/layout/Background'
import Navbar from '../components/layout/Navbar'
import { verifyOTP, resendOTP } from '../api/auth'
// ↑ FIX: removed requestOTP import — SignupPage already sent the OTP before
//   navigating here, so we do NOT re-send on mount. That was causing a double-fire.

export default function OTPPage() {
  const navigate = useNavigate()

  const [digits, setDigits]           = useState(['', '', '', '', '', ''])
  const [status, setStatus]           = useState('idle')   // idle | loading | success | error
  const [resendState, setResendState] = useState('idle')   // idle | sent | cooldown
  const [cooldown, setCooldown]       = useState(0)
  const [errMsg, setErrMsg]           = useState('')
  const inputRefs = useRef([])

  // Read the data that SignupPage stored before navigating here
  const signupData = (() => {
    try { return JSON.parse(sessionStorage.getItem('signup_data') || '{}') } catch { return {} }
  })()

  // Redirect back to /signup if somehow we landed here without signup data
  useEffect(() => {
    if (!signupData.phone_number) {
      navigate('/signup')
    }
  }, [])

  // Masked phone display  e.g. +91 ****234
  const phoneDisplay = signupData.phone_number
    ? signupData.phone_number.replace(/(\+\d{2})(\d+)(\d{3})/, '$1 ****$3')
    : '+91 *** *** ****'

  // Cooldown countdown ticker
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // Auto-submit once all 6 digits are filled
  useEffect(() => {
    if (digits.every((d) => d !== '') && status === 'idle') {
      setTimeout(() => handleVerify(), 300)
    }
  }, [digits])

  // ── Input handlers ───────────────────────────────────────────────────────────

  const handleInput = (idx, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]; next[idx] = val; setDigits(next); setErrMsg('')
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) inputRefs.current[idx - 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = [...digits]; pasted.split('').forEach((ch, i) => { next[i] = ch }); setDigits(next)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  // ── Verify ───────────────────────────────────────────────────────────────────

  const handleVerify = async () => {
    const code = digits.join('')
    if (code.length < 6) { setErrMsg('Please enter all 6 digits.'); return }
    if (status === 'loading') return
    setStatus('loading'); setErrMsg('')

    try {
      const { data: res } = await verifyOTP({
        phone_number: signupData.phone_number,
        code,
        signup_data: signupData,   // backend creates the user here, after OTP confirmed
      })

      if (res.status === 'verified') {
        localStorage.setItem('access_token', res.access)
        localStorage.setItem('refresh_token', res.refresh)
        setStatus('success')
        setTimeout(() => navigate('/stack'), 900)
      } else {
        setStatus('error')
        setErrMsg(res.message || 'Invalid code.')
        // Reset digits so user can try again
        setDigits(['', '', '', '', '', ''])
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
      }
    } catch (err) {
      setStatus('error')
      setErrMsg(err.response?.data?.error || err.response?.data?.detail || 'Verification failed.')
      setDigits(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }

  // ── Resend ───────────────────────────────────────────────────────────────────

  const handleResend = async () => {
    if (cooldown > 0 || resendState === 'sent') return
    setResendState('sent'); setErrMsg('')
    try {
      await resendOTP({ phone_number: signupData.phone_number })
    } catch {
      // swallow — Twilio rate limit errors shown via cooldown UX
    }
    // Start 60s cooldown
    setTimeout(() => { setResendState('cooldown'); setCooldown(60) }, 400)
    setTimeout(() => setResendState('idle'), 60400)
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const btnLabel = {
    idle:    'Verify & Continue',
    loading: 'verifying...',
    success: '✓ verified!',
    error:   'Try Again',
  }[status]

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 relative animate-page-enter" style={{ background: '#ffffff' }}>
      <Background />
      <Navbar />

      <div className="w-full max-w-[400px] text-center relative z-10">

        {/* Icon */}
        <div className="w-16 h-16 rounded-[20px] flex items-center justify-center mx-auto mb-6" style={{ background: '#f0ecff' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.58a16 16 0 0 0 6 6l.95-.93a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
        </div>

        <p className="font-mono text-[10px] text-lavender-400 uppercase tracking-[2px] mb-2">verify your identity</p>
        <h2 className="font-serif font-light text-text-dark mb-3 tracking-[-0.8px] leading-[1.2]" style={{ fontSize: 36 }}>
          Check your<br /><em className="italic text-lavender-600">WhatsApp.</em>
        </h2>

        <p className="text-[14px] text-text-soft leading-relaxed mb-11">
          Findev sent a 6-digit code to{' '}
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[13px] font-medium" style={{ background: '#f0ecff', color: '#6d28d9' }}>
            📱 {phoneDisplay}
          </span>
          <br />
          <span className="text-[13px]">
            It expires in{' '}
            <span className="px-2 py-px rounded font-mono text-[12px]" style={{ background: '#f0ecff', color: '#7c3aed' }}>10 min</span>
          </span>
        </p>

        {/* OTP digit boxes */}
        <div className="flex gap-3 justify-center mb-9" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text" inputMode="numeric" maxLength={1}
              value={d}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="text-center font-mono text-[28px] font-normal outline-none transition-all"
              style={{
                width: 56, height: 68,
                background: d ? '#f5f3ff' : 'none',
                border: 'none',
                borderBottom: d
                  ? '2px solid #a78bfa'
                  : status === 'error'
                    ? '2px solid #fca5a5'
                    : '2px solid rgba(139,92,246,0.22)',
                borderRadius: d ? '8px 8px 0 0' : '0',
                color: '#1e1b4b', caretColor: '#8b5cf6',
              }}
              onFocus={(e) => { e.target.style.borderBottomColor = '#8b5cf6' }}
              onBlur={(e)  => { e.target.style.borderBottomColor = d ? '#a78bfa' : 'rgba(139,92,246,0.22)' }}
            />
          ))}
        </div>

        {errMsg && (
          <p className="text-xs font-mono text-red-500 mb-4 bg-red-50 px-4 py-2 rounded-xl border border-red-100">{errMsg}</p>
        )}

        <button
          onClick={handleVerify}
          disabled={status === 'loading' || status === 'success'}
          className="w-full py-4 rounded-2xl font-sans text-[15px] font-medium text-white border-0 cursor-pointer relative overflow-hidden transition-all"
          style={{
            background: status === 'success' ? '#16a34a' : status === 'loading' ? '#7c3aed' : '#1e1b4b',
            opacity: status === 'loading' ? 0.85 : 1,
          }}
          onMouseEnter={(e) => { if (status === 'idle' || status === 'error') { e.currentTarget.style.background = '#6d28d9'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(109,40,217,0.24)' } }}
          onMouseLeave={(e) => { if (status === 'idle' || status === 'error') { e.currentTarget.style.background = '#1e1b4b'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' } }}
        >
          <span className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.08),transparent)' }} />
          {btnLabel}
        </button>

        <p className="mt-5 text-[13px] text-text-soft">
          Didn't get it?{' '}
          {cooldown > 0 ? (
            <span className="font-mono text-text-ghost text-[12px]">resend in {cooldown}s</span>
          ) : (
            <span
              onClick={handleResend}
              className="text-lavender-600 cursor-pointer font-medium hover:text-lavender-700 transition-colors"
            >
              {resendState === 'sent' ? 'sent! ✓' : 'Resend code'}
            </span>
          )}
        </p>

        <p className="mt-8">
          <span onClick={() => navigate('/signup')} className="text-[12px] text-text-ghost cursor-pointer font-mono hover:text-text-soft transition-colors">
            ← back to signup
          </span>
        </p>
      </div>
    </div>
  )
}