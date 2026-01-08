import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Facebook, Instagram, Twitter } from 'lucide-react';
import { ThemeContext } from '../Context/ThemeContext';
import logo from '../assets/F&F.png';

const Header: React.FC = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Gold color definitions
  const goldColors = {
    primary: '#D4AF37', // Classic gold
    light: '#F4E4B8', // Light gold
    dark: '#B8941F', // Dark gold
    hover: '#E5C158', // Hover gold
  };

  // Page checks
  const isServiceDetailsPage =
    location.pathname === '/service' ||
    location.pathname === '/service-details' ||
    location.pathname.startsWith('/services/');

  const isGalleryPage =
    location.pathname === '/gallery' || location.pathname.startsWith('/gallery/');

  const isBookingPage =
    location.pathname === '/booking' || location.pathname.startsWith('/booking/');

  const isContactPage =
    location.pathname === '/contact' || location.pathname.startsWith('/contact/');

  // === IMPORTANT CHANGE ===
  // Include '/about' in the "light header" pages so About page shows light header text
  // in light mode until the user scrolls (then it switches to dark text).
  const isLightHeaderPage =
    location.pathname === '/' ||
    location.pathname === '/services' ||
    location.pathname === '/about' || // <-- About page included here
    isServiceDetailsPage ||
    isGalleryPage ||
    isBookingPage ||
    isContactPage;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    window.scrollTo(0, 0); // Scroll to top on route change
  }, [location.pathname]);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Booking', path: '/booking' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Text color for logo/title depending on theme, page and scroll state.
  // In light mode and on pages listed in isLightHeaderPage (now includes /about),
  // show light (white) text while not scrolled, then switch to dark on scroll.
  const getTextColor = () => {
    if (isDark) return 'text-white';
    if (isLightHeaderPage) {
      return scrolled ? 'text-black' : 'text-white';
    }
    return 'text-black';
  };

  // Navigation item text color (desktop)
  const getNavTextColor = (path: string) => {
    const active = isActive(path);

    if (isDark) {
      return active ? 'text-gray-300 hover:opacity-90' : 'text-gray-300 hover:opacity-75';
    }

    if (isLightHeaderPage) {
      if (active) return ''; // active item will be colored via inline style (gold)
      return scrolled ? 'text-gray-700 hover:opacity-75' : 'text-gray-100 hover:opacity-75';
    }

    return active ? '' : 'text-gray-700 hover:opacity-75';
  };

  // Hamburger lines color for mobile button
  const getHamburgerColor = () => {
    if (isDark) return 'bg-white';
    if (isLightHeaderPage) {
      return scrolled ? 'bg-black' : 'bg-white';
    }
    return 'bg-black';
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? isDark
              ? 'bg-black/95 backdrop-blur-md shadow-2xl'
              : 'bg-white/95 backdrop-blur-md shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 cursor-pointer relative right-5"
              >
                <div className="w-14 h-14">
                  <img src={logo} alt="Fade & Finishes Logo" className="w-full h-full object-contain" />
                </div>
                <div className="relative right-4">
                  <h1
                    className={`text-2xl font-bold transition-colors duration-300 ${getTextColor()}`}
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    <span className="hidden lg:inline">Fade & Finishes</span>
                    <span className="lg:hidden">FADES</span>
                  </h1>
                  <p className="text-xs tracking-widest" style={{ color: goldColors.primary }}>
                    BARBER & BEAUTY
                  </p>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavClick(item.path)}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  className={`text-base font-medium transition-all duration-300 relative group ${getNavTextColor(item.path)}`}
                  style={isActive(item.path) ? { color: goldColors.primary } : undefined}
                >
                  {item.name}
                  {/* Animated underline */}
                  <motion.span
                    className="absolute -bottom-1 left-0 h-0.5"
                    style={{ backgroundColor: goldColors.primary }}
                    initial={{ width: 0 }}
                    animate={{ width: isActive(item.path) ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                  {/* Hover underline for non-active items */}
                  {!isActive(item.path) && (
                    <span
                      className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                      style={{ backgroundColor: goldColors.primary }}
                    />
                  )}
                  {/* Active dot indicator */}
                  {isActive(item.path) && (
                    <motion.span
                      layoutId="activeIndicator"
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: goldColors.primary }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Theme Toggle & Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2.5 rounded-full transition-all duration-300 shadow-lg ${
                  isDark
                    ? 'bg-zinc-800 hover:bg-zinc-700'
                    : scrolled
                    ? 'bg-gray-100 hover:bg-gray-200'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
                style={{ color: goldColors.primary }}
                type="button"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileTap={{ scale: 0.9 }}
                className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 transition-colors duration-300"
                type="button"
                aria-label="Toggle menu"
              >
                <motion.span
                  animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                  className={`w-6 h-0.5 transition-all duration-300 ${getHamburgerColor()}`}
                />
                <motion.span
                  animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                  className={`w-6 h-0.5 transition-all duration-300 ${getHamburgerColor()}`}
                />
                <motion.span
                  animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                  className={`w-6 h-0.5 transition-all duration-300 ${getHamburgerColor()}`}
                />
              </motion.button>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 right-0 bottom-0 w-80 z-50 lg:hidden ${isDark ? 'bg-zinc-900' : 'bg-white'} shadow-2xl`}
            >
              <div className="flex flex-col h-full p-8">
                {/* Close Button */}
                <motion.button
                  onClick={() => setIsOpen(false)}
                  whileTap={{ scale: 0.9 }}
                  className="self-end w-10 h-10 flex items-center justify-center rounded-full text-black"
                  style={{ backgroundColor: goldColors.primary }}
                  type="button"
                >
                  ✕
                </motion.button>

                {/* Mobile Nav Items */}
                <div className="flex flex-col gap-6 mt-8">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.name}
                      onClick={() => handleNavClick(item.path)}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`text-2xl font-bold transition-all duration-300 relative pl-6 text-left ${
                        !isActive(item.path) && (isDark ? 'text-white hover:opacity-75' : 'text-black hover:opacity-75')
                      }`}
                      style={
                        isActive(item.path)
                          ? {
                              color: goldColors.primary,
                              fontFamily: 'Playfair Display, serif',
                            }
                          : { fontFamily: 'Playfair Display, serif' }
                      }
                      type="button"
                    >
                      {/* Active indicator bar for mobile */}
                      {isActive(item.path) && (
                        <motion.span
                          layoutId="mobileActiveIndicator"
                          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 rounded-r-full"
                          style={{ backgroundColor: goldColors.primary }}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      )}
                      {item.name}
                    </motion.button>
                  ))}
                </div>

                {/* Social Links */}
                <div className="mt-auto pt-8 border-t" style={{ borderColor: `${goldColors.primary}33` }}>
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Follow Us</p>
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: goldColors.primary }}
                      type="button"
                    >
                      <Facebook className="w-5 h-5 text-black" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: goldColors.primary }}
                      type="button"
                    >
                      <Instagram className="w-5 h-5 text-black" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: goldColors.primary }}
                      type="button"
                    >
                      <Twitter className="w-5 h-5 text-black" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;