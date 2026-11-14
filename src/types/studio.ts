export type AspectRatioType = 'portrait' | 'landscape' | 'square';

export type InquiryStatus =
  | 'new'
  | 'contacted'
  | 'confirmed'
  | 'completed'
  | 'reviewed'
  | 'booked'
  | 'archived';

export type AdminRole = 'super_admin' | 'editor' | 'moderator';

export type FontPreset = 'editorial-serif' | 'modern-sans' | 'classic-monograph';

export interface NavLinkItem {
  id: string;
  label: string;
  target: string; // e.g. '#about', '#portfolio', '/p/print-editions', or 'https://...'
  visible: boolean;
  location: 'header' | 'footer' | 'both';
}

export type HomepageSectionKey =
  | 'hero'
  | 'about'
  | 'portfolio'
  | 'projects'
  | 'services'
  | 'testimonials'
  | 'contact'
  | 'custom';

export interface HomepageSectionConfig {
  id: string;
  key: HomepageSectionKey;
  label: string;
  visible: boolean;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  body?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
  backgroundTone?: 'light' | 'dark' | 'warm';
}

export interface SiteSettings {
  id: string;
  brandName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontPreset?: FontPreset;
  loadingScreenEnabled?: boolean;
  loadingScreenText?: string;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  footerTagline?: string;
  copyrightText?: string;
  headerCtaText?: string;
  headerCtaLink?: string;
  customHeadScript?: string;
  navLinks?: NavLinkItem[];
  homepageSections?: HomepageSectionConfig[];

  heroHeadline: string;
  heroSubheadline: string;
  heroPrimaryCtaText?: string;
  heroPrimaryCtaLink?: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaLink?: string;
  heroBanners: string[];

  aboutEyebrow?: string;
  aboutHeading: string;
  aboutStory: string;
  aboutPhilosophy?: string;
  aboutImageUrl?: string;
  photographerNames?: string;
  photographerBio?: string;

  contactHeading?: string;
  contactDescription?: string;
  contactEmail: string;
  contactPhone?: string;
  whatsappNumber?: string;
  studioAddress?: string;
  googleMapsUrl?: string;

  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  behanceUrl?: string;
  pinterestUrl?: string;

  seoTitle: string;
  seoDescription: string;
  seoKeywords?: string;
  seoOgTitle?: string;
  seoOgDescription?: string;
  seoOgImage?: string;
  seoCanonicalUrl?: string;
  seoNoIndex?: boolean;
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

export interface Album {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverImageUrl?: string;
  categoryId?: string;
  published: boolean;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  altText?: string;
  categoryId: string;
  categoryName: string;
  albumId?: string;
  imageUrl: string;
  aspectRatio: AspectRatioType;
  location?: string;
  cameraSpecs?: string;
  year?: string;
  featured: boolean;
  published?: boolean;
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
  published?: boolean;
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
  imageUrl?: string;
  iconName?: string;
  features?: string[];
  enabled?: boolean;
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
  featured?: boolean;
  published?: boolean;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type PageBlockType = 'hero' | 'text' | 'split' | 'gallery' | 'cta';

export interface PageSectionBlock {
  id: string;
  type: PageBlockType;
  heading: string;
  subheading?: string;
  body?: string;
  imageUrl?: string;
  galleryUrls?: string[];
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  sections: PageSectionBlock[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  mediaType: 'image' | 'video';
  folder: string;
  altText?: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
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
  role?: AdminRole;
  addedBy?: string;
  createdAt?: unknown;
}

export interface ActivityLog {
  id: string;
  actorEmail: string;
  action: string;
  target: string;
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
