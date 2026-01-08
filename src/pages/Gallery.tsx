import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeContext } from '../Context/ThemeContext';
import Footer from '../components/Footer';
import { apiGet } from '../utils/constant';
import { getCache, setCache } from '../utils/cache';

const goldColors = {
  primary: '#D4AF37',
  accent: '#D4AF37',
};

interface Specialty {
  id: number;
  name: string;
  description?: string;
}

interface Artist {
  id: number;
  name: string;
  photo?: string;
  specialties?: Specialty[];
  created_at?: string;
  updated_at?: string;
}

interface Category {
  id: number;
  name: string;
  slug?: string;
  created_at?: string;
  updated_at?: string;
}

interface GalleryItem {
  id: number | string;
  name: string;
  category: Category;
  artist: Artist;
  hero_image: string;
  min_price?: string | null;
  max_price?: string | null;
  is_featured?: boolean;
  is_portfolio_grid?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GalleryImage {
  id: number | string;
  src: string;
  category: string;
  price?: string;
  description?: string;
  artist?: string;
  specialties?: Specialty[];
}

/* -------------------------
   UI building blocks
   ------------------------- */

interface LightboxModalProps {
  image: GalleryImage | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}
const LightboxModal: React.FC<LightboxModalProps> = ({ image, onClose, onNext, onPrev }) => {
  const { isDark } = useContext(ThemeContext);
  if (!image) return null;

  const closeBtnClass = isDark
    ? 'absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-[#D4AF37]/60'
    : 'absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 text-black hover:bg-[#D4AF37]/30';
  const navBtnClass = isDark
    ? 'hidden sm:flex absolute z-20 p-2 rounded-full bg-black/40 text-white hover:bg-[#D4AF37]/60'
    : 'hidden sm:flex absolute z-20 p-2 rounded-full bg-white/90 text-black hover:bg-[#D4AF37]/30';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-6">
      <button onClick={onClose} className={closeBtnClass} aria-label="Close lightbox" type="button">
        <X size={20} />
      </button>

      <button onClick={onPrev} className={`${navBtnClass} left-4`} aria-label="Previous image" type="button">
        <ChevronLeft size={28} />
      </button>
      <button onClick={onNext} className={`${navBtnClass} right-4`} aria-label="Next image" type="button">
        <ChevronRight size={28} />
      </button>

      <div className="w-full max-w-[92vw] md:max-w-3xl lg:max-w-225">
        <div className="flex items-center justify-center">
          <img
            src={image.src}
            alt={image.description || image.category}
            className="block max-h-[75vh] w-auto max-w-full object-contain rounded-md mx-auto"
          />
        </div>

        <div className="mt-6" style={{ color: isDark ? '#e5e7eb' : '#111827' }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1 bg-[#D4AF37] text-black text-sm font-semibold rounded-full">
                {image.category}
              </span>
              <span style={{ color: goldColors.primary, fontWeight: 600 }}>{image.price}</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = '/booking';
              }}
              className="group relative px-6 py-3 bg-[#D4AF37] text-black font-semibold rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#D4AF37]/50"
              type="button"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Book Now
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-[#D4AF37] to-[#F4C542] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </div>

          <p className="text-gray-400">Styled by {image.artist}</p>
        </div>
      </div>
    </div>
  );
};

interface GalleryFilterProps {
  categories: string[];
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
}
const GalleryFilter: React.FC<GalleryFilterProps> = ({ categories, activeFilters, onFilterChange }) => {
  const { isDark } = useContext(ThemeContext);

  const toggleFilter = (category: string) => {
    if (category === 'All') {
      onFilterChange(['All']);
      return;
    }

    let newFilters = activeFilters.filter((f) => f !== 'All');
    if (newFilters.includes(category)) {
      newFilters = newFilters.filter((f) => f !== category);
      if (newFilters.length === 0) newFilters = ['All'];
    } else {
      newFilters.push(category);
    }
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-12">
      {categories.map((cat: string) => {
        const isActive = activeFilters.includes(cat);
        const baseClass = isActive
          ? 'text-[#D4AF37]'
          : isDark
          ? 'text-gray-400 hover:text-white'
          : 'text-gray-800 hover:text-black';

        return (
          <button
            key={cat}
            onClick={() => toggleFilter(cat)}
            className={`px-6 py-2 text-sm font-semibold transition-all duration-300 relative ${baseClass}`}
            type="button"
            aria-pressed={isActive}
          >
            {cat}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37] animate-expandWidth" />
            )}
          </button>
        );
      })}
    </div>
  );
};

