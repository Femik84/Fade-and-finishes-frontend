import React, { useContext, useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Award, Users, Sparkles, Scissors, Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../Context/ThemeContext';
import Footer from '../components/Footer';
import {
  aboutStory,
  aboutMission,
  aboutUnique,
  aboutAchievements,
  aboutCTA
} from '../Data/data';

// Import local images from public folder
const aboutImage = '/about.jfif';
const heroLight = '/herolight.jfif';
const heroDark = '/herodark.jfif';

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

// Counter component for animating numbers
const AnimatedCounter: React.FC<{ end: string; duration?: number }> = ({ end, duration = 2 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(countRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (isInView) {
      const numStr = end.replace(/[^0-9]/g, '');

      if (!numStr) {
        return;
      }

      const targetNum = parseInt(numStr, 10);
      const isThousands = end.includes('K') || end.includes(',');
      const actualTarget = isThousands && end.includes('K') ? targetNum * 1000 : targetNum;

      let startTime: number | null = null;
      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * actualTarget);

        setCount(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(actualTarget);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isInView, end, duration]);

  const formatCount = (num: number) => {
    const hasWords = /[a-zA-Z]/.test(end);

    if (!hasWords) {
      if (end.includes('K')) {
        return `${(num / 1000).toFixed(num % 1000 === 0 ? 0 : 1)}K${end.includes('+') ? '+' : ''}`;
      }
      if (num >= 1000) {
        return `${num.toLocaleString()}${end.includes('+') ? '+' : ''}`;
      }
      return `${num}${end.includes('+') ? '+' : ''}`;
    } else {
      const match = end.match(/\d+\+?\s*(.+)/);
      const textPart = match ? match[1] : '';
      return `${num}${end.includes('+') ? '+' : ''} ${textPart}`;
    }
  };

  if (!/\d/.test(end)) {
    return <div ref={countRef}>{end}</div>;
  }

  return <div ref={countRef}>{formatCount(count)}</div>;
};

const About: React.FC = () => {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Hero parallax ref
  const heroRef = useRef<HTMLDivElement>(null);

  // Other animation refs
  const statsRef = useRef<HTMLDivElement | null>(null);
  const teamRef = useRef<HTMLDivElement | null>(null);
  const achievementsRef = useRef<HTMLDivElement | null>(null);
  const aboutUsRef = useRef<HTMLElement | null>(null);
  const storyRef = useRef<HTMLDivElement | null>(null);

  const aboutInView = useInView(aboutUsRef, { once: true, margin: '-100px' });

  useEffect(() => {
    // Hero parallax animation (same behavior as Services)
    if (heroRef.current) {
      gsap.to(heroRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
        y: 120,
        opacity: 0.85,
      });
    }

    const ctx = gsap.context(() => {
      // Stats
      gsap.from('.stat-item', {
        scrollTrigger: {
          trigger: statsRef.current,
          start: 'top 80%',
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
      });

      // Team cards
      gsap.from('.team-card', {
        scrollTrigger: {
          trigger: teamRef.current,
          start: 'top 70%',
        },
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
      });

      // Achievement badges
      gsap.from('.achievement-badge', {
        scrollTrigger: {
          trigger: achievementsRef.current,
          start: 'top 75%',
        },
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
      });
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const iconMap: { [key: string]: any } = {
    'Precision Craftsmanship': Scissors,
    'Client-Centered Care': Heart,
    'Luxury Experience': Sparkles,
  };

  const achievementIconMap = [Award, Star, Users, Sparkles];

  // Handler that navigates to booking page
  const goToBooking = () => {
    navigate('/booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`${isDark ? 'bg-black' : 'bg-neutral-50'} transition-colors duration-500 min-h-screen`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:wght@300;400;600;700&display=swap');
      `}</style>

      {/* Hero Section */}
      <div className="relative h-[71vh] lg:h-[70vh] overflow-hidden">
        <div ref={heroRef} className="absolute inset-0">
          <img
            src={isDark ? heroDark : heroLight}
            alt="Luxury Barbershop Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-black" />
          <div className="absolute inset-0 bg-linear-to-r from-[#d4af37]/20 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-4"
          >
            <div className="w-20 h-1 bg-[#d4af37] mx-auto mb-6" />
          </motion.div>

          <h1
            className="text-5xl md:text-7xl font-bold mb-4 tracking-tight text-white"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            About <span style={{ color: goldColors.primary }}>Fade & Finishes</span>
          </h1>

          <p
            className="text-lg md:text-xl max-w-2xl font-light text-gray-300"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            A legacy of masterful grooming, refined service, and an elevated client experience.
          </p>
        </motion.div>
      </div>

      {/* Our Story */}
      <section ref={storyRef} className={`py-19 md:py-20 ${isDark ? 'bg-zinc-900' : 'bg-neutral-100'}`}>
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2
                className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-neutral-900'}`}
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {aboutStory.title}
              </h2>
              <div className="w-24 h-1 mx-auto" style={{ backgroundColor: goldColors.primary }} />
            </motion.div>

            <motion.div variants={fadeInUp} className="prose prose-lg md:prose-xl max-w-none">
              {aboutStory.paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className={`${isDark ? 'text-gray-300' : 'text-neutral-800'} leading-relaxed mb-6 text-[19px]`}
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                >
                  {paragraph}
                </p>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* About Us section */}
      <section
        id="about-us"
        ref={aboutUsRef}
        className={`py-8 px-4 md:px-8 ${isDark ? 'bg-black' : 'bg-white'}`}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={aboutInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={aboutInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="relative">
                <div
                  className="absolute -top-4 -left-4 w-full h-full border-4 rounded-lg"
                  style={{ borderColor: `${goldColors.primary}4D` }}
                />
                <img
                  src={aboutImage}
                  alt="Barbershop Interior"
                  className="relative rounded-lg shadow-2xl w-full h-125 object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={aboutInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h2
                className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-black'}`}
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                About Us
              </h2>
              <div className="w-20 h-1 mb-8" style={{ backgroundColor: goldColors.primary }} />
              <p
                className={`text-[19px] mb-6 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-800'}`}
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                Since 2010, Fade and Finishes has been the premier destination for gentlemen seeking impeccable grooming and unparalleled service. Our master stylists combine traditional barbering techniques with modern aesthetics to deliver transformative experiences.
              </p>
              <p
                className={`text-[19px] mb-8 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-800'}`}
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                We believe every man deserves to look and feel his absolute best. That's why we've crafted an environment where luxury meets comfort, and where every detail is designed to elevate your grooming routine into an art form.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Mission & Values */}
      <section className={`py-20 md:py-28 ${isDark ? 'bg-black' : 'bg-white'}`}>
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-6xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2
                className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-neutral-900'}`}
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {aboutMission.title}
              </h2>
              <p
                className={`text-[19px] max-w-3xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                {aboutMission.subtitle}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {aboutMission.values.map((value, index) => {
                const IconComponent = iconMap[value.title] || Sparkles;
                return (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    whileHover={{
                      y: -12,
                      transition: { duration: 0.3, ease: 'easeOut' }
                    }}
                    className={`${isDark ? 'bg-zinc-900' : 'bg-neutral-50'} p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group`}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(135deg, ${goldColors.primary}08 0%, ${goldColors.primary}15 100%)`
                      }}
                    />

                    <div
                      className="absolute -inset-full group-hover:inset-0 transition-all duration-700 opacity-0 group-hover:opacity-30"
                      style={{
                        background: `linear-gradient(45deg, transparent 30%, ${goldColors.primary}40 50%, transparent 70%)`
                      }}
                    />

                    <motion.div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-6 relative z-10"
                      style={{ backgroundColor: `${goldColors.primary}1A` }}
                      whileHover={{
                        scale: 1.1,
                        rotate: 360,
                        backgroundColor: `${goldColors.primary}30`,
                        transition: { duration: 0.6, ease: 'easeOut' }
                      }}
                    >
                      <IconComponent
                        className="w-8 h-8 transition-colors duration-300"
                        style={{ color: goldColors.primary }}
                      />
                    </motion.div>

                    <h3
                      className={`text-2xl font-bold mb-4 relative z-10 ${isDark ? 'text-white' : 'text-neutral-900'}`}
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {value.title}
                    </h3>
                    <p
                      className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed text-[19px] relative z-10`}
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      {value.description}
                    </p>

                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-0 group-hover:w-full transition-all duration-500"
                      style={{ backgroundColor: goldColors.primary }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* What Makes Us Unique */}
      <section className={`py-20 md:py-28 ${isDark ? 'bg-zinc-900' : 'bg-neutral-100'}`}>
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2
                className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-neutral-900'}`}
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {aboutUnique.title}
              </h2>
              <div className="w-24 h-1 mx-auto" style={{ backgroundColor: goldColors.primary }} />
            </motion.div>

            <motion.div variants={fadeInUp} className="grid md:grid-cols-2 gap-6">
              {aboutUnique.features.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-4 p-6 rounded-xl ${isDark ? 'bg-black hover:bg-zinc-800' : 'bg-white hover:bg-amber-50/50'} transition-colors duration-300`}
                >
                  <div
                    className="w-2 h-2 rounded-full mt-2 shrink-0"
                    style={{ backgroundColor: goldColors.primary }}
                  />
                  <div>
                    <h4
                      className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-neutral-900'}`}
                      style={{ fontFamily: 'Playfair Display, serif' }}
                    >
                      {item.title}
                    </h4>
                    <p
                      className={`${isDark ? 'text-gray-300' : 'text-gray-700'} text-[19px]`}
                      style={{ fontFamily: 'Cormorant Garamond, serif' }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Achievements & Stats */}
      <section
        ref={achievementsRef}
        className={`py-20 md:py-28 ${isDark ? 'bg-black' : 'bg-neutral-100'}`}
      >
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-neutral-900'}`}
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {aboutAchievements.title}
            </h2>
            <p
              className={`text-[19px] max-w-3xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              {aboutAchievements.subtitle}
            </p>
          </div>

          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {aboutAchievements.stats.map((achievement, index) => {
              const IconComponent = achievementIconMap[index] || Award;
              return (
                <div
                  key={index}
                  className="achievement-badge stat-item text-center group"
                >
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${isDark ? 'bg-amber-500/10 group-hover:bg-amber-500' : 'bg-amber-500/10 group-hover:bg-amber-500'}`}
                  >
                    <IconComponent
                      className={`w-10 h-10 transition-colors duration-300 ${isDark ? 'text-amber-600 group-hover:text-white' : 'text-amber-600 group-hover:text-white'}`}
                    />
                  </div>
                  <div
                    className={`text-2xl md:text-5xl font-bold mb-2 ${isDark ? 'text-white' : 'text-neutral-900'}`}
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    <AnimatedCounter end={achievement.label} duration={2.5} />
                  </div>
                  <div
                    className={`font-medium text-[19px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  >
                    {achievement.description}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Certifications & Training */}
          <div className="mt-20 max-w-4xl mx-auto">
            <div
              className={`${isDark ? 'bg-linear-to-br from-amber-900/20 to-amber-800/10' : 'bg-linear-to-br from-amber-50 to-amber-100/50'} rounded-3xl p-10 md:p-14 text-center`}
            >
              <h3
                className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-neutral-900'}`}
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {aboutAchievements.certifications.title}
              </h3>
              <p
                className={`text-[19px] leading-relaxed mb-8 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                {aboutAchievements.certifications.description}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {aboutAchievements.certifications.institutions.map((cert, idx) => (
                  <span
                    key={idx}
                    className={`px-6 py-3 ${isDark ? 'bg-zinc-900' : 'bg-white'} rounded-full ${isDark ? 'text-white' : 'text-neutral-900'} font-medium shadow-md text-[19px]`}
                    style={{ fontFamily: 'Cormorant Garamond, serif' }}
                  >
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Elegant Closing Statement / CTA */}
      <section
        className={`py-20 md:py-28 ${isDark ? 'bg-zinc-900' : 'bg-white'} relative overflow-hidden`}
      >
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-4xl mx-auto text-center"
          >
            <h2
              className={`text-4xl md:text-6xl font-bold mb-8 leading-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {aboutCTA.title}
              <span className="block" style={{ color: goldColors.primary }}>{aboutCTA.titleAccent}</span>
            </h2>

            <p
              className={`text-xl md:text-2xl leading-relaxed mb-10 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              {aboutCTA.subtitle}
            </p>

            <motion.button
              whileHover={{
                scale: 1.05,
                backgroundColor: goldColors.hover,
                boxShadow: `0 0 30px ${goldColors.shadowStrong}`
              }}
              whileTap={{ scale: 0.95 }}
              onClick={goToBooking}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goToBooking();
                }
              }}
              className="px-10 py-4 text-black font-bold text-lg rounded-sm transition-colors duration-300 shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-amber-200"
              style={{
                backgroundColor: goldColors.primary,
                fontFamily: 'Playfair Display, serif'
              }}
              aria-label={aboutCTA.buttonText}
              type="button"
            >
              {aboutCTA.buttonText}
            </motion.button>

            <p
              className={`mt-8 italic text-[19px] ${isDark ? 'text-gray-400' : 'text-gray-700'}`}
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              {aboutCTA.tagline}
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;