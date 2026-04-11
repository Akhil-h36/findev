// src/components/Layout/Background.jsx
export default function Background() {
  return (
    <>
      <div className="noise-overlay" />
      <div className="bg-dots" />
      {/* Blob 1 — top-right */}
      <div
        className="fixed rounded-full pointer-events-none z-0"
        style={{
          width: 520, height: 520,
          background: 'rgba(196,181,253,0.22)',
          filter: 'blur(80px)',
          top: -160, right: -120,
        }}
      />
      {/* Blob 2 — bottom-left */}
      <div
        className="fixed rounded-full pointer-events-none z-0"
        style={{
          width: 380, height: 380,
          background: 'rgba(221,214,254,0.18)',
          filter: 'blur(80px)',
          bottom: -100, left: -80,
        }}
      />
    </>
  )
}