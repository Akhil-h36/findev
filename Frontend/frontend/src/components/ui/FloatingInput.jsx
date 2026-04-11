// src/components/ui/FloatingInput.jsx
import { useState } from 'react'

export default function FloatingInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  className = '',
  ...rest
}) {
  const [focused, setFocused] = useState(false)
  const lifted = focused || value?.length > 0

  return (
    <div className={`field-group relative mb-7 ${className}`}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-transparent border-0 outline-none font-sans text-base text-text-dark pt-[14px] pb-[10px]"
        style={{ borderBottom: `1.5px solid ${focused ? '#8b5cf6' : 'rgba(139,92,246,0.22)'}`, transition: 'border-color 0.2s' }}
        {...rest}
      />
      <label
        htmlFor={id}
        className="absolute pointer-events-none transition-all font-sans"
        style={{
          top:        lifted ? '0'   : '50%',
          transform:  lifted ? 'none' : 'translateY(-50%)',
          fontSize:   lifted ? '11px' : '15px',
          color:      lifted ? '#8b5cf6' : '#b8b2d8',
          letterSpacing: lifted ? '0.8px' : 'normal',
          fontFamily: lifted ? '"DM Mono", monospace' : '"DM Sans", sans-serif',
          textTransform: lifted ? 'uppercase' : 'none',
          transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {label}
      </label>
      <div className="field-line" />
    </div>
  )
}