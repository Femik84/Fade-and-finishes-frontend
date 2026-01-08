import type { Artist, Category, Review, ServiceDisplay, BarberDisplay, TestimonialDisplay } from '../utils/type';

// Service images mapping (categories to images from public folder)
const categoryImages: Record<string, string> = {
  'barbing': '/barber.jfif',
  'beard-grooming': '/beard-grooming.jfif',
  'hair-styling': '/hair-styling.jfif',
  'pedicure-manicure': '/pedicure-manicure.jfif',
  'makeup': '/makeup.jfif',
  'skin-care-facials': '/skin-care-facials.jfif',
};

// Service descriptions mapping
const categoryDescriptions: Record<string, string> = {
  'barbing': 'Precision cuts tailored to perfection',
  'beard-grooming': 'Sculpted beards that define your style',
  'hair-styling': 'Intricate styling artistry',
  'pedicure-manicure': 'Manicured elegance at your fingertips',
  'makeup': 'Flawless beauty transformations',
  'skin-care-facials': 'Ultimate relaxation and rejuvenation',
};

// Map categories to service display format
export const mapCategoriesToServices = (categories: Category[]): ServiceDisplay[] => {
  return categories.map(category => ({
    name: category.name,
    desc: categoryDescriptions[category.slug] || 'Premium service experience',
    img: categoryImages[category.slug] || '/default-service.jpg'
  }));
};

// Calculate experience from created_at date
const calculateExperience = (createdAt: string): string => {
  const created = new Date(createdAt);
  const now = new Date();
  const years = now.getFullYear() - created.getFullYear();
  return years > 0 ? `${years} years` : 'New';
};

// Map artists to barber display format
export const mapArtistsToBarbers = (artists: Artist[]): BarberDisplay[] => {
  return artists.map(artist => ({
    name: artist.name,
    specialty: artist.specialties[0]?.name || 'Master Stylist',
    exp: calculateExperience(artist.created_at),
    img: artist.photo
  }));
};

// Map reviews to testimonial display format
export const mapReviewsToTestimonials = (reviews: Review[]): TestimonialDisplay[] => {
  return reviews.slice(0, 6).map(review => ({
    name: review.name,
    text: review.comment,
    rating: review.stars,
    img: review.profile_picture
  }));
};