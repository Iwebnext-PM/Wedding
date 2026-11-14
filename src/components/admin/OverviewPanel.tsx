import React, { useMemo } from 'react';
import {
  Activity,
  Camera,
  FileText,
  FolderKanban,
  Inbox,
  Layers,
  MessageSquareQuote,
  Sparkles,
} from 'lucide-react';
import { useStudio } from '../../context/StudioContext';

interface OverviewPanelProps {
  onNavigateTab: (tab: string) => void;
}

export function OverviewPanel({ onNavigateTab }: OverviewPanelProps) {
  const {
    pages,
    portfolioItems,
    projects,
    services,
    testimonials,
    inquiries,
    activityLogs,
    mediaAssets,
    albums,
  } = useStudio();

  const newInquiries = inquiries.filter((i) => i.status === 'new').length;
  const publishedPages = pages.filter((p) => p.status === 'published').length;
  const draftPages = pages.filter((p) => p.status === 'draft').length;
  const publishedPhotos = portfolioItems.filter((p) => p.published !== false).length;
  const hiddenPhotos = portfolioItems.length - publishedPhotos;

  const inquiryBreakdown = useMemo(() => {
    const statuses: { key: string; label: string; color: string }[] = [
      { key: 'new', label: 'New', color: '#111111' },
      { key: 'contacted', label: 'Contacted', color: '#786651' },
      { key: 'confirmed', label: 'Confirmed', color: '#9E896F' },
      { key: 'completed', label: 'Completed', color: '#3F6212' },
      { key: 'archived', label: 'Archived', color: '#A8A29E' },
    ];
    return statuses.map((s) => ({
      ...s,
      count: inquiries.filter((i) => i.status === s.key).length,
    }));
  }, [inquiries]);

  // 7-day inquiry trend SVG series based on inquiry timestamps
  const trendBars = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    const now = new Date();
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(now);
      d.setDate(now.getDate() - offset);
      const dayKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString(undefined, { weekday: 'short' });
      const count = inquiries.filter((inq) => {
        const ts = inq.createdAt as { toDate?: () => Date } | undefined;
        if (!ts?.toDate) return false;
        return ts.toDate().toISOString().slice(0, 10) === dayKey;
      }).length;
      days.push({ label, count });
    }
    return days;
  }, [inquiries]);

  const maxTrend = Math.max(1, ...trendBars.map((b) => b.count));

  const kpis = [
    {
      label: 'Total Pages',
      value: pages.length,
      sub: `${publishedPages} published · ${draftPages} draft`,
      icon: <FileText className="w-4 h-4 text-[#786651]" />,
      tab: 'pages',
    },
    {
      label: 'Portfolio Images',
      value: portfolioItems.length,
      sub: `${publishedPhotos} live · ${albums.length} albums`,
      icon: <Camera className="w-4 h-4 text-[#786651]" />,
      tab: 'portfolio',
    },
    {
      label: 'Projects',
      value: projects.length,
      sub: `${projects.filter((p) => p.published !== false).length} published monographs`,
      icon: <FolderKanban className="w-4 h-4 text-[#786651]" />,
      tab: 'projects',
    },
    {
      label: 'Services',
      value: services.length,
      sub: `${services.filter((s) => s.enabled !== false).length} active tiers`,
      icon: <Layers className="w-4 h-4 text-[#786651]" />,
      tab: 'services',
    },
    {
      label: 'Testimonials',
      value: testimonials.length,
      sub: `${testimonials.filter((t) => t.published !== false).length} visible reviews`,
      icon: <MessageSquareQuote className="w-4 h-4 text-[#786651]" />,
      tab: 'testimonials',
    },
    {
      label: 'Total Inquiries',
      value: inquiries.length,
      sub: `${newInquiries} awaiting reply`,
      icon: <Inbox className="w-4 h-4 text-[#786651]" />,
      tab: 'inquiries',
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <button
            key={kpi.label}
            type="button"
            onClick={() => onNavigateTab(kpi.tab)}
            className="bg-white border border-[#E5DFD5] hover:border-[#111111] p-4 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-[0.12em] text-[#6E675E] font-medium">
                {kpi.label}
              </span>
              {kpi.icon}
            </div>
            <p className="mt-2 font-mono text-2xl tabular-nums text-[#111111]">{kpi.value}</p>
            <p className="mt-1 text-[11px] text-[#8A8277]">{kpi.sub}</p>
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 7-Day Inquiry Activity Chart */}
        <div className="lg:col-span-7 bg-white border border-[#E5DFD5] p-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EAE4D9]">
            <div>
              <h3 className="font-editorial text-2xl text-[#111111]">Inquiry Activity (7 Days)</h3>
              <p className="text-xs text-[#6E675E]">
                Daily client booking requests submitted via website contact form
              </p>
            </div>
            <span className="font-mono text-xs tabular-nums px-2.5 py-1 bg-[#F4F1EA] text-[#5E4E3B]">
              {newInquiries} New
            </span>
          </div>

          <div className="mt-6 h-48 flex items-end gap-3 pt-4">
            {trendBars.map((bar, idx) => {
              const pct = Math.max(8, Math.round((bar.count / maxTrend) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="font-mono text-xs tabular-nums text-[#4A4742]">{bar.count}</span>
                  <div className="w-full max-w-[44px] bg-[#F4F1EA] flex items-end h-32">
                    <div
                      style={{ height: `${pct}%` }}
                      className="w-full bg-[#111111] transition-all duration-300"
                    />
                  </div>
                  <span className="text-[11px] text-[#6E675E]">{bar.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content & Pipeline Status */}
        <div className="lg:col-span-5 bg-white border border-[#E5DFD5] p-6 flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-[#EAE4D9]">
              <h3 className="font-editorial text-2xl text-[#111111]">Pipeline &amp; Content</h3>
              <p className="text-xs text-[#6E675E]">
                Booking status breakdown &amp; media readiness
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {inquiryBreakdown.map((item) => {
                const widthPct =
                  inquiries.length > 0 ? Math.round((item.count / inquiries.length) * 100) : 0;
                return (
                  <div key={item.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#4A4742] font-medium">{item.label}</span>
                      <span className="font-mono tabular-nums text-[#111111]">
                        {item.count} ({widthPct}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#F4F1EA] w-full overflow-hidden">
                      <div
                        style={{ width: `${widthPct}%`, backgroundColor: item.color }}
                        className="h-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EAE4D9] grid grid-cols-3 gap-3 text-center">
            <div className="p-2.5 bg-[#FAF8F5]">
              <p className="font-mono text-lg tabular-nums text-[#111111]">{publishedPhotos}</p>
              <p className="text-[11px] text-[#6E675E]">Published Frames</p>
            </div>
            <div className="p-2.5 bg-[#FAF8F5]">
              <p className="font-mono text-lg tabular-nums text-[#111111]">{hiddenPhotos}</p>
              <p className="text-[11px] text-[#6E675E]">Hidden Frames</p>
            </div>
            <div className="p-2.5 bg-[#FAF8F5]">
              <p className="font-mono text-lg tabular-nums text-[#111111]">{mediaAssets.length}</p>
              <p className="text-[11px] text-[#6E675E]">Media Assets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Inquiries & Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white border border-[#E5DFD5] p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EAE4D9]">
            <h3 className="font-editorial text-2xl text-[#111111]">Recent Booking Inquiries</h3>
            <button
              type="button"
              onClick={() => onNavigateTab('inquiries')}
              className="text-xs uppercase tracking-[0.11em] text-[#786651] hover:text-[#111111] underline cursor-pointer"
            >
              Manage All
            </button>
          </div>
          {inquiries.length === 0 ? (
            <p className="py-8 text-sm text-[#6E675E]">No booking inquiries submitted yet.</p>
          ) : (
            <div className="divide-y divide-[#EAE4D9]">
              {inquiries.slice(0, 5).map((inq) => (
                <div key={inq.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[#111111] truncate">{inq.name}</p>
                    <p className="text-xs text-[#6E675E] truncate">
                      {inq.serviceName} · {inq.location}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] bg-[#F4F1EA] text-[#5E4E3B] font-mono">
                      {inq.status}
                    </span>
                    <p className="text-[11px] font-mono text-[#8A8277] mt-1">{inq.eventDate}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-6 bg-white border border-[#E5DFD5] p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EAE4D9]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#786651]" />
              <h3 className="font-editorial text-2xl text-[#111111]">Recent CMS Activity</h3>
            </div>
            <Sparkles className="w-4 h-4 text-[#D4C3AA]" />
          </div>

          {activityLogs.length === 0 ? (
            <p className="py-8 text-sm text-[#6E675E]">
              Every edit to pages, galleries, and settings will appear here automatically.
            </p>
          ) : (
            <div className="divide-y divide-[#EAE4D9]">
              {activityLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="min-w-0">
                    <p className="text-[#111111] font-medium truncate">
                      {log.action}: <span className="text-[#786651]">{log.target}</span>
                    </p>
                    <p className="text-[11px] text-[#8A8277] font-mono truncate">{log.actorEmail}</p>
                  </div>
                  <span className="text-[11px] text-[#8A8277] shrink-0">Live</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
