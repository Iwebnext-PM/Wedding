export type AspectRatioType = 'portrait' | 'landscape' | 'square';

export type InquiryStatus = 'new' | 'reviewed' | 'booked' | 'archived';

export interface SiteSettings {
  id: string;
  brandName: string;
  logoUrl?: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroBanners: string[];
  aboutEyebrow?: string;
  aboutHeading: string;
  aboutStory: string;
  aboutPhilosophy?: string;
  aboutImageUrl?: string;
  photographerNames?: string;
  photographerBio?: string;
  contactEmail: string;
  contactPhone?: string;
  studioAddress?: string;
  instagramUrl?: string;
  behanceUrl?: string;
  pinterestUrl?: string;
  seoTitle: string;
  seoDescription: string;
  seoOgImage?: string;
  updatedAt?: unknown;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PortfolioItem {
  id: string;
  title: string;
  categoryId: string;
  categoryName: string;
  imageUrl: string;
  aspectRatio: AspectRatioType;
  location?: string;
  cameraSpecs?: string;
  year?: string;
  featured: boolean;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  categoryName: string;
  location: string;
  dateLabel?: string;
  clientName?: string;
  summary: string;
  editorialNotes?: string;
  coverImageUrl: string;
  galleryImages: string[];
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  deliverables?: string;
  startingPrice?: string;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientRole: string;
  quote: string;
  rating: number;
  avatarUrl?: string;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  serviceName: string;
  location: string;
  message: string;
  status: InquiryStatus;
  adminNotes?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName?: string;
  addedBy?: string;
  createdAt?: unknown;
}

/**
 * Volumetric & structural constraints mirrored verbatim from firebase-blueprint.json
 */
export const BLUEPRINT_LIMITS = {
  ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
  SLUG_PATTERN: /^[a-z0-9-]+$/,
  MAX_IMAGE_CHARS: 900000,
  MAX_HERO_BANNERS: 6,
  MAX_PROJECT_GALLERY: 8,
  NAME_MAX: 100,
  EMAIL_MAX: 160,
  PHONE_MAX: 40,
  DATE_MAX: 40,
  SERVICE_MAX: 120,
  LOCATION_MAX: 160,
  MESSAGE_MAX: 2000,
} as const;
