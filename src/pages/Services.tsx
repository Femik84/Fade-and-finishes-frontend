import React, { useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ThemeContext } from "../Context/ThemeContext";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../utils/constant";
import { getCache, setCache } from "../utils/cache";

gsap.registerPlugin(ScrollTrigger);

const goldColors = {
  primary: "#D4AF37",
  light: "#F4E4B8",
  dark: "#B8941F",
  hover: "#E5C158",
  shadow: "rgba(212, 175, 55, 0.5)",
  shadowStrong: "rgba(212, 175, 55, 0.6)",
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const modalOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalContentVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25 } },
};

type BackendService = {
  id: number;
  name: string;
  slug?: string;
  difficulty_level?: string;
  tagline?: string;
  short_description?: string;
  long_description?: string;
  price?: string;
  duration?: string;
  hero_image?: string;
  gallery?: Array<{ id: number; image: string }>;
  category?: { id: number; name: string; slug?: string };
  reviews?: Array<any>;
};

type UiService = {
  id: number | string;
  slug?: string;
  name: string;
  image?: string;
  tagline?: string;
  description?: string; // short_description
  longDescription?: string;
  price?: string;
  duration?: string;
  category?: { id: number; name: string; slug?: string };
  raw?: BackendService;
};

type CategoryGroup = {
  id: number | string;
  name: string;
  services: UiService[];
};

// Cache key and TTL
const SERVICE_CACHE_KEY = "services_v1_grouped";
const SERVICE_CACHE_TTL = 1000 * 60 * 60; // 1 hour

