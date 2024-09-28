/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClerkProvider } from '@clerk/clerk-react';
import { Route, Routes, useNavigate } from 'react-router-dom'
import SignInPage from './pages/SignIn';
import SignUpPage from './pages/SignUp';
import RootLayout from './pages/Index';
import NewPost from './pages/NewPost';
import UserInfoForm from './pages/UserInfoForm';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

export default function App() {
  const navigate = useNavigate()

  return (
    <ClerkProvider
      routerPush={(to:any) => navigate(to)}
      routerReplace={(to:any) => navigate(to, { replace: true })}
      publishableKey={PUBLISHABLE_KEY}
    >
      <Routes>
        <Route path='/new-post' element={<NewPost />} />
        <Route path='/sign-in/*' element={<SignInPage />} />
        <Route path='/sign-up/*' element={<SignUpPage />} />
        <Route path='/user-info' element={<UserInfoForm />} />
        <Route path='/' element={<RootLayout />} />
      </Routes>
    </ClerkProvider>
  )
}