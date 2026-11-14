import heroWeddingImg from '../assets/images/hero_wedding_editorial_1794684728571.jpg';
import heroFashionImg from '../assets/images/hero_fashion_atelier_1794684728677.jpg';
import aboutTwinsImg from '../assets/images/about_twins_studio_1794684729335.jpg';
import weddingVeilImg from '../assets/images/portfolio_wedding_veil_1794684729399.jpg';
import preweddingCliffsImg from '../assets/images/portfolio_prewedding_cliffs_1794684731011.jpg';
import portraitChiaroscuroImg from '../assets/images/portfolio_portrait_chiaroscuro_1794684731004.jpg';
import fashionMonolithImg from '../assets/images/portfolio_fashion_monolith_1794684731360.jpg';
import eventCandlelightImg from '../assets/images/portfolio_event_candlelight_1794684731185.jpg';
import lifestyleMorningImg from '../assets/images/portfolio_lifestyle_morning_1794684731924.jpg';
import natureNordicImg from '../assets/images/portfolio_nature_nordic_1794684733462.jpg';
import commercialFlaconImg from '../assets/images/portfolio_commercial_flacon_1794684732528.jpg';
import clientAvatarImg from '../assets/images/client_avatar_editorial_1794684733207.jpg';

import type {
  Category,
  PortfolioItem,
  Project,
  Service,
  SiteSettings,
  Testimonial,
} from '../types/studio';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: 'studio',
  brandName: 'TWINS',
  logoUrl: '',
  heroHeadline: 'CAPTURING MOMENTS. CREATING MEMORIES.',
  heroSubheadline: 'Every photograph tells a story. Let us capture yours.',
  heroBanners: [
    'https://eutjbha52p9qjdgo.public.blob.vercel-storage.com/Create_video_for_wedding_studio_c3dfa273.mp4',
  ],
  aboutEyebrow: 'The Studio',
  aboutHeading: 'Two perspectives, one shared visual language.',
  aboutStory:
    'Founded by twin directors Clara and Elena Vance, TWINS is an international photography and visual storytelling house. Working between Milan, Paris, and New York, we approach every commission with the patience of analog cinema and the precision of architectural editorial photography.',
  aboutPhilosophy:
    'We believe enduring images are never forced. By shooting simultaneously from two complementary vantage points—one intimate and human, the other architectural and atmospheric—we preserve both the quiet gesture and the grand stillness surrounding it.',
  aboutImageUrl: aboutTwinsImg,
  photographerNames: 'Clara & Elena Vance — Co-Founders & Principal Photographers',
  photographerBio:
    'Trained in fine-art darkroom printing and editorial cinematography, Clara and Elena bring twelve years of international commissions across Europe, North America, and Japan.',
  contactEmail: 'atelier@twins-studio.com',
  contactPhone: '+39 02 9475 8120',
  studioAddress: 'Via Solferino 18, Brera, 20121 Milano MI, Italy',
  instagramUrl: 'https://instagram.com',
  behanceUrl: 'https://behance.net',
  pinterestUrl: 'https://pinterest.com',
  seoTitle: 'TWINS — Luxury Photography & Visual Storytelling Studio',
  seoDescription:
    'Every photograph tells a story. Explore TWINS luxury photography portfolio across weddings, editorial fashion, portraits, and commercial commissions.',
  seoOgImage: heroWeddingImg,
};

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-wedding',
    name: 'Wedding Photography',
    slug: 'wedding-photography',
    description: 'Timeless destination celebrations documented on medium-format digital and 35mm film.',
    order: 1,
  },
  {
    id: 'cat-prewedding',
    name: 'Pre-Wedding Photography',
    slug: 'pre-wedding-photography',
    description: 'Atmospheric engagement and couple monographs in iconic architectural and natural settings.',
    order: 2,
  },
  {
    id: 'cat-portrait',
    name: 'Portrait Photography',
    slug: 'portrait-photography',
    description: 'Sculpted natural-light character studies and intimate editorial portraiture.',
    order: 3,
  },
  {
    id: 'cat-fashion',
    name: 'Fashion Photography',
    slug: 'fashion-photography',
    description: 'High-contrast lookbooks, seasonal campaigns, and sculptural runway editorials.',
    order: 4,
  },
  {
    id: 'cat-event',
    name: 'Event Photography',
    slug: 'event-photography',
    description: 'Discreet documentary coverage for black-tie galas, private salons, and cultural launches.',
    order: 5,
  },
  {
    id: 'cat-lifestyle',
    name: 'Lifestyle Photography',
    slug: 'lifestyle-photography',
    description: 'Warm tactile storytelling for hospitality spaces, ateliers, and modern living.',
    order: 6,
  },
  {
    id: 'cat-nature-travel',
    name: 'Nature & Travel Photography',
    slug: 'nature-travel-photography',
    description: 'Quiet fine-art landscapes and poetic visual journals from remote horizons.',
    order: 7,
  },
  {
    id: 'cat-commercial',
    name: 'Commercial Photography',
    slug: 'commercial-photography',
    description: 'Architectural still-life and luxury object studies for fragrance, design, and beauty houses.',
    order: 8,
  },
];

