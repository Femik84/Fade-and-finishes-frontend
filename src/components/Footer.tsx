import React, { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { footerInfo } from '../Data/data';
import { ThemeContext } from '../Context/ThemeContext';

// Gold color palette - matching Home component
const goldColors = {
  primary: '#D4AF37',
  light: '#F4E4B8',
  dark: '#B8941F',
  hover: '#E5C158',
  shadow: 'rgba(212, 175, 55, 0.5)',
  shadowStrong: 'rgba(212, 175, 55, 0.6)',
};

const Footer: React.FC = () => {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleJoin = () => {
    if (email.trim()) {
      // Handle newsletter subscription here (no network call by default)
      console.log('Subscribed:', email);
      setEmail('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleJoin();
    }
  };

  // Navigate like Header: programmatic navigation + smooth scroll to top
  const handleNavClick = (path: string) => {
    // If already on the path, just smooth-scroll to top
    navigate(path);
    // small delay to let router update, then smooth scroll
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  return (
    <footer className="bg-black py-7 px-4 md:px-8" style={{ color: goldColors.primary }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3
              className="text-3xl font-bold mb-4"
              style={{ fontFamily: 'Playfair Display, serif', color: goldColors.primary }}
            >
              {footerInfo.name}
            </h3>
            <p
              className="text-gray-400 mb-4"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              {footerInfo.tagline}
            </p>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-4" style={{ color: goldColors.primary }}>
              Quick Links
            </h4>
            <ul className="space-y-2" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              <li>
                <motion.button
                  onClick={() => handleNavClick('/services')}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer transition-colors text-gray-400 hover:text-[#D4AF37] text-left"
                  type="button"
                  aria-label="Navigate to Services"
                >
                  Services
                </motion.button>
              </li>
              <li>
                <motion.button
                  onClick={() => handleNavClick('/booking')}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer transition-colors text-gray-400 hover:text-[#D4AF37] text-left"
                  type="button"
                  aria-label="Navigate to Booking"
                >
                  Booking
                </motion.button>
              </li>
              <li>
                <motion.button
                  onClick={() => handleNavClick('/gallery')}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer transition-colors text-gray-400 hover:text-[#D4AF37] text-left"
                  type="button"
                  aria-label="Navigate to Gallery"
                >
                  Gallery
                </motion.button>
              </li>
              <li>
                <motion.button
                  onClick={() => handleNavClick('/contact')}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer transition-colors text-gray-400 hover:text-[#D4AF37] text-left"
                  type="button"
                  aria-label="Navigate to Contact"
                >
                  Contact
                </motion.button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-4" style={{ color: goldColors.primary }}>
              Connect With Us
            </h4>
            <div className="flex gap-4 mb-6">
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5, boxShadow: `0 0 20px ${goldColors.shadow}` }}
                className="w-10 h-10 text-black rounded-full flex items-center justify-center text-xl cursor-pointer"
                style={{ backgroundColor: goldColors.primary }}
                href="#"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, rotate: -5, boxShadow: `0 0 20px ${goldColors.shadow}` }}
                className="w-10 h-10 text-black rounded-full flex items-center justify-center text-xl cursor-pointer"
                style={{ backgroundColor: goldColors.primary }}
                href="#"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5, boxShadow: `0 0 20px ${goldColors.shadow}` }}
                className="w-10 h-10 text-black rounded-full flex items-center justify-center text-xl cursor-pointer"
                style={{ backgroundColor: goldColors.primary }}
                href="#"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
            </div>

            <div>
              <h5 className="text-lg mb-3" style={{ color: goldColors.primary }}>
                Newsletter
              </h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-2 bg-zinc-900 text-white rounded-l-sm focus:outline-none focus:ring-2"
                  style={{
                    fontFamily: 'Cormorant Garamond, serif',
                  }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 2px ${goldColors.primary}`)}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
                  aria-label="Newsletter email"
                />
                <motion.button
                  onClick={handleJoin}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: goldColors.hover,
                    boxShadow: `0 0 20px ${goldColors.shadow}`,
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 text-black font-bold rounded-r-sm transition-all"
                  style={{ backgroundColor: goldColors.primary }}
                  aria-label="Join newsletter"
                >
                  Join
                </motion.button>
              </div>

              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mt-3 text-sm"
                    style={{
                      color: goldColors.primary,
                      fontFamily: 'Cormorant Garamond, serif',
                    }}
                    role="status"
                    aria-live="polite"
                  >
                    Successfully subscribed to our newsletter!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="border-t pt-8 text-center text-gray-400" style={{ borderColor: `${goldColors.primary}33` }}>
          <p style={{ fontFamily: 'Cormorant Garamond, serif' }}>{footerInfo.copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;