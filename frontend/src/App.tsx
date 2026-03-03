import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useAuth } from './hooks/useAuth'
import { LoginPage } from './pages/Login'
import { SignupPage } from './pages/Signup'
import { DashboardPage } from './pages/Dashboard'
import { RepoDetailsPage } from './pages/RepoDetails'
import { ReportPage } from './pages/Report'
import { GitHubCallbackPage } from './pages/GitHubCallback'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--color-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="gradient-text" style={{ fontSize: 28, fontWeight: 800, marginBottom: 16 }}>RevFlo</div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%', background: '#6366f1',
                animation: `fadeIn 0.6s ${i * 0.2}s infinite alternate`,
              }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/github/callback" element={<GitHubCallbackPage />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/repo/:id" element={<ProtectedRoute><RepoDetailsPage /></ProtectedRoute>} />
          <Route path="/report/:id" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />

          {/* Default */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
