import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import { LogOut, Package, MapPin, LayoutDashboard, User, Menu, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isAdmin, isDriver } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Package, show: true },
    { name: 'Book Courier', path: '/book', icon: MapPin, show: !!user },
    { name: 'Track', path: '/track', icon: MapPin, show: true },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, show: !!user },
    { name: 'Admin', path: '/admin', icon: ShieldCheck, show: isAdmin },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-primary text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <Package className="text-primary w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">PRESTIGE <span className="text-accent">COURIERS</span></span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.filter(item => item.show).map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 hover:text-accent transition-colors ${location.pathname === item.path ? 'text-accent' : ''}`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 border-l border-white/20 pl-4">
                    <User className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">{profile?.displayName}</span>
                  </div>
                  <button onClick={handleLogout} className="text-white/70 hover:text-white">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-accent py-2 px-4 text-sm">Login</Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-primary/95 border-t border-white/10"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                {navItems.filter(item => item.show).map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-3 px-4 rounded-lg hover:bg-white/10 flex items-center space-x-3"
                  >
                    <item.icon className="w-5 h-5 text-accent" />
                    <span>{item.name}</span>
                  </Link>
                ))}
                {user ? (
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="w-full text-left py-3 px-4 rounded-lg hover:bg-white/10 flex items-center space-x-3 text-red-400"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                ) : (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block btn-accent text-center">Login</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-primary text-white py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="text-accent w-6 h-6" />
                <span className="text-xl font-bold">PRESTIGE COURIERS</span>
              </div>
              <p className="text-white/60 max-w-md">
                Premium logistics solutions for legal documents and commodity transportation. 
                Trust, Security, and Speed in every delivery.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-accent">Services</h4>
              <ul className="space-y-2 text-white/60">
                <li>Legal Document Courier</li>
                <li>Commodity Transport</li>
                <li>Express Delivery</li>
                <li>Secure Storage</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-accent">Contact</h4>
              <ul className="space-y-2 text-white/60">
                <li>support@prestigecouriers.com</li>
                <li>1-800-PRESTIGE</li>
                <li>Global HQ, New York</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-white/40 text-sm">
            © 2026 Prestige Couriers. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
