import React, { useCallback, useEffect, useState } from 'react';
import { StudioProvider, useStudio } from './context/StudioContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { PortfolioSection } from './components/PortfolioSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { ServicesSection } from './components/ServicesSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { ContactSection } from './components/ContactSection';
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
  const { projects, services } = useStudio();

  const [isAdminRoute, setIsAdminRoute] = useState(() =>
    window.location.pathname.startsWith('/admin')
  );
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

  const pushPath = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
  }, []);

  const scrollToSection = useCallback(
    (sectionId: string, path?: string) => {
      if (isAdminRoute) {
        setIsAdminRoute(false);
      }
      setActiveProjectSlug(null);
      if (path) {
        pushPath(path);
      }
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

  // Sync browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/admin')) {
        setIsAdminRoute(true);
        setActiveProjectSlug(null);
        return;
      }
      setIsAdminRoute(false);

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
    pushPath('/');
    window.scrollTo({ top: 0 });
  };

  const activeProject =
    activeProjectSlug
      ? projects.find((p) => p.slug === activeProjectSlug || p.id === activeProjectSlug) || null
      : null;

  if (isAdminRoute) {
    return <AdminDashboard onExitAdmin={handleExitAdmin} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#111111]">
      <Navbar onNavigateSection={scrollToSection} onOpenAdmin={handleOpenAdmin} />

      <main className="flex-1">
        <HeroSection
          onExplorePortfolio={() => scrollToSection('portfolio', '/portfolio')}
          onBookSession={() => scrollToSection('contact', '/contact')}
        />

        <AboutSection />

        <PortfolioSection
          selectedCategorySlug={selectedCategorySlug}
          onSelectCategory={handleSelectCategory}
          onOpenLightbox={(slides, index) => setLightboxState({ slides, index })}
        />

        <ProjectsSection onSelectProject={handleOpenProject} />

        <ServicesSection onInquireService={handleInquireService} />

        <TestimonialsSection />

        <ContactSection preselectedService={preselectedService} />
      </main>

      <Footer onNavigateSection={scrollToSection} onOpenAdmin={handleOpenAdmin} />

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
