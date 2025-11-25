import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Header } from "./components/header/header"
import { Suspense, lazy } from "react"
import { LoadingPage } from "./components/loadingPage/loadingPage"
import { AuthGuard, NoAuthGuard } from './guards/auth'

const AuthForm = lazy(() => import('./pages/auth-form/authForm'))
const Home = lazy(() => import('./pages/home/home'))

export const AppLayout = () => {
    return (
        <BrowserRouter>
            <Header />

            <Suspense fallback={<LoadingPage />}>
                <Routes>
                    <Route
                        path="/login"
                        element={
                            <NoAuthGuard>
                                <AuthForm isLoginMode={true} />
                            </NoAuthGuard>
                        }
                    />
                    <Route
                        path="/signin"
                        element={
                            <NoAuthGuard>
                                <AuthForm isLoginMode={false} />
                            </NoAuthGuard>
                        }
                    />
                    <Route
                        path="/" 
                        element={
                            <AuthGuard>
                                <Home />
                            </AuthGuard>
                        } 
                    />
                    <Route 
                        path="*" 
                        element={<Navigate to="/" replace />} 
                    />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}