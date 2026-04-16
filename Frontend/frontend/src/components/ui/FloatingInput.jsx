// src/components/ui/FloatingInput.jsx

// import { useState } from 'react'

// export default function FloatingInput({
//   id,
//   label,
//   type = 'text',
//   value,
//   onChange,
//   className = '',
//   ...rest
// }) {
//   const [focused, setFocused] = useState(false)
//   const lifted = focused || value?.length > 0

//   return (
//     <div className={`field-group relative mb-7 ${className}`}>
//       <input
//         id={id}
//         type={type}
//         value={value}
//         onChange={onChange}
//         placeholder=" "
//         onFocus={() => setFocused(true)}
//         onBlur={() => setFocused(false)}
//         className="w-full bg-transparent border-0 outline-none font-sans text-base text-text-dark pt-[14px] pb-[10px]"
//         style={{ borderBottom: `1.5px solid ${focused ? '#8b5cf6' : 'rgba(139,92,246,0.22)'}`, transition: 'border-color 0.2s' }}
//         {...rest}
//       />
//       <label
//         htmlFor={id}
//         className="absolute pointer-events-none transition-all font-sans"
//         style={{
//           top:        lifted ? '0'   : '50%',
//           transform:  lifted ? 'none' : 'translateY(-50%)',
//           fontSize:   lifted ? '11px' : '15px',
//           color:      lifted ? '#8b5cf6' : '#b8b2d8',
//           letterSpacing: lifted ? '0.8px' : 'normal',
//           fontFamily: lifted ? '"DM Mono", monospace' : '"DM Sans", sans-serif',
//           textTransform: lifted ? 'uppercase' : 'none',
//           transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
//         }}
//       >
//         {label}
//       </label>
//       <div className="field-line" />
//     </div>
//   )
// }


import { useId } from 'react'
 
export default function FloatingInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  min,
  autoComplete,
  inputRef,         // optional forwarded ref (used by OTPPage auto-focus, etc.)
  ...rest
}) {
  const uid = useId()
  const inputId = id || uid
 
  return (
    <div className="relative mb-6">
      <input
        ref={inputRef}
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}          // caller passes a STABLE handler, not set(key) inline
        placeholder=" "              // single space — keeps :placeholder-shown trick working
        autoComplete={autoComplete}
        min={min}
        className="peer w-full px-4 pt-6 pb-2 rounded-xl text-[15px] text-text-dark outline-none transition-all bg-transparent"
        style={{
          border: '1.5px solid rgba(139,92,246,0.22)',
          fontFamily: 'inherit',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#8b5cf6'
          e.target.style.boxShadow   = '0 0 0 3px rgba(139,92,246,0.08)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(139,92,246,0.22)'
          e.target.style.boxShadow   = 'none'
        }}
        {...rest}
      />
      <label
        htmlFor={inputId}
        className="
          absolute left-4 top-[50%] -translate-y-1/2
          text-[15px] text-text-ghost pointer-events-none
          transition-all duration-150 origin-left
          peer-focus:top-[14px] peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:text-lavender-500 peer-focus:font-mono peer-focus:tracking-[0.5px]
          peer-[&:not(:placeholder-shown)]:top-[14px] peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:text-lavender-400 peer-[&:not(:placeholder-shown)]:font-mono peer-[&:not(:placeholder-shown)]:tracking-[0.5px]
        "
      >
        {label}
      </label>
    </div>
  )
}