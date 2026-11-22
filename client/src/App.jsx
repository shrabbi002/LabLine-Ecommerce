import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import Items from './pages/Items';
import ItemDetail from './pages/ItemDetail';
import About from './pages/About';
import Contact from './pages/Contact';

// Admin Components & Layout
import Login from './admin/Login';
import AdminLayout from './admin/AdminLayout';
import AdminIndex from './admin/AdminIndex';
import Dashboard from './admin/Dashboard';
import ItemManager from './admin/ItemManager';
import ItemForm from './admin/ItemForm';
import ContentManager from './admin/ContentManager';
import Messages from './admin/Messages';
import SettingsPage from './admin/Settings';

// Public Website Layout Wrapper (contains public Navbar and Footer)
const PublicLayout = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main key={pathname} className="flex-grow page-enter">
        {children}
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SiteProvider>
        <Router>
          <Routes>
            {/* ─── Public Pages (Public Navbar + Footer) ─── */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/items" element={<PublicLayout><Items /></PublicLayout>} />
            <Route path="/items/:id" element={<PublicLayout><ItemDetail /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

            {/* ─── Admin Entry Points ─── */}
            {/* Direct http://localhost:5173/admin access */}
            <Route path="/admin" element={<AdminIndex />} />
            <Route path="/admin/login" element={<Login />} />

            {/* ─── Dedicated Admin Panel (Protected + Independent AdminLayout) ─── */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/items"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ItemManager />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/items/new"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ItemForm />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/items/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ItemForm />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/content"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ContentManager />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Messages />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <SettingsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback route - Redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SiteProvider>
    </AuthProvider>
  );
}

export default App;
