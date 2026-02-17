// Hook para manejar autenticación con Firebase
import { useState, useEffect, createContext, useContext } from 'react'

const AuthContext = createContext()

// Autenticación local temporal para desarrollo
const DEV_USERS = [
  {
    email: 'admin@miradorvolcanes.com',
    password: 'admin123',
    uid: 'admin-dev-uid'
  }
]

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('auth_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      setError('')
      setLoading(true)
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Buscar usuario en la lista de desarrollo
      const foundUser = DEV_USERS.find(u => u.email === email && u.password === password)
      
      if (foundUser) {
        const userSession = {
          uid: foundUser.uid,
          email: foundUser.email
        }
        
        setUser(userSession)
        localStorage.setItem('auth_user', JSON.stringify(userSession))
        return true
      } else {
        setError('Credenciales inválidas')
        return false
      }
    } catch (error) {
      console.error('Error en login:', error)
      setError('Error de conexión')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setUser(null)
      localStorage.removeItem('auth_user')
    } catch (error) {
      console.error('Error en logout:', error)
    }
  }

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}