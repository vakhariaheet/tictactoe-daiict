/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClerkProvider } from '@clerk/clerk-react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import SignInPage from './pages/SignIn';
import SignUpPage from './pages/SignUp';
import Home from './pages/home';
import NewPost from './pages/NewPost';
import UserInfoForm from './pages/UserInfoForm';
import SavedPost from './components/SavedPost';
import { CommentsSection } from './pages/CommentView';
import { Toaster } from './components/ui/toaster';
import Demo from './components/Demo';
import FeedPost from './components/FeedPost'; // Import the FeedPost component
import AiCourse from './pages/Aicourse';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

export default function App() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      routerPush={(to: any) => navigate(to)}
      routerReplace={(to: any) => navigate(to, { replace: true })}
      publishableKey={PUBLISHABLE_KEY}
    >
      <Routes>
        <Route path="/pdf-check" element={<Demo />} />
        <Route path='/new-post' element={<NewPost />} />
        <Route path='/save-post' element={<SavedPost />} />
        <Route path='/sign-in/*' element={<SignInPage />} />
        <Route path='/sign-up/*' element={<SignUpPage />} />
        <Route path='/user-info' element={<UserInfoForm />} />
        <Route path='/:postId/comments' element={<CommentsSection />} />
        <Route path='/feed-post' element={<FeedPost />} />
        <Route path='/aicourse' element={<AiCourse />} />
        <Route path='/' element={<Home />} />
      </Routes>
      <Toaster />
    </ClerkProvider>
  );
}
