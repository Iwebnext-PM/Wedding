import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Lock } from 'lucide-react';
import { StudioProvider, useStudio } from './context/StudioContext';
import { DEFAULT_HOMEPAGE_SECTIONS } from './data/seedData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { PortfolioSection } from './components/PortfolioSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { ServicesSection } from './components/ServicesSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactSection } from './components/ContactSection';
import { CustomSectionRenderer } from './components/CustomSectionRenderer';
import { CustomPageView } from './components/CustomPageView';
import { Footer } from './components/Footer';
import { LightboxModal, type LightboxSlide } from './components/LightboxModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import type { Project } from './types/studio';

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || 'An unexpected error occurred.' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0A0A] text-[#FAF8F5] flex items-center justify-center p-6">
          <div className="max-w-md w-full border border-white/15 bg-[#121110] p-8 text-center">
            <h1 className="font-editorial text-3xl">TWINS Studio</h1>
            <p className="mt-3 text-sm text-[#B8B0A4]">
              Something interrupted the studio view. Please refresh to reconnect.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2.5 text-xs uppercase tracking-[0.14em] bg-[#FAF8F5] text-[#0A0A0A] hover:bg-[#D4C3AA] cursor-pointer"
            >
              Reload Studio
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function StudioExperience() {
  const { siteSettings, projects, services, pages, isAdmin } = useStudio();

  const [isAdminRoute, setIsAdminRoute] = useState(() =>
    window.location.pathname.startsWith('/admin')
  );
  const [activePageSlug, setActivePageSlug] = useState<string | null>(() => {
    const match = window.location.pathname.match(/^\/p\/([^/]+)/);
    return match ? match[1] : null;
  });
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(() => {
    const match = window.location.pathname.match(/^\/portfolio\/([^/]+)/);
    return match ? match[1] : 'all';
  });
  const [activeProjectSlug, setActiveProjectSlug] = useState<string | null>(() => {
    const match = window.location.pathname.match(/^\/projects\/([^/]+)/);
    return match ? match[1] : null;
  });

  const [preselectedService, setPreselectedService] = useState<string>(
    services[0]?.title || 'Wedding Photography'
  );
  const [lightboxState, setLightboxState] = useState<{
    slides: LightboxSlide[];
    index: number | null;
  }>({ slides: [], index: null });

  const [showSplash, setShowSplash] = useState(Boolean(siteSettings.loadingScreenEnabled));

  useEffect(() => {
    if (!siteSettings.loadingScreenEnabled) {
      setShowSplash(false);
      return;
    }
    setShowSplash(true);
    const timer = window.setTimeout(() => setShowSplash(false), 650);
    return () => window.clearTimeout(timer);
  }, [siteSettings.loadingScreenEnabled]);

  const pushPath = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  }, []);

  const scrollToSection = useCallback(
    (sectionId: string, path?: string) => {
      if (isAdminRoute) setIsAdminRoute(false);
      setActiveProjectSlug(null);
      setActivePageSlug(null);
      if (path) pushPath(path);

      window.requestAnimationFrame(() => {
        if (sectionId === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    },
    [isAdminRoute, pushPath]
  );

  const handleNavigateTarget = useCallback(
    (target: string) => {
      const trimmed = (target || '').trim();
      if (!trimmed) {
        scrollToSection('home', '/');
        return;
      }
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        window.open(trimmed, '_blank', 'noopener,noreferrer');
        return;
      }
      if (trimmed.startsWith('/p/')) {
        const slug = trimmed.replace(/^\/p\//, '').replace(/\/+$/, '');
        setIsAdminRoute(false);
        setActiveProjectSlug(null);
        setActivePageSlug(slug);
        pushPath(`/p/${slug}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (trimmed === '/admin') {
        setIsAdminRoute(true);
        pushPath('/admin');
        window.scrollTo({ top: 0 });
        return;
      }
      const cleanId = trimmed.replace(/^#/, '').replace(/^\//, '');
      const sectionPath = cleanId === 'home' || cleanId === '' ? '/' : `/${cleanId}`;
      scrollToSection(cleanId || 'home', sectionPath);
    },
    [pushPath, scrollToSection]
  );

  // Sync browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        setIsAdminRoute(true);
        setActiveProjectSlug(null);
        setActivePageSlug(null);
        return;
      }
      setIsAdminRoute(false);

      const pageMatch = path.match(/^\/p\/([^/]+)/);
      if (pageMatch) {
        setActivePageSlug(pageMatch[1]);
        setActiveProjectSlug(null);
        return;
      }
      setActivePageSlug(null);

      const projMatch = path.match(/^\/projects\/([^/]+)/);
      if (projMatch) {
        setActiveProjectSlug(projMatch[1]);
        return;
      }
      setActiveProjectSlug(null);

      const catMatch = path.match(/^\/portfolio\/([^/]+)/);
      if (catMatch) {
        setSelectedCategorySlug(catMatch[1]);
        document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      const sectionMap: Record<string, string> = {
        '/': 'home',
        '/about': 'about',
        '/portfolio': 'portfolio',
        '/projects': 'projects',
        '/services': 'services',
        '/contact': 'contact',
      };
      const target = sectionMap[path];
      if (target) {
        if (target === 'home') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Scroll to initial section if URL directly hits /about, /portfolio, /services, /projects, /contact
  useEffect(() => {
    const path = window.location.pathname;
    const sectionMap: Record<string, string> = {
      '/about': 'about',
      '/portfolio': 'portfolio',
      '/projects': 'projects',
      '/services': 'services',
      '/contact': 'contact',
    };
    if (path.startsWith('/portfolio/')) {
      document.getElementById('portfolio')?.scrollIntoView();
    } else if (sectionMap[path]) {
      document.getElementById(sectionMap[path])?.scrollIntoView();
    }
  }, []);

  const handleSelectCategory = (slug: string) => {
    setSelectedCategorySlug(slug);
    pushPath(slug === 'all' ? '/portfolio' : `/portfolio/${slug}`);
  };

  const handleOpenProject = (project: Project) => {
    setActiveProjectSlug(project.slug);
    pushPath(`/projects/${project.slug}`);
  };

  const handleCloseProject = () => {
    setActiveProjectSlug(null);
    pushPath('/projects');
  };

  const handleInquireService = (serviceTitle: string) => {
    setPreselectedService(serviceTitle);
    scrollToSection('contact', '/contact');
  };

  const handleOpenAdmin = () => {
    setIsAdminRoute(true);
    pushPath('/admin');
    window.scrollTo({ top: 0 });
  };

  const handleExitAdmin = () => {
    setIsAdminRoute(false);
    setActivePageSlug(null);
    pushPath('/');
    window.scrollTo({ top: 0 });
  };

  const activeProject =
    activeProjectSlug
      ? projects.find((p) => p.slug === activeProjectSlug || p.id === activeProjectSlug) || null
      : null;

  const activeCustomPage = useMemo(() => {
    if (!activePageSlug) return null;
    return pages.find((p) => p.slug === activePageSlug && (p.status === 'published' || isAdmin)) || null;
  }, [activePageSlug, pages, isAdmin]);

  const homepageSections =
    siteSettings.homepageSections && siteSettings.homepageSections.length > 0
      ? siteSettings.homepageSections
      : DEFAULT_HOMEPAGE_SECTIONS;

  const fontClass =
    siteSettings.fontPreset === 'modern-sans'
      ? 'font-sans'
      : siteSettings.fontPreset === 'classic-monograph'
      ? 'tracking-[-0.005em]'
      : '';

  if (isAdminRoute) {
    return <AdminDashboard onExitAdmin={handleExitAdmin} />;
  }

  // Maintenance mode view for public visitors (admins can preview the live site with a bypass banner)
  if (siteSettings.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#FAF8F5] flex flex-col justify-between p-6 sm:p-12">
        <div className="flex items-center justify-between">
          <span className="font-editorial text-2xl tracking-[0.22em] uppercase">
            {siteSettings.brandName || 'TWINS'}
          </span>
          <button
            type="button"
            onClick={handleOpenAdmin}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#B8B0A4] hover:text-[#D4C3AA] cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Studio Admin</span>
          </button>
        </div>

        <div className="max-w-xl mx-auto text-center py-16">
          <p className="text-xs uppercase tracking-[0.24em] text-[#D4C3AA]">Private Curation</p>
          <h1 className="mt-4 font-editorial text-4xl sm:text-6xl leading-[1.06]">
            Exhibition Updating
          </h1>
          <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#B8B0A4]">
            {siteSettings.maintenanceMessage ||
              'Our digital exhibition is currently being curated. Please return shortly.'}
          </p>
          <a
            href={`mailto:${siteSettings.contactEmail}`}
            className="mt-8 inline-block px-6 py-3 text-xs uppercase tracking-[0.14em] border border-white/25 hover:border-[#D4C3AA] hover:text-[#D4C3AA] transition-colors"
          >
            {siteSettings.contactEmail}
          </a>
        </div>

        <p className="text-center text-xs text-[#6E675E]">
          &copy; {new Date().getFullYear()} {siteSettings.brandName || 'TWINS'} Photography Studio
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-[#FAF8F5] text-[#111111] ${fontClass}`}>
      {/* Optional Brief Editorial Entrance Screen */}
      {showSplash && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-50 bg-[#0A0A0A] text-[#FAF8F5] flex flex-col items-center justify-center p-6 transition-opacity duration-500"
        >
          <p className="font-editorial text-3xl sm:text-5xl tracking-[0.24em] uppercase">
            {siteSettings.brandName || 'TWINS'}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[#D4C3AA]">
            {siteSettings.loadingScreenText || 'Visual Storytelling Atelier'}
          </p>
        </div>
      )}

      {/* Admin Maintenance Bypass Indicator */}
      {siteSettings.maintenanceMode && isAdmin && (
        <div className="bg-[#786651] text-[#FAF8F5] text-xs py-2 px-4 text-center z-50 flex items-center justify-center gap-4">
          <span>Maintenance Mode is active — visible only to signed-in Studio Administrators.</span>
          <button
            type="button"
            onClick={handleOpenAdmin}
            className="underline font-medium hover:text-black cursor-pointer"
          >
            Open Admin CMS
          </button>
        </div>
      )}

      <Navbar onNavigateTarget={handleNavigateTarget} onOpenAdmin={handleOpenAdmin} />

      <main className="flex-1">
        {activeCustomPage ? (
          <CustomPageView
            page={activeCustomPage}
            onBackHome={() => scrollToSection('home', '/')}
            onNavigateTarget={handleNavigateTarget}
            onOpenLightbox={(slides, index) => setLightboxState({ slides, index })}
          />
        ) : (
          homepageSections
            .filter((sec) => sec.visible)
            .map((sec) => {
              switch (sec.key) {
                case 'hero':
                  return (
                    <HeroSection
                      key={sec.id}
                      sectionConfig={sec}
                      onNavigateTarget={handleNavigateTarget}
                    />
                  );
                case 'about':
                  return <AboutSection key={sec.id} sectionConfig={sec} />;
                case 'portfolio':
                  return (
                    <PortfolioSection
                      key={sec.id}
                      sectionConfig={sec}
                      selectedCategorySlug={selectedCategorySlug}
                      onSelectCategory={handleSelectCategory}
                      onOpenLightbox={(slides, index) => setLightboxState({ slides, index })}
                    />
                  );
                case 'projects':
                  return (
                    <ProjectsSection
                      key={sec.id}
                      sectionConfig={sec}
                      onSelectProject={handleOpenProject}
                    />
                  );
                case 'services':
                  return (
                    <ServicesSection
                      key={sec.id}
                      sectionConfig={sec}
                      onInquireService={handleInquireService}
                    />
                  );
                case 'testimonials':
                  return <TestimonialsSection key={sec.id} sectionConfig={sec} />;
                case 'contact':
                  return (
                    <ContactSection
                      key={sec.id}
                      sectionConfig={sec}
                      preselectedService={preselectedService}
                    />
                  );
                case 'custom':
                default:
                  return (
                    <CustomSectionRenderer
                      key={sec.id}
                      section={sec}
                      onNavigateTarget={handleNavigateTarget}
                    />
                  );
              }
            })
        )}
      </main>

      <Footer onNavigateTarget={handleNavigateTarget} onOpenAdmin={handleOpenAdmin} />

      <ProjectDetailModal
        project={activeProject}
        onClose={handleCloseProject}
        onBookProjectType={(cat) => {
          setActiveProjectSlug(null);
          handleInquireService(cat);
        }}
        onOpenLightbox={(slides, index) => setLightboxState({ slides, index })}
      />

      <LightboxModal
        slides={lightboxState.slides}
        activeIndex={lightboxState.index}
        onClose={() => setLightboxState((prev) => ({ ...prev, index: null }))}
        onChangeIndex={(index) => setLightboxState((prev) => ({ ...prev, index }))}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <StudioProvider>
        <StudioExperience />
      </StudioProvider>
    </AppErrorBoundary>
  );
}
