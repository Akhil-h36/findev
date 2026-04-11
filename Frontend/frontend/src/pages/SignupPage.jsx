// src/pages/SignupPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/layout/Background'
import Navbar from '../components/layout/Navbar'
import FloatingInput from '../components/ui/FloatingInput'

function RolePill({ label, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className="px-4 py-[10px] rounded-full text-[13px] font-medium cursor-pointer transition-all select-none"
      style={{
        border:     selected ? '1.5px solid #7c3aed' : '1.5px solid rgba(139,92,246,0.22)',
        background: selected ? '#7c3aed' : 'white',
        color:      selected ? 'white'   : '#4c4470',
        transform:  selected ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      {label}
    </div>
  )
}

const ROLES    = ['Frontend Dev', 'Backend Dev', 'Full-Stack Dev', 'DevOps / SRE', 'ML / AI Engineer', 'Mobile Dev']
const PROGRESS = { 1: '25%', 2: '55%' }

export default function SignupPage() {
  const navigate = useNavigate()

  const [step, setStep]     = useState(1)
  const [role, setRole]     = useState('')
  const [form, setForm]     = useState({ firstName: '', lastName: '', username: '', githubHandle: '', phoneNumber: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }))

  const validateStep1 = () => {
    const errs = {}
    if (!form.firstName.trim())   errs.firstName   = 'Required'
    if (!form.lastName.trim())    errs.lastName    = 'Required'
    if (!form.username.trim())    errs.username    = 'Required'
    if (!form.phoneNumber.trim()) errs.phoneNumber = 'Required'
    return errs
  }

  const validateStep2 = () => {
    const errs = {}
    if (!form.password)                         errs.password        = 'Required'
    if (form.password.length < 8)               errs.password        = 'Min 8 characters'
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    return errs
  }

  const nextStep = () => {
    const errs = validateStep1()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({}); setStep(2)
  }

  const sendOTP = () => {
    const errs = validateStep2()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    sessionStorage.setItem('signup_data', JSON.stringify({
      username:     form.username,
      password:     form.password,
      phone_number: form.phoneNumber,
      github_url:   form.githubHandle ? `https://github.com/${form.githubHandle}` : '',
      first_name:   form.firstName,
      last_name:    form.lastName,
      role,
    }))
    navigate('/otp')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 relative animate-page-enter" style={{ background: '#faf9ff' }}>
      <Background />
      <Navbar />

      <div className="w-full max-w-[480px] relative z-10">

        {/* Progress bar */}
        <div className="w-full h-[3px] rounded-sm overflow-hidden mb-9" style={{ background: '#ede9fe' }}>
          <div className="h-full rounded-sm" style={{ width: PROGRESS[step], background: '#8b5cf6', transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }} />
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div key="step-1" className="animate-step-in">
            <p className="font-mono text-[10px] text-lavender-400 uppercase tracking-[2px] mb-2">step 01 / 02 — identity</p>
            <h2 className="font-serif font-light text-text-dark mb-2 tracking-[-0.8px] leading-[1.2]" style={{ fontSize: 34 }}>
              Hey there,<br /><em className="italic text-lavender-600">who are you?</em>
            </h2>
            <p className="text-[14px] text-text-soft mb-10 leading-relaxed">
              Let's get the basics down. Your stack comes next.
            </p>

            <div className="flex gap-8">
              <div className="flex-1">
                <FloatingInput id="s-first" label="First name" value={form.firstName} onChange={set('firstName')} />
                {errors.firstName && <p className="text-[11px] text-red-400 font-mono -mt-4 mb-4">{errors.firstName}</p>}
              </div>
              <div className="flex-1">
                <FloatingInput id="s-last" label="Last name" value={form.lastName} onChange={set('lastName')} />
                {errors.lastName && <p className="text-[11px] text-red-400 font-mono -mt-4 mb-4">{errors.lastName}</p>}
              </div>
            </div>

            <FloatingInput id="s-username" label="Username" value={form.username} onChange={set('username')} />
            {errors.username && <p className="text-[11px] text-red-400 font-mono -mt-4 mb-4">{errors.username}</p>}

            <FloatingInput id="s-github" label="GitHub / GitLab handle" value={form.githubHandle} onChange={set('githubHandle')} />

            <FloatingInput id="s-phone" label="Phone number (+91…)" type="tel" value={form.phoneNumber} onChange={set('phoneNumber')} />
            {errors.phoneNumber && <p className="text-[11px] text-red-400 font-mono -mt-4 mb-4">{errors.phoneNumber}</p>}

            <div className="flex mt-4">
              <button
                onClick={nextStep}
                className="flex-1 py-[15px] rounded-2xl font-sans text-[15px] font-medium text-white border-0 cursor-pointer transition-all hover:-translate-y-px"
                style={{ background: '#7c3aed' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#6d28d9'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.25)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.boxShadow = 'none' }}
              >
                Continue →
              </button>
            </div>

            <p className="mt-6 text-[13px] text-text-soft text-center">
              Already on Findev?{' '}
              <span onClick={() => navigate('/login')} className="text-lavender-600 cursor-pointer font-medium hover:text-lavender-700 transition-colors">
                Sign in ↗
              </span>
            </p>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div key="step-2" className="animate-step-in">
            <p className="font-mono text-[10px] text-lavender-400 uppercase tracking-[2px] mb-2">step 02 / 02 — account</p>
            <h2 className="font-serif font-light text-text-dark mb-2 tracking-[-0.8px] leading-[1.2]" style={{ fontSize: 34 }}>
              Set your<br /><em className="italic text-lavender-600">credentials.</em>
            </h2>
            <p className="text-[14px] text-text-soft mb-10 leading-relaxed">
              Lock it in. One more step and you're in the network.
            </p>

            <FloatingInput id="s-pass" label="Password" type="password" value={form.password} onChange={set('password')} />
            {errors.password && <p className="text-[11px] text-red-400 font-mono -mt-4 mb-4">{errors.password}</p>}

            <FloatingInput id="s-pass2" label="Confirm password" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} />
            {errors.confirmPassword && <p className="text-[11px] text-red-400 font-mono -mt-4 mb-4">{errors.confirmPassword}</p>}

            <div className="mb-7">
              <p className="font-mono text-[10px] text-text-soft uppercase tracking-[1.5px] mb-[14px]">I build as a</p>
              <div className="flex flex-wrap gap-[10px]">
                {ROLES.map((r) => (
                  <RolePill key={r} label={r} selected={role === r} onClick={() => setRole(r)} />
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setStep(1); setErrors({}) }}
                className="px-[18px] py-[14px] rounded-2xl font-sans text-[15px] bg-transparent text-text-soft cursor-pointer transition-all"
                style={{ border: '1px solid rgba(139,92,246,0.22)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#a78bfa'; e.currentTarget.style.color = '#7c3aed' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.22)'; e.currentTarget.style.color = '#8b84b8' }}
              >←</button>
              <button
                onClick={sendOTP}
                className="flex-1 py-[15px] rounded-2xl font-sans text-[15px] font-medium text-white border-0 cursor-pointer transition-all hover:-translate-y-px"
                style={{ background: '#7c3aed' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#6d28d9'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.25)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#7c3aed'; e.currentTarget.style.boxShadow = 'none' }}
              >
                Send OTP →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}