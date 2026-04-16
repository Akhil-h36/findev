// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LoginPage   from './pages/LoginPage'
import SignupPage  from './pages/SignupPage'
import LandingPage from './pages/LandingPage'
import OTPPage from './pages/OTPPage'
import TechStackPage from './pages/TechStackPage'
import Discover from './pages/Discover'
import PhotoSelectionPage from './pages/PhotoSelectionPage'


import { AuthProvider }    from './context/AuthContext'

// Placeholder stubs — build these next
import { ProtectedRoute,GuestRoute } from './components/routing/ProtectedRoute'


export default function App() {
  return (
     <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login"   element={<LoginPage />} />
            <Route path="/signup"  element={<SignupPage />} />
            <Route path="/otp"     element={<OTPPage />} />
            <Route path="/stack"   element={<TechStackPage />} />
            <Route path="/photos"  element={<PhotoSelectionPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/discover" element={<Discover />} />
            {/* add more protected pages here */}
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />



        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}