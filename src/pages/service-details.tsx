import { useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Star, Clock, Award, ArrowLeft,  Check } from "lucide-react";
import { ThemeContext } from "../Context/ThemeContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { apiGet } from "../utils/constant";
import { defaultDetailedDescription } from "../Data/detailedTemplates";
import { useNavigate, useLocation } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const ServiceDetails = () => {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentService, setCurrentService] = useState<any | null>(null);
  const [relatedServices, setRelatedServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const overviewRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Helper: format duration (mins -> "50 mins", >=60 -> "1 hr 15 mins")
  const formatDuration = (d?: string | number) => {
    if (d === undefined || d === null || d === "") return "";
    const numeric = Number(String(d).replace(/[^\d.]/g, ""));
    if (Number.isNaN(numeric)) return String(d);
    const minutes = Math.floor(numeric);
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const hourLabel = hours === 1 ? "hr" : "hrs";
    return mins === 0 ? `${hours} ${hourLabel}` : `${hours} ${hourLabel} ${mins} mins`;
  };

  // Helper: format ISO date to readable form e.g. "Jan 5, 2026"
  const formatDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    // prefer `slug`, fallback to `id`
    const slugParam = urlParams.get("slug") || urlParams.get("id");

    async function fetchByDetailPath(slugOrId: string) {
      try {
        const detail = await apiGet<any>(`services/${encodeURIComponent(slugOrId)}/`);
        return detail;
      } catch {
        return null;
      }
    }

    async function fetchByListFilter(slugOrId: string) {
      try {
        const list = await apiGet<any>(`services/?slug=${encodeURIComponent(slugOrId)}`);
        if (Array.isArray(list) && list.length > 0) return list[0];
        if (list && Array.isArray(list.results) && list.results.length > 0) return list.results[0];
        if (list && !Array.isArray(list)) return list;
        return null;
      } catch {
        return null;
      }
    }

    // Only fetch related services that are in the same category as the current service,
    // excluding the current service itself.
    async function loadRelatedServices(category: any, excludeId: number | string) {
      try {
        if (!category) {
          setRelatedServices([]);
          return;
        }

        // Prefer querying by category id (common backend pattern).
        // Try a few query syntaxes to increase compatibility.
        const tries: string[] = [];
        if (category.id) tries.push(`services/?category=${encodeURIComponent(String(category.id))}`);
        if (category.slug) tries.push(`services/?category__slug=${encodeURIComponent(category.slug)}`);
        if (category.slug) tries.push(`services/?category=${encodeURIComponent(category.slug)}`);
        if (category.name) tries.push(`services/?category_name=${encodeURIComponent(category.name)}`);

        let list: any = null;
        for (const q of tries) {
          try {
            list = await apiGet<any>(q);
            // stop if list looks like useful data
            if (list && ((Array.isArray(list) && list.length > 0) || (Array.isArray(list.results) && list.results.length > 0))) break;
          } catch (err) {
            // continue trying other queries
          }
        }

        let items: any[] = [];
        if (Array.isArray(list)) items = list;
        else if (list && Array.isArray(list.results)) items = list.results;
        else if (list && typeof list === "object") items = [list];

        const mapped = (items || [])
          .filter((s: any) => String(s.id) !== String(excludeId)) // exclude current
          .map((s: any) => ({
            id: s.id,
            slug: s.slug,
            name: s.name,
            price: s.price ? `$${s.price}` : s.price || "",
            image: s.hero_image || (Array.isArray(s.gallery) && s.gallery[0] && (s.gallery[0].image || s.gallery[0])) || "",
          }));

        // Keep only remaining services (if none, relatedServices becomes empty)
        setRelatedServices(mapped);
      } catch (err) {
        console.error("Failed to load related services:", err);
        setRelatedServices([]);
      }
    }

    async function loadServiceBySlug(slug: string) {
      try {
        setIsLoading(true);

        // Try detail path first
        let data = await fetchByDetailPath(slug);
        // If not found, try list filter
        if (!data) data = await fetchByListFilter(slug);

        // fallback to numeric id fetch if slug is numeric
        if (!data && /^\d+$/.test(slug)) {
          try {
            data = await apiGet<any>(`services/${slug}/`);
          } catch {
            data = null;
          }
        }

        if (!data) {
          setCurrentService({
            id: slug,
            name: "Service Not Found",
            heroImage: "",
            gallery: [],
            tagline: "",
            shortDescription: "",
            longDescription: "",
            price: "",
            duration: "",
            difficulty: "",
            category: null,
            addOns: [],
            reviews: [],
            detailedDescription: defaultDetailedDescription,
          });
          setRelatedServices([]);
          setIsLoading(false);
          return;
        }

        // Normalize fields; keep category object for related lookup
        const heroImage =
          data.hero_image ||
          (data.gallery && data.gallery[0] && (data.gallery[0].image || data.gallery[0])) ||
          "";
        const gallery = Array.isArray(data.gallery)
          ? data.gallery.map((g: any) => g.image || g)
          : Array.isArray(data.gallery)
          ? data.gallery
          : [];
        const reviews =
          Array.isArray(data.reviews)
            ? data.reviews.map((r: any) => ({
                id: r.id,
                name: r.name,
                rating: r.stars ?? r.rating ?? 5,
                comment: r.comment,
                // keep raw ISO here; format on render
                date: r.date,
                avatar: r.profile_picture || r.avatar || "",
              }))
            : [];

        const merged = {
          id: data.id,
          name: data.name,
          heroImage,
          gallery,
          tagline: data.tagline || "",
          shortDescription: data.short_description || "",
          longDescription: data.long_description || "",
          price: data.price ? `$${data.price}` : data.price || "",
          duration: data.duration || "",
          difficulty: data.difficulty_level || data.difficulty || "",
          category: data.category || null, // full category object preferred
          addOns: data.addOns || data.add_ons || data.addons || [],
          reviews,
          detailedDescription: data.detailedDescription || data.detailed_description || defaultDetailedDescription,
        };

        setCurrentService(merged);

        // fetch related services by category (exclude current)
        await loadRelatedServices(data.category || null, data.id);
      } catch (err) {
        console.error("Failed to fetch service:", err);
        setCurrentService({
          id: slug,
          name: "Service",
          heroImage: "",
          gallery: [],
          tagline: "",
          shortDescription: "",
          longDescription: "",
          price: "",
          duration: "",
          difficulty: "",
          category: null,
          addOns: [],
          reviews: [],
          detailedDescription: defaultDetailedDescription,
        });
        setRelatedServices([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (slugParam) {
      loadServiceBySlug(slugParam);
    } else {
      setCurrentService({
        id: "unknown",
        name: "Service",
        heroImage: "",
        gallery: [],
        tagline: "",
        shortDescription: "",
        longDescription: "",
        price: "",
        duration: "",
        difficulty: "",
        category: null,
        addOns: [],
        reviews: [],
        detailedDescription: defaultDetailedDescription,
      });
      setRelatedServices([]);
      setIsLoading(false);
    }
    // Re-run whenever the location.search changes so the component responds to navigate calls that only update query params.
  }, [navigate, location.search]);

  useEffect(() => {
    if (isLoading) return;

    if (heroRef.current) {
      gsap.to(heroRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }

    if (overviewRef.current) {
      gsap.from(overviewRef.current.children, {
        opacity: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: overviewRef.current,
          start: "top 80%",
          end: "bottom 20%",
        },
      });
    }

    if (descriptionRef.current) {
      const descCards = descriptionRef.current.querySelectorAll(".desc-card");
      if (descCards.length > 0) {
        gsap.from(descCards, {
          opacity: 0,
          y: 60,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: descriptionRef.current,
            start: "top 70%",
            toggleActions: "play none none none",
          },
        });
      }
    }

    if (galleryRef.current) {
      const galleryItems = galleryRef.current.querySelectorAll(".gallery-item");
      if (galleryItems.length > 0) {
        gsap.from(galleryItems, {
          opacity: 0,
          scale: 0.8,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: galleryRef.current,
            start: "top 70%",
            toggleActions: "play none none none",
          },
        });
      }
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [isLoading]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  if (isLoading) {
    return (
      <div className={`${isDark ? "bg-black text-white" : "bg-white text-black"} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={`${isDark ? "text-gray-300" : "text-gray-700"}`}>Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!currentService) return null;

  // hero fallback to public images if heroImage missing
  const heroSrc = currentService.heroImage || (isDark ? "/herodark.jfif" : "/herolight.jfif");

  return (
    <div className={`${isDark ? "bg-black text-white" : "bg-white text-black"} overflow-hidden transition-colors duration-500`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:wght@300;400;600;700&display=swap');`}</style>

      <Header />

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <div
          ref={heroRef}
          className="absolute inset-0 w-full h-[120%]"
          style={{
            backgroundImage: `url(${heroSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/50 to-black" />
          <div className="absolute inset-0 bg-linear-to-r from-[#d4af37]/20 to-transparent" />
        </div>

        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3 }} className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} className="mb-4">
            <span className="inline-block px-6 py-2 border border-[#d4af37] text-[#d4af37] text-sm tracking-widest uppercase">
              {currentService.category?.name || currentService.category || ""}
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.7 }} className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]" style={{ fontFamily: "Playfair Display, serif" }}>
            {currentService.name}
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.9 }} className={`text-xl md:text-2xl max-w-2xl mb-12 italic ${isDark ? "text-gray-300" : "text-gray-200"}`} style={{ fontFamily: "Cormorant Garamond, serif" }}>
            {currentService.tagline}
          </motion.p>

          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 1.1 }}>
            <button onClick={() => { window.scrollTo({ top: window.innerHeight, behavior: "smooth" }); }} className="group relative px-10 py-4 bg-[#d4af37] text-black font-semibold text-lg overflow-hidden transition-all duration-300 hover:bg-[#f0c847] hover:scale-105">
              <span className="relative z-10">Scroll to Explore</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </button>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-20 md:bottom-10 left-1/2 transform -translate-x-1/2 z-10">
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-6 h-10 border-2 border-[#d4af37] rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-[#d4af37] rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Overview Section */}
      <section ref={overviewRef} className={`py-20 px-6 ${isDark ? "bg-linear-to-b from-black to-zinc-900" : "bg-linear-to-b from-white to-gray-100"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
                Service Overview
              </h2>

              {/* Use shortDescription here */}
              <p className={`text-lg leading-relaxed mb-8 ${isDark ? "text-gray-300" : "text-gray-700"}`} style={{ fontFamily: "Cormorant Garamond, serif" }}>
                {currentService.shortDescription}
              </p>

              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className={`text-center p-4 rounded-lg border ${isDark ? "bg-zinc-800/50 border-zinc-700" : "bg-gray-50 border-gray-200"}`}>
                  <div className="text-[#d4af37] mb-2 flex justify-center">
                    <Clock size={28} />
                  </div>
                  <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Duration</div>
                  <div className="font-semibold">{formatDuration(currentService.duration)}</div>
                </div>

                <div className={`text-center p-4 rounded-lg border ${isDark ? "bg-zinc-800/50 border-zinc-700" : "bg-gray-50 border-gray-200"}`}>
                  <div className="text-[#d4af37] mb-2 flex justify-center">
                    <Award size={28} />
                  </div>
                  <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Level</div>
                  <div className="font-semibold text-xs">{currentService.difficulty}</div>
                </div>

                <div className={`text-center p-4 rounded-lg border ${isDark ? "bg-zinc-800/50 border-zinc-700" : "bg-gray-50 border-gray-200"}`}>
                  <div className="text-[#d4af37] mb-2 flex justify-center text-3xl font-bold">$</div>
                  <div className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Price</div>
                  <div className="font-semibold">{currentService.price}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => (window.location.href = "/booking")} className="flex-1 group relative px-8 py-4 bg-[#d4af37] text-black font-semibold text-lg overflow-hidden transition-all duration-300 hover:bg-[#f0c847] hover:shadow-lg hover:shadow-[#d4af37]/50 rounded-lg">
                  <span className="relative z-10">Book Now</span>
                </button>

                <button onClick={() => (window.location.href = "/services")} className="flex-1 px-8 py-4 border-2 border-[#d4af37] text-[#d4af37] font-semibold text-lg hover:bg-[#d4af37] hover:text-black transition-all duration-300 flex items-center justify-center gap-2 rounded-lg">
                  <ArrowLeft size={20} />
                  Back to Services
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-linear-to-r from-[#d4af37]/20 to-transparent blur-xl" />
              <img src={currentService.gallery[0] || heroSrc} alt={currentService.name} className="relative rounded-lg shadow-2xl w-full h-125 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Description */}
      <section ref={descriptionRef} className={`py-20 px-6 ${isDark ? "bg-zinc-900" : "bg-gray-50"}`}>
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={containerVariants}>
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-4 text-center" style={{ fontFamily: "Playfair Display, serif" }}>
              The Complete Experience
            </motion.h2>
            <motion.p variants={itemVariants} className={`text-center max-w-3xl mx-auto mb-16 ${isDark ? "text-gray-400" : "text-gray-600"}`} style={{ fontFamily: "Cormorant Garamond, serif" }}>
              {currentService.detailedDescription.overview}
            </motion.p>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className={`desc-card p-8 rounded-lg border transition-all duration-300 ${isDark ? "bg-black/50 border-zinc-800 hover:border-[#d4af37]/50" : "bg-white border-gray-200 hover:border-[#d4af37]/50 shadow-md"}`}>
                <h3 className="text-2xl font-bold mb-4 text-[#d4af37]" style={{ fontFamily: "Playfair Display, serif" }}>
                  What's Included
                </h3>
                <ul className="space-y-3">
                  {currentService.detailedDescription.includes.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="text-[#d4af37] mt-1 shrink-0" size={20} />
                      <span className={isDark ? "text-gray-300" : "text-gray-700"}>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }} className={`desc-card p-8 rounded-lg border transition-all duration-300 ${isDark ? "bg-black/50 border-zinc-800 hover:border-[#d4af37]/50" : "bg-white border-gray-200 hover:border-[#d4af37]/50 shadow-md"}`}>
                <h3 className="text-2xl font-bold mb-4 text-[#d4af37]" style={{ fontFamily: "Playfair Display, serif" }}>
                  Your Journey
                </h3>
                <ol className="space-y-3">
                  {/* Use short description in "Your Journey" per request */}
                  <li className="flex items-start gap-3">
                    <span className="text-[#d4af37] font-bold mt-1 shrink-0">•</span>
                    <span className={isDark ? "text-gray-300" : "text-gray-700"}>{currentService.shortDescription}</span>
                  </li>
                </ol>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.4 }} className={`desc-card p-8 rounded-lg border transition-all duration-300 ${isDark ? "bg-black/50 border-zinc-800 hover:border-[#d4af37]/50" : "bg-white border-gray-200 hover:border-[#d4af37]/50 shadow-md"}`}>
                <h3 className="text-2xl font-bold mb-4 text-[#d4af37]" style={{ fontFamily: "Playfair Display, serif" }}>
                  Benefits
                </h3>
                <ul className="space-y-3">
                  {currentService.detailedDescription.benefits.map((benefit: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <Star className="text-[#d4af37] mt-1 shrink-0" size={20} />
                      <span className={isDark ? "text-gray-300" : "text-gray-700"}>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5 }} className={`desc-card p-8 rounded-lg border transition-all duration-300 ${isDark ? "bg-black/50 border-zinc-800 hover:border-[#d4af37]/50" : "bg-white border-gray-200 hover:border-[#d4af37]/50 shadow-md"}`}>
                <h3 className="text-2xl font-bold mb-4 text-[#d4af37]" style={{ fontFamily: "Playfair Display, serif" }}>
                  What to Expect
                </h3>
                <p className={`leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`} style={{ fontFamily: "Cormorant Garamond, serif" }}>
                  {currentService.shortDescription}
                </p>
              </motion.div>
            </div>

            {/* Related services -> Enhance Your Experience */}
            <div className="mb-12">
              <h3 className="text-3xl font-bold mb-4 text-center" style={{ fontFamily: "Playfair Display, serif", color: "#d4af37" }}>
                Enhance Your Experience
              </h3>
              <p className={`text-center mb-8 ${isDark ? "text-gray-400" : "text-gray-600"}`} style={{ fontFamily: "Cormorant Garamond, serif" }}>
                Remaining services in this category
              </p>

              <div className="grid gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {relatedServices.length === 0 && <p className={isDark ? "text-gray-300" : "text-gray-700"}>No related services found.</p>}
                {relatedServices.slice(0, 3).map((s) => (
                  <div key={s.id} className={`p-6 rounded-lg border transition-all duration-300 flex flex-col justify-between ${isDark ? "bg-black/50 border-zinc-800 hover:border-[#d4af37]" : "bg-white border-gray-200 hover:border-[#d4af37] shadow-md"}`}>
                    <div>
                      <h4 className="text-xl font-bold mb-2" style={{ fontFamily: "Playfair Display, serif" }}>{s.name}</h4>
                      <p className="text-[#d4af37] font-bold text-lg mb-4">{s.price}</p>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          const param = s.slug ? `slug=${encodeURIComponent(s.slug)}` : `id=${encodeURIComponent(String(s.id))}`;
                          // navigate to the same route with updated query string; the component listens to location.search so it will fetch the new service
                          navigate(`/service-details?${param}`);
                          // ensure scroll to top for a better UX
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="px-4 py-2 rounded-full border-2 border-[#d4af37] text-[#d4af37] font-semibold hover:bg-[#d4af37] hover:text-black transition-colors shadow-sm"
                      >
                        View Details
                      </button>

                      <button
                        onClick={() => navigate("/booking")}
                        className="px-4 py-2 rounded-full bg-linear-to-r from-[#d4af37] to-[#f0c847] text-black font-semibold hover:opacity-95 transition-all shadow-lg"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section ref={galleryRef} className={`py-20 px-6 ${isDark ? "bg-black" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center" style={{ fontFamily: "Playfair Display, serif" }}>
            Gallery
          </h2>
          <p className={`text-center mb-16 ${isDark ? "text-gray-400" : "text-gray-600"}`} style={{ fontFamily: "Cormorant Garamond, serif" }}>
            See the artistry and precision in every detail
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentService.gallery.map((image: string, index: number) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="gallery-item relative overflow-hidden rounded-lg group cursor-pointer h-72"
                onClick={() => {
                  // navigate to the gallery page. include service and index in query in case the gallery page wants to focus an image
                  const params = new URLSearchParams();
                  if (currentService?.id) params.set("service", String(currentService.id));
                  params.set("index", String(index));
                  navigate(`/gallery?${params.toString()}`);
                }}
              >
                <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className={`py-20 px-6 ${isDark ? "bg-black" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center" style={{ fontFamily: "Playfair Display, serif" }}>
            Client Reviews
          </h2>
          <p className={`text-center mb-16 ${isDark ? "text-gray-400" : "text-gray-600"}`} style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Hear from those who've experienced excellence
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {currentService.reviews.map((review: any, index: number) => (
              <motion.div key={review.id || index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ scale: 1.02 }} className={`p-8 rounded-lg border transition-all duration-300 ${isDark ? "bg-zinc-900 border-zinc-800 hover:border-[#d4af37]/50" : "bg-gray-50 border-gray-200 hover:border-[#d4af37]/50 shadow-md"}`}>
                <div className="flex items-center gap-4 mb-4">
                  <img src={review.avatar} alt={review.name} className="w-14 h-14 rounded-full object-cover border-2 border-[#d4af37]" />
                  <div>
                    <h4 className="font-bold">{review.name}</h4>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{formatDate(review.date)}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating || 5)].map((_, i) => (
                    <Star key={i} size={18} className="fill-[#d4af37] text-[#d4af37]" />
                  ))}
                </div>

                <p className={`leading-relaxed italic ${isDark ? "text-gray-300" : "text-gray-700"}`} style={{ fontFamily: "Cormorant Garamond, serif" }}>
                  "{review.comment}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`relative py-32 px-6 overflow-hidden ${isDark ? "bg-linear-to-r from-black via-zinc-900 to-black" : "bg-linear-to-r from-gray-100 via-white to-gray-100"}`}>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNkNGFmMzciIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDEzNGgxMnYxMkgzNnptMjQgMGgxMnYxMkg2MHptMCAyNGgxMnYxMkg2MHptMCAyNGgxMnYxMkg2MHptMC0xMmgxMnYxMkg2MHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6" style={{ fontFamily: "Playfair Display, serif" }}>
            Ready for a Premium
            <span className="block text-[#d4af37]">Grooming Experience?</span>
          </h2>
          <p className={`text-xl max-w-2xl mx-auto mb-12 ${isDark ? "text-gray-300" : "text-gray-700"}`} style={{ fontFamily: "Cormorant Garamond, serif" }}>
            Book your appointment today and discover the difference that true craftsmanship makes
          </p>

          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => (window.location.href = "/booking")} className="group relative px-16 py-5 bg-[#d4af37] text-black font-bold text-xl overflow-hidden shadow-2xl shadow-[#d4af37]/30 rounded-xl">
            <span className="relative z-10">Book Your Appointment</span>
          </motion.button>

          <p className={`mt-8 ${isDark ? "text-gray-400" : "text-gray-600"}`}>Or call us at <span className="text-[#d4af37] font-semibold">(555) 123-4567</span></p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default ServiceDetails;