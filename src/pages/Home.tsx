import React, { useContext, useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Footer from '../components/Footer';
import { ThemeContext } from '../Context/ThemeContext';
import { hero, gallery } from '../Data/data';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchArtists, fetchCategories, fetchReviews } from '../Data/api';
import { mapCategoriesToServices, mapArtistsToBarbers, mapReviewsToTestimonials } from '../utils/dataMapper';
import type { ServiceDisplay, BarberDisplay, TestimonialDisplay } from '../utils/type';

gsap.registerPlugin(ScrollTrigger);

// Gold color palette
const goldColors = {
  primary: '#D4AF37',
  light: '#F4E4B8',
  dark: '#B8941F',
  hover: '#E5C158',
  shadow: 'rgba(212, 175, 55, 0.5)',
  shadowStrong: 'rgba(212, 175, 55, 0.6)',
};

type NavHandler = (path: string, sectionId?: string) => void;

const HeroSection: React.FC<{ onNavigate: NavHandler }> = ({ onNavigate }) => {
  const { isDark } = useContext(ThemeContext);
  const { title, subtitle, backgroundLight, backgroundDark } = hero;
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!titleRef.current) return;

      const glitchTL = gsap.timeline({ repeat: -1, repeatDelay: 3 });
      glitchTL
        .to(titleRef.current, {
          x: -2,
          skewX: 70,
          duration: 0.1,
          ease: 'power4.inOut',
        })
        .to(titleRef.current, {
          x: 2,
          skewX: -70,
          duration: 0.1,
        })
        .to(titleRef.current, {
          x: 0,
          skewX: 0,
          duration: 0.1,
        });

      gsap.to('.hero-bg', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="home" ref={heroRef} className="relative h-screen overflow-hidden">
      <motion.div
        className="hero-bg absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${isDark ? backgroundDark : backgroundLight})` }}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        key={isDark ? 'dark' : 'light'}
      />

      <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{
        backgroundImage:
          "url(data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E)",
      }} />

      <div className="absolute inset-0 bg-black/70" />

      <div className="relative h-full flex flex-col items-center justify-center text-center px-4 z-10">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}>
          <h1
            ref={titleRef}
            className="text-6xl md:text-8xl lg:text-9xl font-bold mb-6"
            style={{
              fontFamily: 'Playfair Display, serif',
              color: goldColors.primary,
              textShadow: `0 0 30px ${goldColors.shadow}`,
            }}
          >
            {title}
          </h1>
        </motion.div>

        <motion.p className="text-xl md:text-3xl text-white mb-12 tracking-wide" style={{ fontFamily: 'Cormorant Garamond, serif' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1 }}>
          {subtitle}
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.3 }} className="flex gap-6 flex-wrap justify-center">
          <motion.button
            onClick={() => onNavigate('/booking')}
            className="px-8 py-4 text-black font-semibold text-lg rounded-sm transition-all cursor-pointer"
            style={{ backgroundColor: goldColors.primary }}
            whileHover={{
              scale: 1.05,
              backgroundColor: goldColors.hover,
              boxShadow: `0 0 30px ${goldColors.shadowStrong}`
            }}
            whileTap={{ scale: 0.95 }}
            aria-label="Book your appointment"
          >
            Book Your Appointment
          </motion.button>

          <motion.button
            onClick={() => onNavigate('/services')}
            className="px-8 py-4 border-2 font-semibold text-lg rounded-sm transition-all cursor-pointer"
            style={{
              borderColor: goldColors.primary,
              color: goldColors.primary
            }}
            whileHover={{
              scale: 1.05,
              backgroundColor: goldColors.primary,
              color: '#000000'
            }}
            whileTap={{ scale: 0.95 }}
            aria-label="View our services"
          >
            View Services
          </motion.button>
        </motion.div>
      </div>

      <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
        <div className="w-6 h-10 border-2 rounded-full flex justify-center" style={{ borderColor: goldColors.primary }}>
          <div className="w-1 h-2 rounded-full mt-2" style={{ backgroundColor: goldColors.primary }} />
        </div>
      </motion.div>
    </section>
  );
};

