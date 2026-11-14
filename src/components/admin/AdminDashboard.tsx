import React, { useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Database,
  FolderKanban,
  Inbox,
  Layers,
  LogOut,
  MessageSquareQuote,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';
import { PortfolioManager } from './PortfolioManager';
import { ProjectsManager, ServicesTestimonialsManager } from './ProjectsServicesManager';
import { InquiriesManager, StudioSettingsManager } from './SettingsInquiriesManager';

type AdminTab = 'inquiries' | 'portfolio' | 'projects' | 'services' | 'settings';

interface AdminDashboardProps {
  onExitAdmin: () => void;
}

export function AdminDashboard({ onExitAdmin }: AdminDashboardProps) {
  const {
    user,
    authReady,
    isAdmin,
    isCloudSeeded,
    signInWithGoogle,
    logout,
    seedDefaultCatalog,
    portfolioItems,
    projects,
    services,
    testimonials,
    inquiries,
    siteSettings,
  } = useStudio();

  const [activeTab, setActiveTab] = useState<AdminTab>('inquiries');
  const [authError, setAuthError] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

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
    setSeedMessage('');
    try {
      await seedDefaultCatalog();
      setSeedMessage('Default TWINS studio catalog synced to Firestore.');
    } catch (err) {
      setSeedMessage(err instanceof Error ? err.message : 'Failed to initialize cloud database.');
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
            {siteSettings.brandName} Atelier
          </p>
          <h1 className="mt-3 font-editorial text-4xl text-[#FAF8F5]">Studio Admin Portal</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#B8B0A4]">
            Sign in with your authorized Google account to manage portfolio works, featured
            projects, services, testimonials, SEO metadata, and client booking inquiries.
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

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'inquiries',
      label: `Inquiries (${newInquiriesCount > 0 ? `${newInquiriesCount} new` : inquiries.length})`,
      icon: <Inbox className="w-4 h-4" />,
    },
    {
      id: 'portfolio',
      label: 'Portfolio & Categories',
      icon: <Camera className="w-4 h-4" />,
    },
    {
      id: 'projects',
      label: 'Featured Projects',
      icon: <FolderKanban className="w-4 h-4" />,
    },
    {
      id: 'services',
      label: 'Services & Reviews',
      icon: <MessageSquareQuote className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Brand, Hero, SEO & Access',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#111111]">
      {/* Top Studio Bar */}
      <header className="sticky top-0 z-30 bg-[#0A0A0A] text-[#FAF8F5] border-b border-white/10">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <span className="font-editorial text-xl tracking-[0.2em] uppercase">
              {siteSettings.brandName} Admin
            </span>
            <button
              type="button"
              onClick={onExitAdmin}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-[#D4C3AA] hover:text-[#FAF8F5] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>View Live Site</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-xs font-mono text-[#B8B0A4]">{user.email}</span>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs uppercase tracking-[0.12em] border border-white/25 hover:border-[#D4C3AA] hover:text-[#D4C3AA] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 py-8 space-y-8">
        {/* KPI Summary Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border border-[#E5DFD5] p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#6E675E]">Portfolio Works</p>
            <p className="mt-1 font-mono text-2xl tabular-nums text-[#111111]">
              {portfolioItems.length}
            </p>
          </div>
          <div className="bg-white border border-[#E5DFD5] p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#6E675E]">Projects</p>
            <p className="mt-1 font-mono text-2xl tabular-nums text-[#111111]">{projects.length}</p>
          </div>
          <div className="bg-white border border-[#E5DFD5] p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#6E675E]">Services</p>
            <p className="mt-1 font-mono text-2xl tabular-nums text-[#111111]">{services.length}</p>
          </div>
          <div className="bg-white border border-[#E5DFD5] p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#6E675E]">Testimonials</p>
            <p className="mt-1 font-mono text-2xl tabular-nums text-[#111111]">
              {testimonials.length}
            </p>
          </div>
          <div className="bg-white border border-[#E5DFD5] p-4 col-span-2 md:col-span-1">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#6E675E]">Inquiries</p>
            <p className="mt-1 font-mono text-2xl tabular-nums text-[#111111]">
              {inquiries.length}
            </p>
          </div>
        </div>

        {/* Cloud Seed Banner (shown when Firestore hasn't been initialized yet) */}
        {!isCloudSeeded && (
          <div className="bg-[#111111] text-[#FAF8F5] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-[#D4C3AA] shrink-0 mt-0.5" />
              <div>
                <p className="font-editorial text-xl">
                  Initialize Studio Cloud Catalog in Firestore
                </p>
                <p className="text-xs text-[#B8B0A4] mt-1">
                  Your live website is currently displaying default curated works. Sync the starter
                  catalog to Firestore now or begin editing any section directly.
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

        {seedMessage && (
          <p className="text-xs text-[#5E4E3B] bg-[#F4F1EA] border border-[#C8B69E] px-4 py-2.5">
            {seedMessage}
          </p>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E5DFD5] pb-4">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-[0.11em] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#111111] text-[#FAF8F5]'
                    : 'bg-white text-[#4A4742] border border-[#DFD8CC] hover:border-[#111111]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={onExitAdmin}
            className="sm:hidden inline-flex items-center gap-1.5 px-4 py-2.5 text-xs uppercase tracking-[0.11em] border border-[#DFD8CC] bg-white cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Live Site</span>
          </button>
        </div>

        {/* Active Panel */}
        <div>
          {activeTab === 'inquiries' && <InquiriesManager />}
          {activeTab === 'portfolio' && <PortfolioManager />}
          {activeTab === 'projects' && <ProjectsManager />}
          {activeTab === 'services' && <ServicesTestimonialsManager />}
          {activeTab === 'settings' && <StudioSettingsManager />}
        </div>
      </div>
    </div>
  );
}
