import { AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Home from './pages/Home';
import Search from './pages/Search';
import Explore from './pages/Explore';
import Category from './pages/Category';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import AdminLogin from './pages/AdminLogin';
import PageLayout from './components/PageLayout';
import ProductDetail from './pages/ProductDetail';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageLayout><Home /></PageLayout>} />
        <Route path="/category" element={<PageLayout><Explore /></PageLayout>} />
        <Route path="/search" element={<PageLayout><Search /></PageLayout>} />
        <Route path="/admin/login" element={<PageLayout><AdminLogin /></PageLayout>} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <PageLayout><AdminDashboard /></PageLayout>
          </ProtectedRoute>
        } />
        <Route path="/:categoryPath" element={<PageLayout><Category /></PageLayout>} />
        <Route path="/product/:productId" element={<PageLayout><ProductDetail /></PageLayout>} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <AnimatedRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