const Services: React.FC = () => {
  const { isDark } = useContext(ThemeContext);
  const heroRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<(HTMLDivElement | null)[]>([]);
  const navigate = useNavigate();

  // Modal state
  const [selectedItem, setSelectedItem] = useState<UiService | null>(null);
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // Format duration: if < 60 -> "XX mins", otherwise convert to hours (e.g. "1 hr", "1 hr 15 mins")
  const formatDuration = (d?: string | number): string => {
    if (d === undefined || d === null || d === "") return "";
    const numeric = Number(String(d).replace(/[^\d.]/g, ""));
    if (Number.isNaN(numeric)) return String(d);

    const minutes = Math.floor(numeric);
    if (minutes < 60) {
      return `${minutes} mins`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hourLabel = hours === 1 ? "hr" : "hrs";
    if (mins === 0) return `${hours} ${hourLabel}`;
    return `${hours} ${hourLabel} ${mins} mins`;
  };

  useEffect(() => {
    let mounted = true;

    const loadFromCache = () => {
      try {
        const cached = getCache(SERVICE_CACHE_KEY) as CategoryGroup[] | null;
        if (cached && Array.isArray(cached) && mounted) {
          setCategories(cached);
          setIsLoading(false);
        }
        return !!cached;
      } catch (err) {
        // cache access may fail in some browsers/environments
        return false;
      }
    };

    const fetchAndCache = async () => {
      try {
        const data = await apiGet<BackendService[]>("services/");
        if (!mounted) return;

        const uiServices: UiService[] = (data || []).map((s) => {
          const image =
            s.hero_image ||
            (s.gallery && s.gallery.length > 0 ? s.gallery[0].image : "") ||
            "";
          return {
            id: s.id,
            slug: s.slug,
            name: s.name,
            image,
            tagline: s.tagline || "",
            description: s.short_description || "",
            longDescription: s.long_description || "",
            price: s.price ? `$${s.price}` : s.price || "",
            duration: s.duration ? `${s.duration}` : s.duration || "",
            category: s.category
              ? { id: s.category.id, name: s.category.name, slug: s.category.slug }
              : undefined,
            raw: s,
          };
        });

        const grouped: Record<string, CategoryGroup> = uiServices.reduce(
          (acc: Record<string, CategoryGroup>, svc) => {
            const catId = svc.category ? String(svc.category.id) : "uncategorized";
            const catName = svc.category ? svc.category.name : "Other Services";
            if (!acc[catId])
              acc[catId] = {
                id: svc.category ? svc.category.id : catId,
                name: catName,
                services: [],
              };
            acc[catId].services.push(svc);
            return acc;
          },
          {}
        );

        const groupedArray = Object.values(grouped) as CategoryGroup[];

        // Update cache with mapped & grouped UI data
        try {
          setCache(SERVICE_CACHE_KEY, groupedArray, SERVICE_CACHE_TTL);
        } catch (err) {
          // swallow localStorage errors
          // console.warn('setCache failed', err);
        }

        if (mounted) {
          setCategories(groupedArray);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load services from backend:", err);
        // if there is no cache and fetch failed, show error state
        if (mounted) {
          const cached = getCache(SERVICE_CACHE_KEY) as CategoryGroup[] | null;
          if (!cached) {
            setCategories([]);
            setIsLoading(false);
          }
        }
      }
    };

    const hadCache = loadFromCache();

    // If cache existed we already set UI and still attempt a background refresh to update stale data.
    // If no cache, fetch (and show loader until it completes).
    fetchAndCache();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // Hero parallax animation
    if (heroRef.current) {
      gsap.to(heroRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        y: 150,
        opacity: 0.6,
      });
    }

    // Category section animations
    categoriesRef.current.forEach((category, index) => {
      if (category) {
        gsap.fromTo(
          category,
          {
            opacity: 0,
            y: 40,
          },
          {
            scrollTrigger: {
              trigger: category,
              start: "top 95%",
              end: "top 70%",
              toggleActions: "play none none none",
              once: true,
            },
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: index * 0.05,
            ease: "power2.out",
          }
        );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [categories]);

  // Open modal: save focus, prevent body scroll
  const openModal = (item: UiService) => {
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    setSelectedItem(item);
    document.body.style.overflow = "hidden";
  };

  // Close modal: restore focus, re-enable scroll
  const closeModal = () => {
    setSelectedItem(null);
    document.body.style.overflow = "";
    if (lastFocusedRef.current) {
      lastFocusedRef.current.focus();
    }
  };

  // Focus close button when modal opens
  useEffect(() => {
    if (selectedItem) {
      // delay to ensure element exists
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);
    }
  }, [selectedItem]);

  // ESC key closes modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedItem) {
        closeModal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedItem]);

  const goToBooking = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    closeModal();
    navigate("/booking");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // navigate to details page using slug (preferred) or fallback to id
  const goToFullPage = (service: UiService, e?: React.MouseEvent) => {
    e?.stopPropagation();
    closeModal();

    const slug = service.slug || service.raw?.slug;
    const param = slug ? `slug=${encodeURIComponent(slug)}` : `id=${encodeURIComponent(String(service.id))}`;
    navigate(`/service-details?${param}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // keyboard helper for clickable cards
  const handleCardKeyDown =
    (idOrItem: any) =>
    (e: React.KeyboardEvent<HTMLDivElement> | React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(idOrItem);
      }
    };

  return (
    <div className={`${isDark ? "bg-black" : "bg-white"} min-h-screen transition-colors duration-500`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:wght@300;400;600;700&display=swap');`}</style>

      {/* Premium Hero Section - use public hero images */}
      <div className="relative h-[70vh] overflow-hidden">
        <div ref={heroRef} className="absolute inset-0">
          <img
            src={isDark ? "/herodark.jfif" : "/herolight.jfif"}
            alt="Luxury Salon"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/20 to-transparent" />
        </div>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }} className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} className="mb-4">
            <div className="w-20 h-1 bg-[#d4af37] mx-auto mb-6" />
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight text-white" style={{ fontFamily: "Playfair Display, serif" }}>
            Our <span style={{ color: goldColors.primary }}>Services</span>
          </h1>

          <p className="text-xl md:text-2xl max-w-2xl font-light text-gray-300" style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Experience the pinnacle of luxury grooming where artistry meets excellence
          </p>
        </motion.div>
      </div>

      {/* Services Categories */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        {isLoading && (
          <div className="text-center py-10">
            <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className={isDark ? "text-gray-300" : "text-gray-700"}>Loading services...</p>
          </div>
        )}

        {!isLoading && categories.length === 0 && (
          <div className="text-center py-10">
            <p className={isDark ? "text-gray-300" : "text-gray-700"}>No services available right now.</p>
          </div>
        )}

        {categories.map((category, categoryIndex) => (
          <div
            key={category.id}
            ref={(el) => {
              categoriesRef.current[categoryIndex] = el;
            }}
            className="mb-24"
          >
            {/* Category Header */}
            <div className="text-center mb-16">
              <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? "text-white" : "text-black"}`} style={{ fontFamily: "Playfair Display, serif" }}>
                {category.name}
              </h2>
              <div className="w-24 h-1 bg-[#d4af37] mx-auto" />
            </div>

            {/* Service Cards */}
            <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px", amount: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.services.map((service) => (
                <motion.div
                  key={service.id}
                  variants={cardVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`group relative rounded-lg overflow-hidden border transition-all duration-500 cursor-pointer ${
                    isDark ? "bg-gradient-to-br from-zinc-900 to-black border-zinc-800 hover:border-[#d4af37]" : "bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-[#d4af37] shadow-lg"
                  }`}
                  role="button"
                  tabIndex={0}
                  onClick={() => openModal(service)}
                  onKeyDown={handleCardKeyDown(service)}
                  aria-label={`Open details for ${service.name}`}
                >
                  {/* Service Image */}
                  <div className="relative h-64 overflow-hidden">
                    <img src={service.image} alt={service.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                    {/* Gold accent overlay on hover */}
                    <div className="absolute inset-0 bg-[#d4af37]/0 group-hover:bg-[#d4af37]/10 transition-all duration-500" />
                  </div>

                  {/* Service Info */}
                  <div className="p-6">
                    <h3 className={`text-2xl font-bold mb-1 group-hover:text-[#d4af37] transition-colors duration-300 ${isDark ? "text-white" : "text-black"}`} style={{ fontFamily: "Playfair Display, serif" }}>
                      {service.name}
                    </h3>

                    {/* tagline appears under the name */}
                    <p className={`text-sm mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`} style={{ fontFamily: "Cormorant Garamond, serif" }}>
                      {service.tagline}
                    </p>

                    <div className={`flex items-center justify-between mb-6 pb-4 border-b ${isDark ? "border-zinc-800" : "border-gray-200"}`}>
                      <div>
                        <p className="text-[#d4af37] text-2xl font-bold">{service.price}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>Duration</p>
                        <p className={`font-semibold ${isDark ? "text-white" : "text-black"}`}>{formatDuration(service.duration)}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(service);
                        }}
                        onKeyDown={handleCardKeyDown(service)}
                        className="flex-1 px-4 py-3 bg-transparent border border-[#d4af37] text-[#d4af37] rounded-md hover:bg-[#d4af37] hover:text-black transition-all duration-300 font-semibold"
                        aria-label={`View details for ${service.name}`}
                        type="button"
                      >
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          goToBooking(e);
                        }}
                        className="flex-1 px-4 py-3 bg-[#d4af37] text-black rounded-md hover:bg-[#c19b2e] transition-all duration-300 font-semibold shadow-lg shadow-[#d4af37]/20 hover:shadow-[#d4af37]/40"
                        aria-label={`Book ${service.name}`}
                        type="button"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>

                  {/* Premium glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/5 via-transparent to-[#d4af37]/5" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Bottom CTA Section */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/10 to-transparent" />
        <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? "text-white" : "text-black"}`} style={{ fontFamily: "Playfair Display, serif" }}>
            Ready to Experience Luxury?
          </h2>
          <p className={`text-xl mb-8 ${isDark ? "text-gray-400" : "text-gray-600"}`} style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Book your appointment today and discover the art of premium grooming
          </p>
          <button onClick={(e) => goToBooking(e)} className="px-12 py-5 bg-[#d4af37] text-black rounded-lg hover:bg-[#c19b2e] transition-all duration-300 font-bold text-lg shadow-2xl shadow-[#d4af37]/30 hover:shadow-[#d4af37]/50 hover:scale-105">
            Book Your Appointment
          </button>
        </div>
      </motion.div>

      <Footer />

      {/* Details Modal */}
      {selectedItem && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={modalOverlayVariants}
        >
          {/* overlay */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
            variants={modalOverlayVariants}
          />

          {/* content - constrained height, leaves space at top & bottom, consistent size */}
          <motion.div
            className={`relative z-50 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl ${
              isDark ? "bg-zinc-900 text-white" : "bg-white text-black"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={selectedItem.name || "Service details"}
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            style={{
              // ensure consistent modal height, leave gaps at top/bottom
              minHeight: "56vh",
              maxHeight: "76vh",
            }}
          >
            <div className="md:flex h-full">
              {/* Left: image - make it fill modal height */}
              <div className="md:w-1/2 relative h-60 md:h-auto">
                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-[#d4af37] text-black px-3 py-1 rounded-full font-semibold">{selectedItem.price || ""}</div>
              </div>

              {/* Right: content with scroll if overflow */}
              <div className="md:w-1/2 p-6 md:p-10 overflow-y-auto">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>
                      {selectedItem.name}
                    </h3>

                    {/* show only the short description in modal (description = short_description) */}
                    <p className={`text-sm mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`} style={{ fontFamily: "Cormorant Garamond, serif" }}>
                      {selectedItem.description || ""}
                    </p>
                  </div>

                  <button
                    ref={closeButtonRef}
                    onClick={(e) => {
                      e.stopPropagation();
                      closeModal();
                    }}
                    className="ml-auto p-2 rounded-md bg-transparent text-gray-400 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
                    aria-label="Close details"
                    type="button"
                  >
                    ✕
                  </button>
                </div>

                {/* Keep longDescription but don't show it by default in modal body (reserved for full page) */}
                <div className="prose max-w-none mb-6" style={{ fontFamily: "Cormorant Garamond, serif" }} />

                <div className="flex gap-3">
                  <button
                    onClick={(e) => goToBooking(e)}
                    className="px-5 py-3 bg-[#d4af37] text-black rounded-md font-semibold hover:bg-[#c19b2e] shadow-md"
                  >
                    Book Now
                  </button>
                  <button
                    onClick={(e) => goToFullPage(selectedItem, e)}
                    className="px-5 py-3 border border-[#d4af37] text-[#d4af37] rounded-md font-semibold hover:bg-[#d4af37] hover:text-black transition-colors"
                  >
                    Open Full Page
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Services;