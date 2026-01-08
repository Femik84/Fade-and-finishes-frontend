// API Response Types
export interface Specialty {
  id: number;
  name: string;
  description: string;
}

export interface Artist {
  id: number;
  name: string;
  photo: string;
  specialties: Specialty[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  services: number[];
  name: string;
  date: string;
  stars: number;
  comment: string;
  profile_picture: string;
}

// Frontend Display Types (mapped from backend)
export interface ServiceDisplay {
  name: string;
  desc: string;
  img: string;
}

export interface BarberDisplay {
  name: string;
  specialty: string;
  exp: string;
  img: string;
}

export interface TestimonialDisplay {
  name: string;
  text: string;
  rating: number;
  img: string;
}