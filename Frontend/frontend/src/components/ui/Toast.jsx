// src/components/ui/Toast.jsx
export default function Toast({ message }) {
  return (
    <div style={s.toast}>{message}</div>
  )
}
const s = {
  toast: {
    position:'fixed', bottom:28, left:'50%', transform:'translateX(-50%)',
    background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',
    color:'white',
    padding:'11px 22px', borderRadius:50,
    fontSize:14, fontWeight:600,
    zIndex:9999, pointerEvents:'none',
    fontFamily:'var(--sans)', whiteSpace:'nowrap',
    boxShadow:'0 8px 28px rgba(109,40,217,0.4)',
    animation:'fadeIn 0.3s cubic-bezier(0.16,1,0.3,1)',
    letterSpacing:'0.1px',
  },
}