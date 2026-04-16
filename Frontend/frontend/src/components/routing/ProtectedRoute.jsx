// src/components/routing/ProtectedRoute.jsx
// Wraps any route that requires the user to be logged in.
// If not logged in → redirect to /login.

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * <ProtectedRoute />
 * Usage in your router:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/discover" element={<Discover />} />
 *   </Route>
 */
export function ProtectedRoute() {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />
}

/**
 * <GuestRoute />
 * Wraps auth pages (login, signup, otp, stack, photos).
 * If the user IS already logged in → redirect to /discover.
 *
 * Usage:
 *   <Route element={<GuestRoute />}>
 *     <Route path="/login"   element={<LoginPage />} />
 *     <Route path="/signup"  element={<SignupPage />} />
 *     <Route path="/otp"     element={<OTPPage />} />
 *     <Route path="/stack"   element={<TechStackPage />} />
 *     <Route path="/photos"  element={<PhotoSelectionPage />} />
 *   </Route>
 */
export function GuestRoute() {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? <Navigate to="/discover" replace /> : <Outlet />
}