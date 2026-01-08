import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Scissors,
  ChevronDown,
  Mail,
  CheckCircle,
  Check
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import Footer from '../components/Footer';
import { ThemeContext } from '../Context/ThemeContext';
import { getServices, getBarbers} from '../Data/bookingApi';
import type { Service, Barber } from '../Data/bookingApi';
import { locationEmbedUrl, heroImages } from '../Data/bookingData';

gsap.registerPlugin(ScrollTrigger);

type FormState = {
  name: string;
  email: string;
  phone: string;
  service: number | '';
  barber: number | null;
  date: string;
  time: string;
};

const defaultTimeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM",
  "5:00 PM", "6:00 PM", "7:00 PM"
];

const BookingPage: React.FC = () => {
  const { isDark } = useContext(ThemeContext);
  const [formData, setFormData] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    service: '',
    barber: null,
    date: '',
    time: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  // Custom dropdown states
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [barberDropdownOpen, setBarberDropdownOpen] = useState(false);
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const barberDropdownRef = useRef<HTMLDivElement>(null);
  const timeDropdownRef = useRef<HTMLDivElement>(null);

  // data from backend
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [timeSlots] = useState<string[]>(defaultTimeSlots);

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init('wbg8YAOUJPKk7kFqQ');
  }, []);

  // Hero parallax
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setServiceDropdownOpen(false);
      }
      if (barberDropdownRef.current && !barberDropdownRef.current.contains(event.target as Node)) {
        setBarberDropdownOpen(false);
      }
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target as Node)) {
        setTimeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch services & barbers on mount
  useEffect(() => {
    let mounted = true;
    setDataError(null);
    setDataLoading(true);

    Promise.all([getServices(), getBarbers()])
      .then(([svc, brb]) => {
        if (!mounted) return;
        setServices(svc);
        setBarbers(brb);
      })
      .catch((err) => {
        console.error('Failed to load booking data', err);
        setDataError('Failed to load services or barbers. Please try again later.');
      })
      .finally(() => {
        if (mounted) setDataLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.service ||
      !formData.barber ||
      !formData.date ||
      !formData.time
    ) {
      setError('Please fill in all fields.');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError('Please enter a valid phone number.');
      return;
    }

    setLoading(true);

    try {
      // Get service and barber names for the email using fetched data
      const service = services.find(s => s.id === formData.service);
      const barber = barbers.find(b => b.id === formData.barber);

      if (!service || !barber) {
        throw new Error('Invalid service or barber selection');
      }

      const emailData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: `${service.name} - $${service.price} (${service.duration})`,
        barber: `${barber.name} - ${barber.specialties.join(', ')}`,
        date: formData.date,
        time: formData.time,
      };

      // Only send emails (no POST to backend)
      await emailjs.send(
        'service_ard3yp5',
        'template_f9qflf4',
        emailData
      );

      await emailjs.send(
        'service_ard3yp5',
        'template_t0srbxs',
        emailData
      );

      // Success
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        barber: null,
        date: '',
        time: ''
      });

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 5000);

    } catch (err: any) {
      console.error('Booking error:', err);
      setError(
        err?.message || 'Failed to send booking request. Please try again or contact us directly.'
      );
    } finally {
      setLoading(false);
    }
  };

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;
    const anyInput = input as any;
    if (typeof anyInput.showPicker === 'function') {
      anyInput.showPicker();
    } else {
      input.focus();
    }
  };

  const getSelectedServiceDisplay = () => {
    if (!formData.service) return 'Select a service';
    const service = services.find(s => s.id === formData.service);
    return service ? `${service.name} - $${service.price}` : 'Select a service';
  };

  const getSelectedBarberDisplay = () => {
    if (!formData.barber) return 'Select a barber';
    const barber = barbers.find(b => b.id === formData.barber);
    return barber ? barber.name : 'Select a barber';
  };

  return (
    <div className={`${isDark ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen transition-colors duration-500`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:wght@300;400;600;700&display=swap');`}</style>

      {/* Hero */}
      <div className="relative h-[70vh] overflow-hidden">
        <div ref={heroRef} className="absolute inset-0">
          <img
            src={isDark ? heroImages.dark : heroImages.light}
            alt="Booking hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-black" />
          <div className="absolute inset-0 bg-linear-to-r from-[#d4af37]/20 via-[#d4af37]/12 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-r from-[#d4af37]/10 to-transparent opacity-60 mix-blend-screen pointer-events-none" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4"
        >
          <div className="w-20 h-1 bg-[#d4af37] mx-auto mb-6" />
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            <span>Book an </span>
            <span className="text-[#D4AF37]">Appointment</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl font-light text-white/90" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Choose a service, select your barber, and reserve the perfect time.
          </p>
        </motion.div>
      </div>

      {/* Title */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="text-center mb-8">
          <h2
            className={`text-3xl md:text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Schedule a Visit
          </h2>
          <div className="w-24 h-1 bg-[#d4af37] mx-auto mt-4" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="order-first lg:order-last"
          >
            <motion.form
              onSubmit={handleSubmit}
              className={`backdrop-blur-xl ${isDark ? 'bg-black/40' : 'bg-white/30'} border-2 border-[#D4AF37]/25 rounded-2xl p-8 shadow-[0_0_40px_rgba(212,175,55,0.12)]`}
            >
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: [0, -6, 6, -3, 3, 0] }}
                    exit={{ opacity: 0 }}
                    className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-300"
                    role="alert"
                  >
                    {error}
                  </motion.div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-300 flex items-start gap-3"
                    role="alert"
                  >
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Booking request sent successfully!</p>
                      <p className="text-sm mt-1">Check your email for confirmation. We'll contact you shortly to confirm your appointment.</p>
                    </div>
                  </motion.div>
                )}

                {dataError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500 rounded-lg text-yellow-300"
                    role="alert"
                  >
                    {dataError}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-6">
                <label className="block text-[#D4AF37] mb-2 font-semibold">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full ${isDark ? 'bg-black/60' : 'bg-white/80'} border border-gray-700 rounded-xl py-3 pl-12 pr-4 ${isDark ? 'text-white' : 'text-black'} focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 transition-all`}
                    placeholder="Your full name"
                    aria-label="Full name"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[#D4AF37] mb-2 font-semibold">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full ${isDark ? 'bg-black/60' : 'bg-white/80'} border border-gray-700 rounded-xl py-3 pl-12 pr-4 ${isDark ? 'text-white' : 'text-black'} focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 transition-all`}
                    placeholder="you@example.com"
                    aria-label="Email address"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-[#D4AF37] mb-2 font-semibold">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full ${isDark ? 'bg-black/60' : 'bg-white/80'} border border-gray-700 rounded-xl py-3 pl-12 pr-4 ${isDark ? 'text-white' : 'text-black'} focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 transition-all`}
                    placeholder="+1 (555) 000-0000"
                    aria-label="Phone number"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Custom Service Dropdown */}
              <div className="mb-6" ref={serviceDropdownRef}>
                <label className="block text-[#D4AF37] mb-2 font-semibold">Service</label>
                <div className="relative">
                  <Scissors className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => !loading && !dataLoading && !dataError && setServiceDropdownOpen(!serviceDropdownOpen)}
                    disabled={loading || dataLoading || !!dataError}
                    className={`w-full ${isDark ? 'bg-black/60' : 'bg-white/80'} border ${serviceDropdownOpen ? 'border-[#D4AF37]' : 'border-gray-700'} rounded-xl py-3 pl-12 pr-10 ${isDark ? 'text-white' : 'text-black'} text-left focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className={formData.service ? '' : 'text-gray-400'}>
                      {dataLoading ? 'Loading services...' : getSelectedServiceDisplay()}
                    </span>
                  </button>
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-transform ${serviceDropdownOpen ? 'rotate-180' : ''}`} />
                  
                  <AnimatePresence>
                    {serviceDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute z-50 w-full mt-2 ${isDark ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-xl border border-[#D4AF37]/30 rounded-xl shadow-2xl max-h-64 overflow-y-auto`}
                      >
                        {services.map((service) => (
                          <motion.button
                            key={service.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, service: service.id });
                              setServiceDropdownOpen(false);
                            }}
                            whileHover={{ backgroundColor: isDark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.15)' }}
                            className={`w-full text-left px-4 py-3 transition-colors border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} last:border-b-0 relative`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className={`font-semibold ${isDark ? 'text-white' : 'text-black'} truncate`}>
                                  {service.name}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="text-[#D4AF37] text-sm font-medium">${service.price}</span>
                                  <span className="text-gray-400 text-xs">•</span>
                                  <span className="text-gray-400 text-xs">{service.duration}</span>
                                </div>
                              </div>
                              {formData.service === service.id && (
                                <Check className="w-5 h-5 text-[#D4AF37] shrink-0" />
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Custom Barber Dropdown */}
              <div className="mb-6" ref={barberDropdownRef}>
                <label className="block text-[#D4AF37] mb-2 font-semibold">Choose Your Barber</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => !loading && !dataLoading && !dataError && setBarberDropdownOpen(!barberDropdownOpen)}
                    disabled={loading || dataLoading || !!dataError}
                    className={`w-full ${isDark ? 'bg-black/60' : 'bg-white/80'} border ${barberDropdownOpen ? 'border-[#D4AF37]' : 'border-gray-700'} rounded-xl py-3 pl-4 pr-10 ${isDark ? 'text-white' : 'text-black'} text-left focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className={formData.barber ? '' : 'text-gray-400'}>
                      {dataLoading ? 'Loading barbers...' : getSelectedBarberDisplay()}
                    </span>
                  </button>
                  <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-transform ${barberDropdownOpen ? 'rotate-180' : ''}`} />
                  
                  <AnimatePresence>
                    {barberDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute z-50 w-full mt-2 ${isDark ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-xl border border-[#D4AF37]/30 rounded-xl shadow-2xl max-h-80 overflow-y-auto`}
                      >
                        {barbers.map((barber) => (
                          <motion.button
                            key={barber.id}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, barber: barber.id });
                              setBarberDropdownOpen(false);
                            }}
                            whileHover={{ backgroundColor: isDark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.15)' }}
                            className={`w-full text-left px-4 py-3 transition-colors border-b ${isDark ? 'border-gray-800' : 'border-gray-200'} last:border-b-0 relative`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className={`font-semibold ${isDark ? 'text-white' : 'text-black'} mb-1`}>
                                  {barber.name}
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {barber.specialties.map((specialty, idx) => (
                                    <span
                                      key={idx}
                                      className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-[#D4AF37]/30 text-[#8B7324]'}`}
                                    >
                                      {specialty}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              {formData.barber === barber.id && (
                                <Check className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-[#D4AF37] mb-2 font-semibold">Date</label>
                  <div
                    className="relative"
                    onClick={() => !loading && openDatePicker()}
                    role="button"
                    aria-label="Open date picker"
                  >
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <input
                      ref={dateInputRef}
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full ${isDark ? 'bg-black/60' : 'bg-white/80'} border border-gray-700 rounded-xl py-3 pl-12 pr-4 ${isDark ? 'text-white' : 'text-black'} focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 transition-all`}
                      aria-label="Select date"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#D4AF37] mb-2 font-semibold">Time</label>
                  <div className="relative" ref={timeDropdownRef}>
                    <Clock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => !loading && setTimeDropdownOpen(!timeDropdownOpen)}
                      disabled={loading}
                      className={`w-full ${isDark ? 'bg-black/60' : 'bg-white/80'} border ${timeDropdownOpen ? 'border-[#D4AF37]' : 'border-gray-700'} rounded-xl py-3 pl-12 pr-10 ${isDark ? 'text-white' : 'text-black'} text-left focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span className={formData.time ? '' : 'text-gray-400'}>
                        {formData.time || 'Select time'}
                      </span>
                    </button>
                    <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none transition-transform ${timeDropdownOpen ? 'rotate-180' : ''}`} />
                    
                    <AnimatePresence>
                      {timeDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className={`absolute z-50 w-full mt-2 ${isDark ? 'bg-black/95' : 'bg-white/95'} backdrop-blur-xl border border-[#D4AF37]/30 rounded-xl shadow-2xl max-h-60 overflow-y-auto`}
                        >
                          <div className="grid grid-cols-2 gap-1 p-2">
                            {timeSlots.map((slot) => (
                              <motion.button
                                key={slot}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, time: slot });
                                  setTimeDropdownOpen(false);
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`px-3 py-2.5 rounded-lg transition-all text-center font-medium ${
                                  formData.time === slot
                                    ? 'bg-[#D4AF37] text-black shadow-lg'
                                    : isDark
                                    ? 'bg-black/40 text-white hover:bg-[#D4AF37]/20 hover:text-[#D4AF37]'
                                    : 'bg-white/40 text-black hover:bg-[#D4AF37]/20 hover:text-[#8B7324]'
                                }`}
                              >
                                <div className="flex items-center justify-center gap-1.5">
                                  {formData.time === slot && (
                                    <Check className="w-4 h-4" />
                                  )}
                                  <span className="text-sm">{slot}</span>
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading || dataLoading || !!dataError}
                whileHover={!loading ? { scale: 1.02, boxShadow: "0 0 30px rgba(212,175,55,0.5)" } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                className="w-full bg-linear-to-r from-[#D4AF37] to-yellow-500 text-black font-bold py-4 rounded-xl shadow-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Submit booking request"
              >
                {loading ? 'Sending Request...' : 'Request Booking'}
              </motion.button>

              <p className="text-sm text-center mt-4 text-gray-400">
                You'll receive a confirmation email shortly after submitting your request.
              </p>
            </motion.form>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="order-last lg:order-first"
          >
            <div className={`backdrop-blur-xl ${isDark ? 'bg-black/40' : 'bg-white/30'} border-2 border-[#D4AF37]/25 rounded-2xl p-4 h-188.75 shadow-[0_0_40px_rgba(212,175,55,0.12)]`}>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-xl font-bold text-[#D4AF37]">Our Location</h3>
              </div>

              <div className="w-full h-150 rounded-xl overflow-hidden shadow-inner">
                <iframe
                  src={locationEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="block"
                  title="barbershop-location"
                />
              </div>

              <div className={`top-2 relative ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <p className="text-sm">123 Premium Ave, Suite 100</p>
                <p className="text-sm">New York, NY 10036</p>
                <p className="text-sm mt-2">Phone: (555) 123-4567</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Calendly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 max-w-7xl mx-auto"
        >
          <motion.button
            onClick={() => setShowCalendly(!showCalendly)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full backdrop-blur-xl ${isDark ? 'bg-black/40' : 'bg-white/30'} border-2 border-[#D4AF37]/25 rounded-2xl p-6 flex items-center justify-between shadow-[0_0_30px_rgba(212,175,55,0.12)] transition-all`}
          >
            <span className="text-lg font-semibold text-[#D4AF37]">
              Prefer using Calendly? Book here
            </span>
            <motion.div
              animate={{ rotate: showCalendly ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-6 h-6 text-[#D4AF37]" />
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {showCalendly && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="overflow-hidden mt-4"
              >
                <div className={`backdrop-blur-xl ${isDark ? 'bg-black/40' : 'bg-white/30'} border-2 border-[#D4AF37]/25 rounded-2xl p-4`}>
                  <iframe
                    src="https://calendly.com"
                    width="100%"
                    height="700"
                    frameBorder="0"
                    className="rounded-xl"
                    title="calendly"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingPage;