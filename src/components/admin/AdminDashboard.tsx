import React, { useCallback, useState } from 'react';
import {
  ArrowLeft,
  Award,
  Camera,
  CheckCircle2,
  Compass,
  Database,
  FileText,
  FolderHeart,
  FolderKanban,
  Globe,
  HardDriveDownload,
  Home,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Mail,
  Menu,
  MessageSquareQuote,
  Settings,
  Share2,
  ShieldAlert,
  Tags,
  Users,
  X,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { ConfirmModal } from './ConfirmModal';
import { OverviewPanel } from './OverviewPanel';
import { HomepageContentPanel } from './HomepageContentPanel';
import { PageBuilderPanel } from './PageBuilderPanel';
import { PortfolioGalleryPanel } from './PortfolioGalleryPanel';
import {
  ProjectsManagerPanel,
  ServicesManagerPanel,
  TestimonialsManagerPanel,
} from './ProjectsServicesPanel';
import { ContactSocialPanel, InquiriesPanel } from './InquiriesContactSocialPanel';
import {
  AdminUsersPanel,
  BackupRestorePanel,
  SeoManagerPanel,
  WebsiteSettingsPanel,
} from './SeoSettingsSecurityPanel';
import { MediaLibraryManager } from './MediaLibraryModal';

export type AdminTabId =
  | 'overview'
  | 'website-content'
  | 'pages'
  | 'homepage'
  | 'about'
  | 'portfolio'
  | 'gallery'
  | 'categories'
  | 'projects'
  | 'services'
  | 'testimonials'
  | 'inquiries'
  | 'contact'
  | 'social'
  | 'navigation'
  | 'seo'
  | 'media'
  | 'settings'
  | 'users'
  | 'backup';

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

export function AdminDashboard({ onExitAdmin }: AdminDashboardProps) {
  const {
    user,
    authReady,
    isAdmin,
    currentAdminRole,
    isCloudSeeded,
    signInWithGoogle,
    logout,
    seedDefaultCatalog,
    inquiries,
    siteSettings,
  } = useStudio();

  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingTab, setPendingTab] = useState<AdminTabId | null>(null);

  const notify = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? '' : curr));
    }, 4000);
  }, []);

  const handleSelectTab = (tabId: AdminTabId) => {
    if (tabId === activeTab) {
      setSidebarOpen(false);
      return;
    }
    if (hasUnsavedChanges) {
      setPendingTab(tabId);
      return;
    }
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const handleSignIn = async () => {
    setAuthError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Unable to sign in with Google.');
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDefaultCatalog();
      notify('Default TWINS studio catalog synced to Firestore.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to initialize cloud database.');
    } finally {
      setSeeding(false);
    }
  };

  // Auth loading state
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#FAF8F5] flex items-center justify-center p-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#D4C3AA]">
          Verifying Studio Session...
        </p>
      </div>
    );
  }

  // Unauthenticated Login Gate
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#FAF8F5] flex flex-col justify-between p-6 sm:p-12">
        <div>
          <button
            type="button"
            onClick={onExitAdmin}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#B8B0A4] hover:text-[#D4C3AA] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {siteSettings.brandName} Portfolio</span>
          </button>
        </div>

        <div className="max-w-md w-full mx-auto border border-white/15 bg-[#121110] p-8 sm:p-10">
          <p className="text-xs uppercase tracking-[0.22em] text-[#D4C3AA]">
            {siteSettings.brandName} Atelier CMS
          </p>
          <h1 className="mt-3 font-editorial text-4xl text-[#FAF8F5]">Studio Admin Portal</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#B8B0A4]">
            Sign in with your authorized Google account to manage pages, homepage sections,
            portfolios, galleries, services, SEO metadata, media assets, and client bookings.
          </p>

          {authError && (
            <p className="mt-4 p-3 bg-red-950/60 border border-red-500/40 text-xs text-red-200">
              {authError}
            </p>
          )}

          <button
            type="button"
            onClick={handleSignIn}
            className="mt-8 w-full py-3.5 px-6 text-xs uppercase tracking-[0.14em] font-medium bg-[#FAF8F5] text-[#0A0A0A] hover:bg-[#D4C3AA] transition-colors cursor-pointer"
          >
            Sign In With Google
          </button>
        </div>

        <p className="text-center text-xs text-[#6E675E]">
          Protected by Firebase Authentication &amp; Firestore Zero-Trust Rules
        </p>
      </div>
    );
  }

  // Signed in but not an authorized Admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-[#FAF8F5] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full border border-white/15 bg-[#121110] p-8 text-center">
          <ShieldAlert className="w-8 h-8 text-[#D4C3AA] mx-auto mb-4" />
          <h1 className="font-editorial text-3xl text-[#FAF8F5]">Access Restricted</h1>
          <p className="mt-3 text-sm text-[#B8B0A4] leading-relaxed">
            Signed in as <span className="text-[#FAF8F5] font-mono">{user.email}</span>, which is
            not authorized as a studio administrator.
          </p>
          <p className="mt-2 text-xs font-mono text-[#8A8277]">UID: {user.uid}</p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={logout}
              className="px-5 py-2.5 text-xs uppercase tracking-[0.12em] bg-[#FAF8F5] text-[#0A0A0A] hover:bg-[#D4C3AA] cursor-pointer"
            >
              Sign Out
            </button>
            <button
              type="button"
              onClick={onExitAdmin}
              className="px-5 py-2.5 text-xs uppercase tracking-[0.12em] border border-white/25 text-[#FAF8F5] hover:border-[#D4C3AA] cursor-pointer"
            >
              Return to Site
            </button>
          </div>
        </div>
      </div>
    );
  }

  const newInquiriesCount = inquiries.filter((i) => i.status === 'new').length;

  const navItems: {
    id: AdminTabId;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { id: 'overview', label: 'Dashboard Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'website-content', label: 'Website Content', icon: <LayoutTemplate className="w-4 h-4" /> },
    { id: 'pages', label: 'Page Management', icon: <FileText className="w-4 h-4" /> },
    { id: 'homepage', label: 'Homepage Management', icon: <Home className="w-4 h-4" /> },
    { id: 'about', label: 'About Us Management', icon: <Award className="w-4 h-4" /> },
    { id: 'portfolio', label: 'Portfolio Management', icon: <Camera className="w-4 h-4" /> },
    { id: 'gallery', label: 'Gallery Management', icon: <FolderHeart className="w-4 h-4" /> },
    { id: 'categories', label: 'Photography Categories', icon: <Tags className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects Management', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'services', label: 'Services Management', icon: <Compass className="w-4 h-4" /> },
    { id: 'testimonials', label: 'Testimonials Management', icon: <MessageSquareQuote className="w-4 h-4" /> },
    {
      id: 'inquiries',
      label: 'Booking Inquiries',
      icon: <Inbox className="w-4 h-4" />,
      badge: newInquiriesCount > 0 ? newInquiriesCount : undefined,
    },
    { id: 'contact', label: 'Contact Information', icon: <Mail className="w-4 h-4" /> },
    { id: 'social', label: 'Social Media Management', icon: <Share2 className="w-4 h-4" /> },
    { id: 'navigation', label: 'Navigation Menu Management', icon: <Menu className="w-4 h-4" /> },
    { id: 'seo', label: 'SEO Management', icon: <Globe className="w-4 h-4" /> },
    { id: 'media', label: 'Media Library', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'settings', label: 'Website Settings', icon: <Settings className="w-4 h-4" /> },
    { id: 'users', label: 'Admin Users & Permissions', icon: <Users className="w-4 h-4" /> },
    { id: 'backup', label: 'Backup & Restore', icon: <HardDriveDownload className="w-4 h-4" /> },
  ];

  const activeItem = navItems.find((n) => n.id === activeTab) || navItems[0];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#111111] flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          aria-hidden="true"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* Dark Sidebar Navigation (21 Required Items) */}
      <aside
        aria-label="Admin CMS Sidebar"
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-[#0A0A0A] text-[#FAF8F5] border-r border-white/10 flex flex-col shrink-0 transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <span className="font-editorial text-xl tracking-[0.2em] uppercase block leading-none">
              {siteSettings.brandName || 'TWINS'}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#D4C3AA] font-mono">
              Studio CMS
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#B8B0A4] hover:text-white cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 text-left text-xs tracking-wide transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#D4C3AA] text-[#0A0A0A] font-semibold'
                    : 'text-[#B8B0A4] hover:bg-white/5 hover:text-[#FAF8F5]'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <span className="shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono tabular-nums shrink-0 ${
                      isActive ? 'bg-[#0A0A0A] text-[#FAF8F5]' : 'bg-[#D4C3AA] text-[#0A0A0A]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Item 21: Logout */}
        <div className="p-3 border-t border-white/10 shrink-0 space-y-2">
          <button
            type="button"
            onClick={onExitAdmin}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#D4C3AA] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>View Live Website</span>
          </button>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#FAF8F5]/85 hover:bg-red-950/60 hover:text-red-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar with Breadcrumbs & Session Status */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-[#E5DFD5] px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar navigation"
              className="lg:hidden p-2 border border-[#DFD8CC] text-[#111111] cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#8A8277] font-mono">
                CMS / {activeItem.label}
              </p>
              <h1 className="font-editorial text-xl sm:text-2xl text-[#111111] truncate leading-tight">
                {activeItem.label}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {hasUnsavedChanges && (
              <span className="hidden sm:inline-block px-2.5 py-1 bg-amber-50 border border-amber-300 text-[11px] text-amber-900">
                Unsaved edits
              </span>
            )}
            <span className="hidden md:inline text-xs font-mono text-[#6E675E]">
              {user.email} ({currentAdminRole})
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {/* Cloud Seed Banner */}
          {!isCloudSeeded && (
            <div className="bg-[#111111] text-[#FAF8F5] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-[#D4C3AA] shrink-0 mt-0.5" />
                <div>
                  <p className="font-editorial text-xl">
                    Initialize Studio Cloud Catalog in Firestore
                  </p>
                  <p className="text-xs text-[#B8B0A4] mt-1">
                    Sync the default TWINS portfolio, albums, services, pages, and media library to
                    Firestore with one click.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSeed}
                disabled={seeding}
                className="px-5 py-2.5 text-xs uppercase tracking-[0.12em] font-medium bg-[#FAF8F5] text-[#0A0A0A] hover:bg-[#D4C3AA] disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {seeding ? 'Syncing Catalog...' : 'Sync Default Catalog'}
              </button>
            </div>
          )}

          {/* Live Toast Notification */}
          {toastMessage && (
            <div
              role="status"
              className="bg-[#F4F1EA] border border-[#C8B69E] px-4 py-3 flex items-center justify-between gap-3 text-xs text-[#4A3E2F]"
            >
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#5E4E3B]" />
                {toastMessage}
              </span>
              <button
                type="button"
                onClick={() => setToastMessage('')}
                className="text-[#6E675E] hover:text-[#111111] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active CMS Module */}
          {activeTab === 'overview' && (
            <OverviewPanel onNavigateTab={(t) => handleSelectTab(t as AdminTabId)} />
          )}

          {(activeTab === 'website-content' ||
            activeTab === 'homepage' ||
            activeTab === 'about' ||
            activeTab === 'navigation') && (
            <HomepageContentPanel
              mode={activeTab}
              onNotify={notify}
              onDirtyChange={setHasUnsavedChanges}
            />
          )}

          {activeTab === 'pages' && <PageBuilderPanel onNotify={notify} />}

          {(activeTab === 'portfolio' ||
            activeTab === 'gallery' ||
            activeTab === 'categories') && (
            <PortfolioGalleryPanel mode={activeTab} onNotify={notify} />
          )}

          {activeTab === 'projects' && <ProjectsManagerPanel onNotify={notify} />}
          {activeTab === 'services' && <ServicesManagerPanel onNotify={notify} />}
          {activeTab === 'testimonials' && <TestimonialsManagerPanel onNotify={notify} />}
          {activeTab === 'inquiries' && <InquiriesPanel onNotify={notify} />}

          {(activeTab === 'contact' || activeTab === 'social') && (
            <ContactSocialPanel
              mode={activeTab}
              onNotify={notify}
              onDirtyChange={setHasUnsavedChanges}
            />
          )}

          {activeTab === 'seo' && <SeoManagerPanel onNotify={notify} />}
          {activeTab === 'media' && <MediaLibraryManager onNotify={notify} />}
          {activeTab === 'settings' && (
            <WebsiteSettingsPanel onNotify={notify} onDirtyChange={setHasUnsavedChanges} />
          )}
          {activeTab === 'users' && <AdminUsersPanel onNotify={notify} />}
          {activeTab === 'backup' && <BackupRestorePanel onNotify={notify} />}
        </main>
      </div>

      {/* Unsaved Changes Confirmation Dialog */}
      <ConfirmModal
        open={Boolean(pendingTab)}
        title="Unsaved Changes"
        description="You have unsaved edits on the current screen. Discard them and switch sections?"
        confirmLabel="Discard & Switch"
        onConfirm={() => {
          if (pendingTab) {
            setHasUnsavedChanges(false);
            setActiveTab(pendingTab);
            setPendingTab(null);
            setSidebarOpen(false);
          }
        }}
        onCancel={() => setPendingTab(null)}
      />
    </div>
  );
}
