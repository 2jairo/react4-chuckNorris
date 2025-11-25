import { AuthProvider } from './providers/auth/authProvider'
import { AppLayout } from './layout'
import { JwtProvider } from './providers/jwt/jwtProvider'

function App() {
  return (
    <JwtProvider>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </JwtProvider>
  )
}

export default App