interface MasonryGalleryProps {
  images: GalleryImage[];
  onImageClick: (img: GalleryImage) => void;
}
const MasonryGallery: React.FC<MasonryGalleryProps> = ({ images, onImageClick }) => {
  return (
    <div className="columns-2 md:columns-2 lg:columns-3 gap-4 space-y-4">
      {images.map((img: GalleryImage, idx: number) => (
        <div
          key={img.id}
          className="break-inside-avoid group cursor-pointer relative overflow-hidden rounded-lg mb-4"
          onClick={() => onImageClick(img)}
          style={{ animationDelay: `${idx * 0.06}s` }}
        >
          <img
            src={img.src}
            alt={img.category}
            className="w-full h-auto transition-all duration-500 group-hover:scale-110 group-hover:brightness-75"
          />
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D4AF37] transition-all duration-300 pointer-events-none" />
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-[#D4AF37] text-black text-xs font-bold rounded-full shadow-lg">
              {img.category}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

interface SquareGridProps {
  images: GalleryImage[];
  onImageClick: (img: GalleryImage) => void;
}
const SquareGrid: React.FC<SquareGridProps> = ({ images, onImageClick }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((img: GalleryImage, idx: number) => (
        <div
          key={img.id}
          className="aspect-square group cursor-pointer relative overflow-hidden rounded-lg"
          onClick={() => onImageClick(img)}
          style={{ animationDelay: `${idx * 0.04}s` }}
        >
          <img
            src={img.src}
            alt={img.category}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-75"
          />
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D4AF37] transition-all duration-300" />
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-[#D4AF37] text-black text-xs font-bold rounded-full shadow-lg">
              {img.category}
            </span>
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <div className="text-white">
              <p className="text-sm font-semibold">{img.artist}</p>
              <p className="text-xs text-[#D4AF37]">{img.price}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface GalleryCarouselProps {
  title: string;
  images: GalleryImage[];
  onImageClick: (img: GalleryImage) => void;
}
const GalleryCarousel: React.FC<GalleryCarouselProps> = ({ title, images, onImageClick }) => {
  const { isDark } = useContext(ThemeContext);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollPosition);
      return () => scrollElement.removeEventListener('scroll', checkScrollPosition);
    }
  }, [images]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const btnClass = isDark
    ? 'inline-flex p-3 bg-white/20 hover:bg-[#D4AF37] text-white rounded-full transition-all shadow-lg'
    : 'inline-flex p-3 bg-black/20 hover:bg-[#D4AF37] text-white rounded-full transition-all shadow-lg';

  return (
    <div className="mb-16 relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-black'}`}>
          {title}
          <span className="text-[#D4AF37]">.</span>
        </h3>
        <div className="flex gap-2">
          {showLeftArrow && (
            <button onClick={() => scroll('left')} className={btnClass} type="button" aria-label={`Scroll ${title} left`}>
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {showRightArrow && (
            <button onClick={() => scroll('right')} className={btnClass} type="button" aria-label={`Scroll ${title} right`}>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-4"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: isDark ? '#D4AF37 #1a1a1a' : '#D4AF37 #e5e5e5'
          }}
        >
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="shrink-0 w-72 h-96 group cursor-pointer relative overflow-hidden rounded-lg"
              onClick={() => onImageClick(img)}
            >
              <img
                src={img.src}
                alt={img.category}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-75"
              />
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D4AF37] transition-all duration-300" />
              <div className="absolute top-3 left-3 flex gap-2 items-center">
                <span className="px-3 py-1 bg-[#D4AF37] text-black text-xs font-bold rounded-full shadow-lg">
                  {img.category}
                </span>
                <span className="px-2 py-1 bg-black/70 text-white text-xs font-bold rounded-full">
                  {idx + 1}/{images.length}
                </span>
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white text-sm font-semibold mb-1">{img.description}</p>
                <p className="text-gray-300 text-xs">{img.artist}</p>
                <p className="text-[#D4AF37] text-sm font-bold mt-1">{img.price}</p>
              </div>
            </div>
          ))}
        </div>

        {images.length > 3 && (
          <div className={`text-center mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            ← Scroll to see all {images.length} items →
          </div>
        )}
      </div>
    </div>
  );
};

/* -------------------------
   GalleryPage Component (with local cache)
   ------------------------- */

// Cache key + TTL (1 hour)
const GALLERY_CACHE_KEY = 'gallery_v1';
const GALLERY_CACHE_TTL = 1000 * 60 * 60;

export default function GalleryPage() {
  const { isDark } = useContext(ThemeContext);
  const [galleryData, setGalleryData] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // fetch gallery items with cache:
  useEffect(() => {
    let mounted = true;

    const loadFromCache = (): boolean => {
      try {
        const cached = getCache(GALLERY_CACHE_KEY) as GalleryItem[] | null;
        if (cached && Array.isArray(cached) && mounted) {
          setGalleryData(cached);
          setLoading(false);
          return true;
        }
        return false;
      } catch (err) {
        // localStorage may be unavailable; silently fail cache
        return false;
      }
    };

    const fetchAndCache = async () => {
      try {
        const data = await apiGet<GalleryItem[]>('galleries/');
        if (!mounted) return;

        setGalleryData(data || []);
        try {
          setCache(GALLERY_CACHE_KEY, data || [], GALLERY_CACHE_TTL);
        } catch (err) {
          // swallow localStorage errors
        }
        setError(null);
      } catch (err) {
        if (!mounted) return;
        // on fetch error try to use cache as fallback
        const cached = getCache(GALLERY_CACHE_KEY) as GalleryItem[] | null;
        if (cached && Array.isArray(cached)) {
          setGalleryData(cached);
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred while loading the gallery.');
        }
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    // attempt to load cache (don't assign to an unused variable)
    loadFromCache();
    // Always attempt a network fetch to refresh cache in background.
    // If there was no cache, user sees loader until fetch completes.
    fetchAndCache();

    return () => {
      mounted = false;
    };
  }, []);

  // map backend GalleryItem -> GalleryImage
  const mapItemToImage = (item: GalleryItem): GalleryImage => {
    const min = item.min_price ?? '';
    const max = item.max_price ?? '';
    const price =
      min && max && min !== max ? `$${min} - $${max}` : min ? `$${min}` : max ? `$${max}` : undefined;

    return {
      id: item.id,
      src: item.hero_image,
      category: item.category?.name ?? 'Uncategorized',
      price,
      description: item.name,
      artist: item.artist?.name ?? '',
      specialties: item.artist?.specialties ?? [],
    };
  };

  // derived images and categories
  const images = galleryData.map(mapItemToImage);
  const categories = ['All', ...Array.from(new Set(images.map((i) => i.category)))];

  const [activeFilters, setActiveFilters] = useState<string[]>(['All']);

  useEffect(() => {
    setActiveFilters((prev) => {
      if (prev.includes('All')) return ['All'];
      const valid = prev.filter((f) => f === 'All' || categories.includes(f));
      return valid.length ? valid : ['All'];
    });
  }, [categories.length]);

  const filteredImages = activeFilters.includes('All')
    ? images
    : images.filter((img) => activeFilters.includes(img.category));

  // grouping by category for carousel section
  const groupedByCategory = galleryData.reduce<Record<string, { categoryInfo: Category; items: GalleryItem[] }>>(
    (acc, item) => {
      const categoryName = item.category?.name ?? 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = { categoryInfo: item.category, items: [] };
      }
      acc[categoryName].items.push(item);
      return acc;
    },
    {}
  );

  // modal navigation
  const handleImageClick = (img: GalleryImage) => setSelectedImage(img);

  const handleNext = () => {
    if (!selectedImage || filteredImages.length === 0) return;
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage.id);
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
  };

  const handlePrev = () => {
    if (!selectedImage || filteredImages.length === 0) return;
    const currentIndex = filteredImages.findIndex((img) => img.id === selectedImage.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[prevIndex]);
  };

  return (
    <div className={`${isDark ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen transition-colors duration-500`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Cormorant+Garamond:wght@300;400;600;700&display=swap');
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes expandWidth { from { width: 0 } to { width: 100% } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-expandWidth { animation: expandWidth 0.3s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Hero Section - Matching Service Hero Style */}
      <div className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={isDark ? "/herodark.jfif" : "/herolight.jfif"}
            alt="Luxury Gallery"
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-4"
          >
            <div className="w-20 h-1 bg-[#d4af37] mx-auto mb-6" />
          </motion.div>

          <h1
            className="text-6xl md:text-7xl font-bold mb-6 tracking-tight text-white"
            style={{ fontFamily: "Playfair Display, serif" }}
          >
            Our <span style={{ color: goldColors.primary }}>Gallery</span>
          </h1>

          <p
            className="text-xl md:text-2xl max-w-2xl font-light text-gray-300"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            Experience the pinnacle of luxury grooming where artistry meets excellence
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20">
        <GalleryFilter categories={categories} activeFilters={activeFilters} onFilterChange={setActiveFilters} />

        {loading ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className={isDark ? "text-gray-300" : "text-gray-700"}>Loading gallery...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            {/* Featured Works - Masonry */}
            <section className="mb-24">
              <div className="text-center mb-16">
                <h2
                  className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Featured Works
                </h2>
                <div className="w-24 h-1 bg-[#d4af37] mx-auto" />
              </div>
              <MasonryGallery images={filteredImages} onImageClick={handleImageClick} />
            </section>

            {/* Portfolio Grid - Shows all randomly when "All" is selected */}
            <section className="mb-24">
              <div className="text-center mb-16">
                <h2
                  className={`text-4xl md:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}
                  style={{ fontFamily: 'Playfair Display, serif' }}
                >
                  Portfolio Grid
                </h2>
                <div className="w-24 h-1 bg-[#d4af37] mx-auto" />
              </div>
              <SquareGrid images={filteredImages} onImageClick={handleImageClick} />
            </section>

            {/* Browse by Category: use original grouped logic but show salon-style carousels */}
            <section>
              <h2 className="text-3xl font-bold mb-12 text-center">
                Browse by <span className="text-[#D4AF37]">Category</span>
              </h2>

              {Object.entries(groupedByCategory).map(([categoryName, { categoryInfo, items }]) => {
                const categoryImages = items.map(mapItemToImage);
                if (categoryImages.length === 0) return null;
                return (
                  <div key={categoryInfo.id} className="mb-8">
                    <GalleryCarousel
                      title={`${categoryName} (${categoryImages.length})`}
                      images={categoryImages}
                      onImageClick={handleImageClick}
                    />
                  </div>
                );
              })}
            </section>
          </>
        )}
      </div>

      {/* Lightbox modal */}
      <LightboxModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onNext={handleNext}
        onPrev={handlePrev}
      />

      <Footer />
    </div>
  );
}