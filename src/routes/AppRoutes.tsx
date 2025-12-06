import { lazy } from "react"
import { Route, Routes } from "react-router-dom"

const LoginPage = lazy(() => import('@Auth/pages/LoginPage'))
const RegistrationPage = lazy(() => import('@Auth/pages/RegistrationPage'))
export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<h1>Home</h1>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registration" element={<RegistrationPage />} />
    </Routes>
  )
}