export const DEFAULT_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'work-como-colonnade',
    title: 'Colonnade at Villa Balbiano',
    categoryId: 'cat-wedding',
    categoryName: 'Wedding Photography',
    imageUrl: heroWeddingImg,
    aspectRatio: 'landscape',
    location: 'Lake Como, Italy',
    cameraSpecs: 'Hasselblad X2D · 55mm f/2.5 · ISO 100',
    year: '2026',
    featured: true,
    order: 1,
  },
  {
    id: 'work-tuscan-veil',
    title: 'Silk & Courtyard Light',
    categoryId: 'cat-wedding',
    categoryName: 'Wedding Photography',
    imageUrl: weddingVeilImg,
    aspectRatio: 'portrait',
    location: 'Val d’Orcia, Tuscany',
    cameraSpecs: 'Contax 645 · 80mm f/2 · Portra 400',
    year: '2026',
    featured: true,
    order: 2,
  },
  {
    id: 'work-monolith-travertine',
    title: 'Travertine Silhouette No. 04',
    categoryId: 'cat-fashion',
    categoryName: 'Fashion Photography',
    imageUrl: fashionMonolithImg,
    aspectRatio: 'portrait',
    location: 'Milan, Italy',
    cameraSpecs: 'Leica SL3 · 50mm APO · ISO 160',
    year: '2026',
    featured: true,
    order: 3,
  },
  {
    id: 'work-big-sur-dusk',
    title: 'Pacific Mist & Horizon',
    categoryId: 'cat-prewedding',
    categoryName: 'Pre-Wedding Photography',
    imageUrl: preweddingCliffsImg,
    aspectRatio: 'landscape',
    location: 'Big Sur, California',
    cameraSpecs: 'Leica M11 · 35mm Summilux · ISO 400',
    year: '2025',
    featured: true,
    order: 4,
  },
  {
    id: 'work-chiaroscuro-study',
    title: 'Chiaroscuro Study in Charcoal',
    categoryId: 'cat-portrait',
    categoryName: 'Portrait Photography',
    imageUrl: portraitChiaroscuroImg,
    aspectRatio: 'portrait',
    location: 'Paris, France',
    cameraSpecs: 'Hasselblad 500C/M · 80mm · Tri-X 400',
    year: '2025',
    featured: true,
    order: 5,
  },
  {
    id: 'work-concrete-gallery',
    title: 'Gallery Shadows',
    categoryId: 'cat-fashion',
    categoryName: 'Fashion Photography',
    imageUrl: heroFashionImg,
    aspectRatio: 'landscape',
    location: 'Naoshima, Japan',
    cameraSpecs: 'Leica M11 Monochrom · 35mm · ISO 320',
    year: '2026',
    featured: true,
    order: 6,
  },
  {
    id: 'work-vaulted-candlelight',
    title: 'Candlelit Palazzo Dinner',
    categoryId: 'cat-event',
    categoryName: 'Event Photography',
    imageUrl: eventCandlelightImg,
    aspectRatio: 'landscape',
    location: 'Venice, Italy',
    cameraSpecs: 'Leica SL3 · 35mm f/1.4 · ISO 1600',
    year: '2025',
    featured: false,
    order: 7,
  },
  {
    id: 'work-parisian-morning',
    title: 'Linen & Morning Coffee',
    categoryId: 'cat-lifestyle',
    categoryName: 'Lifestyle Photography',
    imageUrl: lifestyleMorningImg,
    aspectRatio: 'landscape',
    location: 'Le Marais, Paris',
    cameraSpecs: 'Leica Q3 · 28mm f/1.7 · ISO 200',
    year: '2026',
    featured: false,
    order: 8,
  },
  {
    id: 'work-nordic-basalt',
    title: 'Twilight at Reynisfjara',
    categoryId: 'cat-nature-travel',
    categoryName: 'Nature & Travel Photography',
    imageUrl: natureNordicImg,
    aspectRatio: 'landscape',
    location: 'Vik, Iceland',
    cameraSpecs: 'Hasselblad X2D · 38mm f/2.5 · ISO 64',
    year: '2025',
    featured: true,
    order: 9,
  },
  {
    id: 'work-aurelia-flacon',
    title: 'Amber Sediment on Travertine',
    categoryId: 'cat-commercial',
    categoryName: 'Commercial Photography',
    imageUrl: commercialFlaconImg,
    aspectRatio: 'square',
    location: 'Grasse & Milan Studio',
    cameraSpecs: 'Phase One IQ4 · 120mm Macro · ISO 50',
    year: '2026',
    featured: true,
    order: 10,
  },
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-como-vows',
    title: 'Vows Beneath Como Stone',
    slug: 'vows-beneath-como-stone',
    categoryName: 'Wedding Photography',
    location: 'Lake Como & Tuscany, Italy',
    dateLabel: 'Autumn 2026',
    clientName: 'Camille & Matteo Laurent',
    summary:
      'A three-day architectural wedding monograph documented across limestone colonnades, private lake vessels, and candlelit palazzo courtyards.',
    editorialNotes:
      'Photographed entirely with natural Italian afternoon light and medium-format Kodak Portra stock, this series balances quiet architectural geometry with unguarded human emotion. Clara tracked the intimate ceremony moments while Elena framed the sweeping stone arcades and alpine horizon.',
    coverImageUrl: heroWeddingImg,
    galleryImages: [heroWeddingImg, weddingVeilImg, eventCandlelightImg, lifestyleMorningImg],
    order: 1,
  },
  {
    id: 'proj-monolith-autumn',
    title: 'Form & Travertine — Autumn Capsule',
    slug: 'form-and-travertine',
    categoryName: 'Fashion Photography',
    location: 'Milan & Naoshima',
    dateLabel: 'Winter 2026',
    clientName: 'Maison Valmont Atelier',
    summary:
      'Sculptural outerwear and monochrome gallery portraiture exploring raw concrete, warm stone, and crisp directional shadow.',
    editorialNotes:
      'Commissioned for Maison Valmont’s international flagship presentation, TWINS constructed a visual dialogue between tailored cashmere silhouettes and brutalist mineral surfaces. Every frame was lit exclusively by shifting daylight across architectural concrete.',
    coverImageUrl: fashionMonolithImg,
    galleryImages: [fashionMonolithImg, heroFashionImg, portraitChiaroscuroImg, commercialFlaconImg],
    order: 2,
  },
  {
    id: 'proj-northern-quiet',
    title: 'Horizons of Salt & Mist',
    slug: 'horizons-of-salt-and-mist',
    categoryName: 'Pre-Wedding & Travel',
    location: 'Big Sur & Southern Iceland',
    dateLabel: 'Spring 2025',
    clientName: 'Sora & Julian Reid',
    summary:
      'An intimate pre-wedding expedition across windswept Pacific headlands and volcanic Nordic shores at blue hour.',
    editorialNotes:
      'Designed around stillness rather than posed spectacle, this two-country commission unfolded at dawn and dusk when mist softened the boundary between ocean and sky.',
    coverImageUrl: preweddingCliffsImg,
    galleryImages: [preweddingCliffsImg, natureNordicImg, lifestyleMorningImg],
    order: 3,
  },
];

