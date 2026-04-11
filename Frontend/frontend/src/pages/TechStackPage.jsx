// src/pages/TechStackPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Background from '../components/layout/Background'
import Navbar from '../components/layout/Navbar'
import { updateTechStack } from '../api/auth'

function Tag({ label, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-[6px] px-[18px] py-[9px] rounded-full text-[13px] font-medium cursor-pointer transition-all select-none"
      style={{
        border:     selected ? '1.5px solid #7c3aed' : '1.5px solid rgba(139,92,246,0.22)',
        background: selected ? '#7c3aed' : '#ffffff',
        color:      selected ? '#ffffff' : '#4c4470',
        transform:  selected ? 'scale(1.03)' : 'scale(1)',
      }}
    >
      <span className="w-[6px] h-[6px] rounded-full flex-shrink-0 transition-colors" style={{ background: selected ? 'rgba(255,255,255,0.5)' : '#c4b5fd' }} />
      {label}
    </div>
  )
}

function PhilPill({ label, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className="px-4 py-[9px] rounded-full text-[13px] font-medium cursor-pointer transition-all select-none"
      style={{
        border:     selected ? '1.5px solid #7c3aed' : '1.5px solid rgba(139,92,246,0.22)',
        background: selected ? '#f0ecff' : 'transparent',
        color:      selected ? '#6d28d9' : '#8b84b8',
      }}
    >
      {label}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-[10px] mb-4">
      <p className="font-mono text-[10px] text-text-soft uppercase tracking-[2px] whitespace-nowrap">{children}</p>
      <div className="flex-1 h-px" style={{ background: 'rgba(139,92,246,0.12)' }} />
    </div>
  )
}

const LANGUAGES  = ['TypeScript', 'Python', 'Rust', 'Go', 'Java', 'C++', 'Kotlin', 'Swift', 'Ruby', 'PHP']
const FRAMEWORKS = ['React', 'Next.js', 'Vue', 'Svelte', 'Node.js', 'FastAPI', 'Django', 'Spring', 'Laravel', 'GraphQL']
const INFRA      = ['AWS', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Postgres', 'Redis', 'MongoDB']
const PHILOSOPHY = ['Ship fast, fix later', 'Test-driven everything', 'OSS contributor', 'Clean code zealot', 'Always in dark mode', 'Tabs over spaces', 'Spaces over tabs', 'Side project collector']

export default function TechStackPage() {
  const navigate = useNavigate()

  const [selected, setSelected] = useState({ languages: new Set(), frameworks: new Set(), infra: new Set(), philosophy: new Set() })
  const [status, setStatus]     = useState('idle')
  const [errMsg, setErrMsg]     = useState('')

  const toggle = (category, item) =>
    setSelected((prev) => {
      const next = new Set(prev[category])
      next.has(item) ? next.delete(item) : next.add(item)
      return { ...prev, [category]: next }
    })

  const totalSelected = selected.languages.size + selected.frameworks.size + selected.infra.size

  const handleFinish = async () => {
    if (totalSelected === 0) { setErrMsg('Pick at least one technology to continue.'); return }
    setStatus('loading'); setErrMsg('')
    try {
      const tech_stack = {
        languages:  [...selected.languages],
        frameworks: [...selected.frameworks],
        infra:      [...selected.infra],
        philosophy: [...selected.philosophy],
      }
      await updateTechStack({ tech_stack })
      sessionStorage.removeItem('signup_data')
      setStatus('success')
      setTimeout(() => navigate('/discover'), 900)
    } catch (err) {
      setStatus('error')
      setErrMsg(err.response?.data?.error || err.response?.data?.detail || 'Something went wrong.')
    }
  }

  const btnLabel = {
    idle:    totalSelected > 0 ? `Find my matches (${totalSelected} selected) →` : 'Find my matches →',
    loading: 'saving your stack...',
    success: "✓ let's go!",
    error:   totalSelected > 0 ? `Find my matches (${totalSelected} selected) →` : 'Find my matches →',
  }[status]

  return (
    <div className="min-h-screen flex flex-col items-center px-6 pt-24 pb-20 relative animate-page-enter" style={{ background: '#ffffff', overflowY: 'auto' }}>
      <Background />
      <Navbar />

      <div className="w-full max-w-[600px] relative z-10">

        {/* Intro */}
        <div className="mb-12">
          <p className="font-mono text-[10px] text-lavender-400 uppercase tracking-[2px] mb-2">final step — your technical dna</p>
          <h2 className="font-serif font-light text-text-dark mb-3 tracking-[-0.8px] leading-[1.2]" style={{ fontSize: 38 }}>
            What's your<br /><em className="italic text-lavender-600">stack?</em>
          </h2>
          <p className="text-[14px] text-text-soft leading-relaxed max-w-[480px]">
            This is how Findev finds your people. Pick everything you love, tolerate, or are still learning.
          </p>
        </div>

        <div className="mb-10">
          <SectionTitle>languages</SectionTitle>
          <div className="flex flex-wrap gap-[10px]">
            {LANGUAGES.map((l) => <Tag key={l} label={l} selected={selected.languages.has(l)} onClick={() => toggle('languages', l)} />)}
          </div>
        </div>

        <div className="mb-10">
          <SectionTitle>frameworks &amp; libs</SectionTitle>
          <div className="flex flex-wrap gap-[10px]">
            {FRAMEWORKS.map((f) => <Tag key={f} label={f} selected={selected.frameworks.has(f)} onClick={() => toggle('frameworks', f)} />)}
          </div>
        </div>

        <div className="mb-10">
          <SectionTitle>infrastructure</SectionTitle>
          <div className="flex flex-wrap gap-[10px]">
            {INFRA.map((t) => <Tag key={t} label={t} selected={selected.infra.has(t)} onClick={() => toggle('infra', t)} />)}
          </div>
        </div>

        <div className="mb-10">
          <SectionTitle>coding philosophy</SectionTitle>
          <div className="flex flex-wrap gap-[10px]">
            {PHILOSOPHY.map((p) => <PhilPill key={p} label={p} selected={selected.philosophy.has(p)} onClick={() => toggle('philosophy', p)} />)}
          </div>
        </div>

        {errMsg && (
          <p className="text-xs font-mono text-red-500 mb-4 bg-red-50 px-4 py-2 rounded-xl border border-red-100">{errMsg}</p>
        )}

        <button
          onClick={handleFinish}
          disabled={status === 'loading'}
          className="w-full py-[17px] rounded-2xl font-sans text-[16px] font-medium text-white border-0 cursor-pointer transition-all"
          style={{ background: status === 'success' ? '#16a34a' : 'linear-gradient(135deg, #7c3aed, #6d28d9)', marginTop: 12 }}
          onMouseEnter={(e) => { if (status === 'idle' || status === 'error') { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(109,40,217,0.28)' } }}
          onMouseLeave={(e) => { if (status === 'idle' || status === 'error') { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' } }}
        >
          {btnLabel}
        </button>

        <p className="text-center mt-4 text-[12px] text-text-ghost font-mono">you can update this anytime in settings</p>
      </div>
    </div>
  )
}