const AboutSection: React.FC<{ onNavigate: NavHandler }> = ({ onNavigate }) => {
  const { isDark } = useContext(ThemeContext);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" ref={ref} className={`py-32 px-4 md:px-8 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <motion.div initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              <div
                className="absolute -top-4 -left-4 w-full h-full border-4 rounded-lg"
                style={{ borderColor: `${goldColors.primary}4D` }}
              />
              <img
                src="/about.jfif"
                alt="Barbershop Interior"
                className="relative rounded-lg shadow-2xl w-full h-125 object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className={`text-5xl md:text-6xl font-bold mb-6 ${isDark ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
              About Us
            </h2>
            <div className="w-20 h-1 mb-8" style={{ backgroundColor: goldColors.primary }} />
            <p className={`text-lg mb-6 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Since 2010, Fade and Finishes has been the premier destination for gentlemen seeking impeccable grooming and unparalleled service. Our master stylists combine traditional barbering techniques with modern aesthetics to deliver transformative experiences.
            </p>
            <p className={`text-lg mb-8 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              We believe every man deserves to look and feel his absolute best. That's why we've crafted an environment where luxury meets comfort, and where every detail is designed to elevate your grooming routine into an art form.
            </p>
            <motion.button
              onClick={() => onNavigate('/about')}
              whileHover={{
                scale: 1.05,
                backgroundColor: goldColors.hover
              }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 text-black font-semibold text-lg rounded-sm transition-all cursor-pointer"
              style={{ backgroundColor: goldColors.primary }}
              aria-label="Learn more about us"
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

const ServicesSection: React.FC<{ onNavigate: NavHandler; services: ServiceDisplay[] }> = ({ onNavigate, services }) => {
  const { isDark } = useContext(ThemeContext);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="services" ref={ref} className={`py-32 px-4 md:px-8 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
      <motion.div initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="max-w-7xl mx-auto">
        <h2 className={`text-5xl md:text-6xl font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
          Our Services
        </h2>
        <p className={`text-center text-xl mb-16 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Curated experiences for the discerning individual
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading services...</p>
            </div>
          ) : (
            services.map((service, i) => (
              <motion.div
                key={service.name}
                role="button"
                tabIndex={0}
                onClick={() => onNavigate('/services')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onNavigate('/services');
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="group relative overflow-hidden rounded-lg shadow-2xl cursor-pointer aspect-4/3"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${service.img})` }}
                  aria-hidden
                />

                <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-black/30 group-hover:from-black/90 group-hover:via-black/80 transition-all duration-500" />

                <div className="absolute inset-0 flex flex-col justify-end p-8 z-10">
                  <h3
                    className="text-3xl md:text-4xl font-bold mb-3"
                    style={{
                      fontFamily: 'Playfair Display, serif',
                      color: goldColors.primary
                    }}
                  >
                    {service.name}
                  </h3>
                  <p
                    className="text-white text-lg"
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  >
                    {service.desc}
                  </p>
                </div>

                <motion.div
                  className="absolute bottom-0 left-0 w-full h-1"
                  style={{
                    background: `linear-gradient(to right, ${goldColors.primary}, ${goldColors.dark})`,
                    transformOrigin: 'left'
                  }}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </section>
  );
};

const BarberShowcase: React.FC<{ onNavigate: NavHandler; barbers: BarberDisplay[] }> = ({ onNavigate, barbers }) => {
  const { isDark } = useContext(ThemeContext);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true });

  // Only show first 4 barbers
  const displayBarbers = barbers.slice(0, 4);

  return (
    <section ref={ref} className={`py-32 px-4 md:px-8 ${isDark ? 'bg-black' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto">
        <motion.h2 initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className={`text-[40px] md:text-6xl font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
          Master Stylists
        </motion.h2>
        <p className={`text-center text-xl mb-16 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Meet the artists behind your transformation
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayBarbers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading stylists...</p>
            </div>
          ) : (
            displayBarbers.map((barber, i) => (
              <motion.div
                key={barber.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-lg cursor-pointer"
              >
                <div className="relative h-87.5 overflow-hidden rounded-lg">
                  <img
                    src={barber.img}
                    alt={barber.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />

                  <motion.div
                    className="absolute top-0 left-0 w-full h-1"
                    style={{
                      background: `linear-gradient(to right, ${goldColors.primary}, ${goldColors.dark})`,
                      transformOrigin: 'left'
                    }}
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                </div>

                <div className="mt-4">
                  <h3
                    className="text-2xl md:text-3xl font-bold mb-2"
                    style={{
                      fontFamily: 'Playfair Display, serif',
                      color: goldColors.primary
                    }}
                  >
                    {barber.name}
                  </h3>
                  <p className={`text-lg mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                    {barber.specialty}
                  </p>
                  <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {barber.exp} experience
                  </p>

                  <motion.div
                    className="mt-3"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <button
                      onClick={() => onNavigate('/booking')}
                      className="text-sm font-semibold transition-colors cursor-pointer"
                      style={{ color: goldColors.primary }}
                      aria-label={`View ${barber.name} profile and book`}
                    >
                      View Profile →
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

const GallerySection: React.FC = () => {
  const { isDark } = useContext(ThemeContext);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="gallery" ref={ref} className={`py-32 px-4 md:px-8 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
      <div className="max-w-7xl mx-auto">
        <motion.h2 initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className={`text-5xl md:text-6xl font-bold text-center mb-4 ${isDark ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
          Our Artistry
        </motion.h2>
        <p className={`text-center text-xl mb-16 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Witness transformations that speak volumes
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gallery.map((img, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.5, delay: i * 0.1 }} whileHover={{ scale: 1.05 }} className="relative overflow-hidden rounded-lg aspect-square cursor-pointer group">
              <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <motion.div initial={{ opacity: 0, scale: 0 }} whileHover={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-16 h-16 border-2 rounded-full flex items-center justify-center"
                  style={{ borderColor: goldColors.primary }}
                >
                  <span className="text-2xl" style={{ color: goldColors.primary }}>✨</span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const BookingCTA: React.FC<{ onNavigate: NavHandler }> = ({ onNavigate }) => {
  const { isDark } = useContext(ThemeContext);
  const ref = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(button, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <section id="booking" ref={ref} className={`py-32 px-4 md:px-8 relative overflow-hidden ${isDark ? 'bg-black' : 'bg-white'}`}>
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, ${goldColors.primary} 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={`text-[40px] md:text-7xl font-bold mb-3 lg:mb-6 ${isDark ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
          Ready for Your Transformation?
        </motion.h2>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className={`text-xl md:text-2xl mb-6 lg:mb-12 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Join the elite clientele who trust us with their image
        </motion.p>

        <motion.button
          ref={buttonRef}
          onClick={() => onNavigate('/booking')}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="px-12 py-6 text-black font-bold text-xl rounded-sm transition-all relative overflow-hidden group cursor-pointer"
          style={{ backgroundColor: goldColors.primary }}
          aria-label="Book now"
        >
          <span className="relative z-10">Book Now</span>
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(to right, ${goldColors.hover}, ${goldColors.dark})`
            }}
            initial={{ x: '-100%' }}
            whileHover={{ x: 0 }}
            transition={{ duration: 0.4 }}
            aria-hidden
          />
        </motion.button>
      </div>
    </section>
  );
};

const TestimonialsSection: React.FC<{ testimonials: TestimonialDisplay[] }> = ({ testimonials }) => {
  const { isDark } = useContext(ThemeContext);
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className={`py-32 px-4 md:px-8 ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
      <div className="max-w-7xl mx-auto">
        <motion.h2 initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} className={`text-5xl md:text-6xl font-bold text-center mb-16 ${isDark ? 'text-white' : 'text-black'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
          Client Testimonials
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading testimonials...</p>
            </div>
          ) : (
            testimonials.slice(0, 3).map((test, i) => (
              <motion.div key={test.name + i} initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.2 }} className={`p-8 rounded-lg shadow-2xl relative ${isDark ? 'bg-zinc-800' : 'bg-white'}`}>
                <div className="flex items-center mb-4">
                  <img src={test.img} alt={test.name} className="w-16 h-16 rounded-full object-cover mr-4" />
                  <div>
                    <h4 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-black'}`}>{test.name}</h4>
                    <div className="flex gap-1">
                      {[...Array(test.rating)].map((_, i) => (
                        <span key={i} style={{ color: goldColors.primary }}>★</span>
                      ))}
                    </div>
                  </div>
                </div>

                <p className={`text-lg italic ${isDark ? 'text-gray-300' : 'text-gray-700'}`} style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  "{test.text}"
                </p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

const Home: React.FC = () => {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  // State for backend data
  const [services, setServices] = useState<ServiceDisplay[]>([]);
  const [barbers, setBarbers] = useState<BarberDisplay[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialDisplay[]>([]);

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, artistsData, reviewsData] = await Promise.all([
          fetchCategories(),
          fetchArtists(),
          fetchReviews()
        ]);

        setServices(mapCategoriesToServices(categoriesData));
        setBarbers(mapArtistsToBarbers(artistsData));
        setTestimonials(mapReviewsToTestimonials(reviewsData));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const handleNavigation: NavHandler = (path, sectionId) => {
    if (location.pathname === path || (path === '/' && location.pathname === '')) {
      if (sectionId) {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`${isDark ? 'dark bg-black' : 'bg-white'} transition-colors duration-500`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:wght@300;400;600;700&display=swap');
        
        body {
          overflow-x: hidden;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <HeroSection onNavigate={handleNavigation} />
      <AboutSection onNavigate={handleNavigation} />
      <ServicesSection onNavigate={handleNavigation} services={services} />
      <BarberShowcase onNavigate={handleNavigation} barbers={barbers} />
      <GallerySection />
      <BookingCTA onNavigate={handleNavigation} />
      <TestimonialsSection testimonials={testimonials} />
      <Footer />
    </div>
  );
};

export default Home;