// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LoginPage   from './pages/LoginPage'
import SignupPage  from './pages/SignupPage'
import LandingPage from './pages/LandingPage'
import OTPPage from './pages/OTPPage'
import TechStackPage from './pages/TechStackPage'
import Discover from './pages/Discover'
import PhotoSelectionPage from './pages/PhotoSelectionPage'

// Placeholder stubs — build these next



export default function App() {
  return (
     <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"         element={<Navigate to="/landing" replace />} />
          <Route path="/landing"  element={<LandingPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/signup"   element={<SignupPage />} />
          <Route path="/otp"      element={<OTPPage />} />
          <Route path="/stack"    element={<TechStackPage />} />
          <Route path='/discover' element={<Discover/>}/>
          <Route path="/photos" element={<PhotoSelectionPage />} />
         
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}