import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

// Admin Pages
import Login from './admin/Login';
import Dashboard from './admin/Dashboard';
import ItemManager from './admin/ItemManager';
import ItemForm from './admin/ItemForm';
import ContentManager from './admin/ContentManager';
import Messages from './admin/Messages';
import SettingsPage from './admin/Settings';

// Layout Wrapper
const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      <main className="flex-grow">
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
          {/* Public Views */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/items" element={<Layout><Items /></Layout>} />
          <Route path="/items/:id" element={<Layout><ItemDetail /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />

          {/* Admin Login */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Administrative Dashboard Views */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/items"
            element={
              <ProtectedRoute>
                <Layout>
                  <ItemManager />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/items/new"
            element={
              <ProtectedRoute>
                <Layout>
                  <ItemForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/items/:id/edit"
            element={
              <ProtectedRoute>
                <Layout>
                  <ItemForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/content"
            element={
              <ProtectedRoute>
                <Layout>
                  <ContentManager />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <ProtectedRoute>
                <Layout>
                  <Messages />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback route - Redirect to Home */}
          <Route path="*" element={<Layout><Home /></Layout>} />
        </Routes>
      </Router>
      </SiteProvider>
    </AuthProvider>
  );
}

export default App;
