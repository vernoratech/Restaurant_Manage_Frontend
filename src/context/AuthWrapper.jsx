// src/context/AuthWrapper.jsx
import { useNavigate } from 'react-router-dom'
import { AuthProvider } from './AuthContext.jsx'

export const AuthWrapper = ({ children }) => {
  const navigate = useNavigate()
  
  return (
    <AuthProvider navigate={navigate}>
      {children}
    </AuthProvider>
  )
}