export const DEFAULT_SERVICES: Service[] = [
  {
    id: 'srv-wedding',
    title: 'Wedding Photography',
    slug: 'wedding-photography',
    description:
      'Full-weekend editorial and documentary coverage with both twin principal photographers, blending digital clarity with medium-format film.',
    deliverables: '2 Principal Photographers · 800+ Curated Frames · Fine-Art Linen Album',
    startingPrice: 'From €6,500',
    order: 1,
  },
  {
    id: 'srv-prewedding',
    title: 'Pre-Wedding Shoots',
    slug: 'pre-wedding-shoots',
    description:
      'Bespoke destination engagement and couple sessions crafted around architectural landmarks, coastal cliffs, or intimate city mornings.',
    deliverables: 'Half or Full-Day Location Shoot · Art Direction · 120+ Retouched Images',
    startingPrice: 'From €2,200',
    order: 2,
  },
  {
    id: 'srv-portraits',
    title: 'Personal Portraits',
    slug: 'personal-portraits',
    description:
      'Timeless studio or natural-light character portraits for artists, founders, executives, and private collectors.',
    deliverables: '2-Hour Studio Session · Medium Format & B&W Prints · 25 Master Files',
    startingPrice: 'From €950',
    order: 3,
  },
  {
    id: 'srv-fashion',
    title: 'Fashion & Model Photography',
    slug: 'fashion-model-photography',
    description:
      'Editorial campaigns, seasonal lookbooks, and portfolio tests tailored for fashion houses, stylists, and agency talent.',
    deliverables: 'Full Production Concept · Tethering & Color Grading · Campaign Licensing',
    startingPrice: 'From €3,400',
    order: 4,
  },
  {
    id: 'srv-events',
    title: 'Birthday & Event Photography',
    slug: 'birthday-event-photography',
    description:
      'Discreet, atmospheric reportage for milestone celebrations, private dinners, gallery openings, and luxury brand gatherings.',
    deliverables: '48-Hour Preview Gallery · Candlelight Low-Light Mastery · Full Archive',
    startingPrice: 'From €1,800',
    order: 5,
  },
  {
    id: 'srv-commercial',
    title: 'Commercial Photography',
    slug: 'commercial-photography',
    description:
      'Visual identity campaigns for hospitality groups, architectural firms, and design-led lifestyle brands.',
    deliverables: 'Creative Treatment · Multi-Day Production · Global Commercial Usage',
    startingPrice: 'From €4,500',
    order: 6,
  },
  {
    id: 'srv-product',
    title: 'Product Photography',
    slug: 'product-photography',
    description:
      'Tactile still-life compositions on travertine, linen, and sculpted stone for fragrance, horology, ceramics, and beauty.',
    deliverables: 'Set Styling & Prop Curation · Macro Precision · Print & E-Commerce Cuts',
    startingPrice: 'From €1,600',
    order: 7,
  },
  {
    id: 'srv-custom',
    title: 'Custom Photography Packages',
    slug: 'custom-photography-packages',
    description:
      'Tailored multi-city commissions, hybrid film-and-digital monographs, and bespoke exhibition printing built around your brief.',
    deliverables: 'Dedicated Producer · Custom Travel & Print Curation · Bespoke Scope',
    startingPrice: 'Bespoke Quote',
    order: 8,
  },
];

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-laurent',
    clientName: 'Camille & Matteo Laurent',
    clientRole: 'Wedding Commission · Lake Como',
    quote:
      'TWINS captured our three-day celebration with the sensitivity of classic cinema. Looking through our album feels less like viewing photographs and more like stepping back into the warmth of every quiet glance.',
    rating: 5,
    avatarUrl: clientAvatarImg,
    order: 1,
  },
  {
    id: 'test-valmont',
    clientName: 'Henrietta Lindqvist',
    clientRole: 'Creative Director · Maison Valmont',
    quote:
      'Clara and Elena possess an extraordinary command of natural shadow and architectural proportion. Our autumn capsule campaign achieved our highest editorial press placement in Europe.',
    rating: 5,
    avatarUrl: fashionMonolithImg,
    order: 2,
  },
  {
    id: 'test-reid',
    clientName: 'Sora & Julian Reid',
    clientRole: 'Pre-Wedding Monograph · Big Sur',
    quote:
      'We normally feel camera-shy, yet within ten minutes we forgot lenses were even present. Every frame has an effortless stillness we will treasure for decades.',
    rating: 5,
    avatarUrl: preweddingCliffsImg,
    order: 3,
  },
  {
    id: 'test-aurelia',
    clientName: 'Marc-Antoine Delacroix',
    clientRole: 'Founder · Aurélia Parfums Paris',
    quote:
      'Their commercial still-life work elevated our flagship fragrance launch overnight. The interplay of amber glass and raw travertine felt unmistakably tactile.',
    rating: 5,
    avatarUrl: commercialFlaconImg,
    order: 4,
  },
];
