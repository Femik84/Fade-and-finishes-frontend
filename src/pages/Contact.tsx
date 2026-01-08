import React, { useEffect, useRef, useState, useContext } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, MessageCircle } from 'lucide-react';
import Footer from '../components/Footer';
import { ThemeContext } from '../Context/ThemeContext';
import { locationEmbedUrl, heroImages } from '../Data/bookingData';

gsap.registerPlugin(ScrollTrigger);

const ContactPage: React.FC = () => {
  const { isDark } = useContext(ThemeContext);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const mapInView = useInView(mapRef, { once: true, margin: "-100px" });
  const detailsInView = useInView(detailsRef, { once: true, margin: "-100px" });
  const formInView = useInView(formRef, { once: true, margin: "-100px" });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    gsap.to(heroRef.current, {
      scrollTrigger: {
        trigger: heroRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      y: 150,
      opacity: 0.6,
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  // On submit: do not post anywhere. Clear inputs and show success message.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Clear the form fields
    setFormData({ name: '', phone: '', email: '', message: '' });
    // Show inline success message
    setSuccessMessage('Message sent successfully!');
    // Auto-hide after 4 seconds
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={`${isDark ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen transition-colors duration-500`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:wght@300;400;600;700&display=swap');`}</style>

      {/* Hero Section */}
      <div className="relative h-[70vh] overflow-hidden">
        <div ref={heroRef} className="absolute inset-0">
          <img
            src={isDark ? heroImages.dark : heroImages.light}
            alt="Contact hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/20 via-[#d4af37]/12 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/10 to-transparent opacity-60 mix-blend-screen pointer-events-none" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4"
        >
          <div className="w-20 h-1 bg-[#d4af37] mx-auto mb-6" />
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            <span>Get in Touch </span>
            <span className="text-[#D4AF37]">With Us</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl font-light text-white/90" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            We're here to help you look and feel your best.
          </p>
        </motion.div>
      </div>

      {/* Title Section */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="text-center mb-8">
          <h2
            className={`text-3xl md:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Contact Information
          </h2>
          <div className="w-24 h-1 bg-[#d4af37] mx-auto mt-4" />
        </div>
      </div>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <motion.div
            ref={detailsRef}
            initial={{ x: 100, opacity: 0 }}
            animate={detailsInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="order-first lg:order-last space-y-8"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-8 rounded-2xl border-2 backdrop-blur-xl ${isDark ? 'bg-black/40' : 'bg-white/30'} shadow-[0_0_40px_rgba(212,175,55,0.12)]`}
              style={{ borderColor: '#D4AF37' }}
            >
              <h2 className="text-3xl font-bold mb-8 text-[#D4AF37]" style={{ fontFamily: 'Playfair Display, serif' }}>
                Contact Details
              </h2>

              <div className="space-y-6">
                <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }}>
                  <MapPin className="w-6 h-6 mt-1 flex-shrink-0 text-[#D4AF37]" />
                  <div>
                    <h3 className="font-semibold mb-1">Address</h3>
                    <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      123 Premium Ave, Suite 100<br />
                      New York, NY 10036
                    </p>
                  </div>
                </motion.div>

                <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }}>
                  <Phone className="w-6 h-6 mt-1 flex-shrink-0 text-[#D4AF37]" />
                  <div>
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <a href="tel:+15551234567" className={`${isDark ? 'text-gray-300 hover:text-[#D4AF37]' : 'text-gray-700 hover:text-[#D4AF37]'} transition-colors`}>
                      (555) 123-4567
                    </a>
                  </div>
                </motion.div>

                <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }}>
                  <MessageCircle className="w-6 h-6 mt-1 flex-shrink-0 text-[#D4AF37]" />
                  <div>
                    <h3 className="font-semibold mb-1">WhatsApp</h3>
                    <a
                      href="https://wa.me/15551234567"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${isDark ? 'text-gray-300 hover:text-[#D4AF37]' : 'text-gray-700 hover:text-[#D4AF37]'} transition-colors`}
                    >
                      (555) 123-4567
                    </a>
                  </div>
                </motion.div>

                <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }}>
                  <Mail className="w-6 h-6 mt-1 flex-shrink-0 text-[#D4AF37]" />
                  <div>
                    <h3 className="font-semibold mb-1">Email</h3>
                    <a href="mailto:hello@fadeandfinishes.com" className={`${isDark ? 'text-gray-300 hover:text-[#D4AF37]' : 'text-gray-700 hover:text-[#D4AF37]'} transition-colors`}>
                      hello@fadeandfinishes.com
                    </a>
                  </div>
                </motion.div>

                <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }}>
                  <Clock className="w-6 h-6 mt-1 flex-shrink-0 text-[#D4AF37]" />
                  <div>
                    <h3 className="font-semibold mb-2">Opening Hours</h3>
                    <div className={`space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p>Mon–Fri: 9am–8pm</p>
                      <p>Sat: 10am–9pm</p>
                      <p>Sun: Closed</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="mt-8 pt-8 border-t border-[#D4AF37]">
                <h3 className="font-semibold mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  {[
                    { Icon: Instagram, link: '#' },
                    { Icon: Facebook, link: '#' },
                    { Icon: MessageCircle, link: '#' },
                  ].map(({ Icon, link }, i) => (
                    <motion.a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-12 h-12 rounded-full border-2 border-[#D4AF37] flex items-center justify-center hover:bg-[#D4AF37] hover:text-black transition-all"
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            ref={mapRef}
            initial={{ x: -100, opacity: 0 }}
            animate={mapInView ? { x: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="order-last lg:order-first"
          >
            <div className={`backdrop-blur-xl ${isDark ? 'bg-black/40' : 'bg-white/30'} border-2 border-[#D4AF37]/25 rounded-2xl p-4 shadow-[0_0_40px_rgba(212,175,55,0.12)]`}>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-xl font-bold text-[#D4AF37]">Our Location</h3>
              </div>

              <div className="w-full h-[530px] rounded-xl overflow-hidden shadow-inner">
                <iframe
                  src={locationEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block"
                  title="barbershop-location"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          ref={formRef}
          initial={{ y: 50, opacity: 0 }}
          animate={formInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-[#D4AF37]" style={{ fontFamily: 'Playfair Display, serif' }}>
            Send Us a Message
          </h2>
          <p className={`text-center mb-12 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Fill out the form below and we'll get back to you as soon as possible.
          </p>

          {/* Inline success message */}
          <div className="mb-6">
            {successMessage && (
              <div
                role="status"
                aria-live="polite"
                className="rounded-lg px-4 py-3 bg-green-100 text-green-800 border border-green-200"
              >
                {successMessage}
              </div>
            )}
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className={`p-8 md:p-12 rounded-2xl border-2 backdrop-blur-xl ${isDark ? 'bg-black/40' : 'bg-white/30'} shadow-[0_0_40px_rgba(212,175,55,0.12)]`}
            style={{ borderColor: '#D4AF37' }}
            whileHover={{ boxShadow: '0 0 30px rgba(212, 175, 55, 0.2)' }}
          >
            <div className="space-y-6">
              <motion.div
                className="relative"
                initial={{ x: -20, opacity: 0 }}
                animate={formInView ? { x: 0, opacity: 1 } : {}}
                transition={{ delay: 0.1 }}
              >
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full bg-transparent border-b-2 ${isDark ? 'border-gray-600' : 'border-gray-400'} py-3 px-2 focus:outline-none focus:border-[#D4AF37] transition-colors peer`}
                  placeholder=" "
                />
                <label className={`absolute left-2 -top-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#D4AF37]`}>
                  Your Name
                </label>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ x: -20, opacity: 0 }}
                animate={formInView ? { x: 0, opacity: 1 } : {}}
                transition={{ delay: 0.2 }}
              >
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className={`w-full bg-transparent border-b-2 ${isDark ? 'border-gray-600' : 'border-gray-400'} py-3 px-2 focus:outline-none focus:border-[#D4AF37] transition-colors peer`}
                  placeholder=" "
                />
                <label className={`absolute left-2 -top-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#D4AF37]`}>
                  Phone Number
                </label>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ x: -20, opacity: 0 }}
                animate={formInView ? { x: 0, opacity: 1 } : {}}
                transition={{ delay: 0.3 }}
              >
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full bg-transparent border-b-2 ${isDark ? 'border-gray-600' : 'border-gray-400'} py-3 px-2 focus:outline-none focus:border-[#D4AF37] transition-colors peer`}
                  placeholder=" "
                />
                <label className={`absolute left-2 -top-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#D4AF37]`}>
                  Email Address
                </label>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ x: -20, opacity: 0 }}
                animate={formInView ? { x: 0, opacity: 1 } : {}}
                transition={{ delay: 0.4 }}
              >
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className={`w-full bg-transparent border-b-2 ${isDark ? 'border-gray-600' : 'border-gray-400'} py-3 px-2 focus:outline-none focus:border-[#D4AF37] transition-colors peer resize-none`}
                  placeholder=" "
                ></textarea>
                <label className={`absolute left-2 -top-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#D4AF37]`}>
                  Your Message
                </label>
              </motion.div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.05, boxShadow: '0 0 25px rgba(212, 175, 55, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-4 rounded-xl font-semibold text-black bg-[#D4AF37] transition-all"
              >
                Send Message
              </motion.button>
            </div>
          </motion.form>
        </motion.div>
      </section>

      {/* Floating WhatsApp Button */}
      <motion.a
        href="https://wa.me/15551234567"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-7 right-8 w-14 h-14 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-2xl z-50"
        whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(212, 175, 55, 0.6)' }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: ['0 0 0 0 rgba(212, 175, 55, 0.4)', '0 0 0 20px rgba(212, 175, 55, 0)'],
        }}
        transition={{
          boxShadow: { duration: 1.5, repeat: Infinity }
        }}
      >
        <MessageCircle className="w-8 h-8 text-black" />
      </motion.a>

      <Footer />
    </div>
  );
};

export default ContactPage;