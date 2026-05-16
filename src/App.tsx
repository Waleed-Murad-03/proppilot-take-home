import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import InboxPage from './pages/InboxPage';
// import { useEffect } from 'react';
// import { supabase } from './lib/supabaseClient';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // JUST FOR TESING PURPOSES
  // useEffect(() => {
  //   console.log('Supabase connected:', supabase);
  //   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  // }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <InboxPage />
            </ProtectedRoute>
          }
        />
        <Route path="/c/:agencySlug" element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
