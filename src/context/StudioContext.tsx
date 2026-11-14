import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  testFirestoreConnection,
} from '../lib/firebase';
import {
  DEFAULT_ALBUMS,
  DEFAULT_CATEGORIES,
  DEFAULT_MEDIA_ASSETS,
  DEFAULT_PAGES,
  DEFAULT_PORTFOLIO_ITEMS,
  DEFAULT_PROJECTS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_TESTIMONIALS,
} from '../data/seedData';
import type {
  ActivityLog,
  AdminRole,
  AdminUser,
  Album,
  Category,
  CustomPage,
  Inquiry,
  InquiryStatus,
  MediaAsset,
  PortfolioItem,
  Project,
  Service,
  SiteSettings,
  Testimonial,
} from '../types/studio';

export interface BackupSnapshot {
  version: string;
  exportedAt: string;
  siteSettings: Omit<SiteSettings, 'id' | 'updatedAt'>;
  categories: Omit<Category, 'createdAt' | 'updatedAt'>[];
  albums: Omit<Album, 'createdAt' | 'updatedAt'>[];
  portfolioItems: Omit<PortfolioItem, 'createdAt' | 'updatedAt'>[];
  projects: Omit<Project, 'createdAt' | 'updatedAt'>[];
  services: Omit<Service, 'createdAt' | 'updatedAt'>[];
  testimonials: Omit<Testimonial, 'createdAt' | 'updatedAt'>[];
  pages: Omit<CustomPage, 'createdAt' | 'updatedAt'>[];
  mediaAssets: Omit<MediaAsset, 'createdAt' | 'updatedAt'>[];
}

interface StudioContextValue {
  loading: boolean;
  isCloudSeeded: boolean;
  siteSettings: SiteSettings;
  categories: Category[];
  albums: Album[];
  portfolioItems: PortfolioItem[];
  projects: Project[];
  services: Service[];
  testimonials: Testimonial[];
  pages: CustomPage[];
  mediaAssets: MediaAsset[];
  inquiries: Inquiry[];
  adminUsers: AdminUser[];
  activityLogs: ActivityLog[];

  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  currentAdminRole: AdminRole;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendAdminPasswordReset: (email: string) => Promise<void>;

  seedDefaultCatalog: () => Promise<void>;
  saveSiteSettings: (data: Omit<SiteSettings, 'id' | 'updatedAt'>) => Promise<void>;
  saveCategory: (id: string, data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveAlbum: (id: string, data: Omit<Album, 'id' | 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
  savePortfolioItem: (id: string, data: Omit<PortfolioItem, 'id' | 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deletePortfolioItem: (id: string) => Promise<void>;
  saveProject: (id: string, data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  saveService: (id: string, data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  saveTestimonial: (id: string, data: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  savePage: (id: string, data: Omit<CustomPage, 'id' | 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  saveMediaAsset: (id: string, data: Omit<MediaAsset, 'id' | 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deleteMediaAsset: (id: string) => Promise<void>;
  submitInquiry: (data: {
    name: string;
    email: string;
    phone: string;
    eventDate: string;
    serviceName: string;
    location: string;
    message: string;
  }) => Promise<void>;
  updateInquiry: (id: string, status: InquiryStatus, adminNotes: string) => Promise<void>;
  deleteInquiry: (id: string) => Promise<void>;
  addAdminUser: (uid: string, email: string, displayName: string, role?: AdminRole) => Promise<void>;
  updateAdminUserRole: (uid: string, role: AdminRole) => Promise<void>;
  removeAdminUser: (uid: string) => Promise<void>;
  createBackupSnapshot: () => BackupSnapshot;
  restoreBackupSnapshot: (snapshot: BackupSnapshot) => Promise<void>;
}

const StudioContext = createContext<StudioContextValue | undefined>(undefined);

function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}

export function StudioProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isCloudSeeded, setIsCloudSeeded] = useState(false);

  const [cloudSettings, setCloudSettings] = useState<SiteSettings | null>(null);
  const [cloudCategories, setCloudCategories] = useState<Category[]>([]);
  const [cloudAlbums, setCloudAlbums] = useState<Album[]>([]);
  const [cloudPortfolio, setCloudPortfolio] = useState<PortfolioItem[]>([]);
  const [cloudProjects, setCloudProjects] = useState<Project[]>([]);
  const [cloudServices, setCloudServices] = useState<Service[]>([]);
  const [cloudTestimonials, setCloudTestimonials] = useState<Testimonial[]>([]);
  const [cloudPages, setCloudPages] = useState<CustomPage[]>([]);
  const [cloudMediaAssets, setCloudMediaAssets] = useState<MediaAsset[]>([]);

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdminDocPresent, setIsAdminDocPresent] = useState(false);
  const [currentAdminRole, setCurrentAdminRole] = useState<AdminRole>('editor');

  useEffect(() => {
    void testFirestoreConnection();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser && nextUser.emailVerified) {
        if (nextUser.email === BOOTSTRAPPED_ADMIN_EMAIL) {
          setIsAdminDocPresent(true);
          setCurrentAdminRole('super_admin');
        } else {
          try {
            const snap = await getDoc(doc(db, 'admins', nextUser.uid));
            if (snap.exists()) {
              setIsAdminDocPresent(true);
              const data = snap.data() as Partial<AdminUser>;
              setCurrentAdminRole(data.role || 'editor');
            } else {
              setIsAdminDocPresent(false);
            }
          } catch {
            setIsAdminDocPresent(false);
          }
        }
      } else {
        setIsAdminDocPresent(false);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const isAdmin = useMemo(() => {
    if (!user || !user.emailVerified) return false;
    return user.email === BOOTSTRAPPED_ADMIN_EMAIL || isAdminDocPresent;
  }, [user, isAdminDocPresent]);

  // Public listeners
  useEffect(() => {
    let resolvedInitial = false;
    const markReady = () => {
      if (!resolvedInitial) {
        resolvedInitial = true;
        setLoading(false);
      }
    };

    const unsubSettings = onSnapshot(
      doc(db, 'siteSettings', 'studio'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Omit<SiteSettings, 'id'>;
          setCloudSettings({
            ...DEFAULT_SITE_SETTINGS,
            ...data,
            id: snap.id,
          });
          setIsCloudSeeded(true);
        } else {
          setCloudSettings(null);
          setIsCloudSeeded(false);
        }
        markReady();
      },
      (err) => {
        markReady();
        handleFirestoreError(err, OperationType.GET, 'siteSettings/studio');
      }
    );

    const unsubCategories = onSnapshot(
      query(collection(db, 'categories'), orderBy('order', 'asc')),
      (snap) => {
        setCloudCategories(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Category, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'categories')
    );

    const unsubAlbums = onSnapshot(
      query(collection(db, 'albums'), orderBy('order', 'asc')),
      (snap) => {
        setCloudAlbums(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Album, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'albums')
    );

    const unsubPortfolio = onSnapshot(
      query(collection(db, 'portfolioItems'), orderBy('order', 'asc')),
      (snap) => {
        setCloudPortfolio(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PortfolioItem, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'portfolioItems')
    );

    const unsubProjects = onSnapshot(
      query(collection(db, 'projects'), orderBy('order', 'asc')),
      (snap) => {
        setCloudProjects(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Project, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'projects')
    );

    const unsubServices = onSnapshot(
      query(collection(db, 'services'), orderBy('order', 'asc')),
      (snap) => {
        setCloudServices(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Service, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'services')
    );

    const unsubTestimonials = onSnapshot(
      query(collection(db, 'testimonials'), orderBy('order', 'asc')),
      (snap) => {
        setCloudTestimonials(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Testimonial, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'testimonials')
    );

    return () => {
      unsubSettings();
      unsubCategories();
      unsubAlbums();
      unsubPortfolio();
      unsubProjects();
      unsubServices();
      unsubTestimonials();
    };
  }, []);

  // Pages listener (admins see all drafts+published; public visitors query status == 'published')
  useEffect(() => {
    if (!authReady) return;
    const pagesQuery = isAdmin
      ? query(collection(db, 'pages'), orderBy('order', 'asc'))
      : query(collection(db, 'pages'), where('status', '==', 'published'));

    const unsubPages = onSnapshot(
      pagesQuery,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CustomPage, 'id'>) }));
        list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCloudPages(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'pages')
    );
    return () => unsubPages();
  }, [authReady, isAdmin]);

  // Admin-only listeners
  useEffect(() => {
    if (!authReady || !isAdmin) {
      setInquiries([]);
      setAdminUsers([]);
      setCloudMediaAssets([]);
      setActivityLogs([]);
      return;
    }

    const unsubInquiries = onSnapshot(
      query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')),
      (snap) => {
        setInquiries(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Inquiry, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'inquiries')
    );

    const unsubMedia = onSnapshot(
      query(collection(db, 'mediaAssets'), orderBy('createdAt', 'desc')),
      (snap) => {
        setCloudMediaAssets(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MediaAsset, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'mediaAssets')
    );

    const unsubAdmins = onSnapshot(
      collection(db, 'admins'),
      (snap) => {
        setAdminUsers(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AdminUser, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'admins')
    );

    const unsubLogs = onSnapshot(
      query(collection(db, 'activityLogs'), orderBy('createdAt', 'desc')),
      (snap) => {
        setActivityLogs(
          snap.docs.slice(0, 30).map((d) => ({
            id: d.id,
            ...(d.data() as Omit<ActivityLog, 'id'>),
          }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'activityLogs')
    );

    return () => {
      unsubInquiries();
      unsubMedia();
      unsubAdmins();
      unsubLogs();
    };
  }, [authReady, isAdmin]);

  const siteSettings = useMemo(
    () => cloudSettings ?? DEFAULT_SITE_SETTINGS,
    [cloudSettings]
  );
  const categories = useMemo(
    () => (isCloudSeeded ? cloudCategories : DEFAULT_CATEGORIES),
    [isCloudSeeded, cloudCategories]
  );
  const albums = useMemo(
    () => (isCloudSeeded ? cloudAlbums : DEFAULT_ALBUMS),
    [isCloudSeeded, cloudAlbums]
  );
  const portfolioItems = useMemo(
    () => (isCloudSeeded ? cloudPortfolio : DEFAULT_PORTFOLIO_ITEMS),
    [isCloudSeeded, cloudPortfolio]
  );
  const projects = useMemo(
    () => (isCloudSeeded ? cloudProjects : DEFAULT_PROJECTS),
    [isCloudSeeded, cloudProjects]
  );
  const services = useMemo(
    () => (isCloudSeeded ? cloudServices : DEFAULT_SERVICES),
    [isCloudSeeded, cloudServices]
  );
  const testimonials = useMemo(
    () => (isCloudSeeded ? cloudTestimonials : DEFAULT_TESTIMONIALS),
    [isCloudSeeded, cloudTestimonials]
  );
  const pages = useMemo(
    () => (isCloudSeeded ? cloudPages : DEFAULT_PAGES),
    [isCloudSeeded, cloudPages]
  );
  const mediaAssets = useMemo(
    () => (isCloudSeeded ? cloudMediaAssets : DEFAULT_MEDIA_ASSETS),
    [isCloudSeeded, cloudMediaAssets]
  );

  // Sync SEO metadata, favicon, and theme CSS variables dynamically
  useEffect(() => {
    if (siteSettings.seoTitle) {
      document.title = siteSettings.seoTitle;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const twTitle = document.querySelector('meta[name="twitter:title"]');
      if (ogTitle) ogTitle.setAttribute('content', siteSettings.seoOgTitle || siteSettings.seoTitle);
      if (twTitle) twTitle.setAttribute('content', siteSettings.seoOgTitle || siteSettings.seoTitle);
    }
    if (siteSettings.seoDescription) {
      const desc = document.querySelector('meta[name="description"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (desc) desc.setAttribute('content', siteSettings.seoDescription);
      if (ogDesc) ogDesc.setAttribute('content', siteSettings.seoOgDescription || siteSettings.seoDescription);
      if (twDesc) twDesc.setAttribute('content', siteSettings.seoOgDescription || siteSettings.seoDescription);
    }
    if (siteSettings.faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = siteSettings.faviconUrl;
    }
    if (siteSettings.primaryColor) {
      document.documentElement.style.setProperty('--twins-primary', siteSettings.primaryColor);
    }
    if (siteSettings.secondaryColor) {
      document.documentElement.style.setProperty('--twins-accent', siteSettings.secondaryColor);
    }
  }, [
    siteSettings.seoTitle,
    siteSettings.seoDescription,
    siteSettings.seoOgTitle,
    siteSettings.seoOgDescription,
    siteSettings.faviconUrl,
    siteSettings.primaryColor,
    siteSettings.secondaryColor,
  ]);

  const logActivity = async (action: string, target: string) => {
    if (!isAdmin || !user?.email) return;
    const id = `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      await setDoc(doc(db, 'activityLogs', id), {
        actorEmail: user.email.slice(0, 160),
        action: action.slice(0, 140),
        target: target.slice(0, 140),
        createdAt: serverTimestamp(),
      });
    } catch {
      // Non-blocking audit log
    }
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const sendAdminPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  const seedDefaultCatalog = async () => {
    const batch1 = writeBatch(db);
    const { id: _settingId, updatedAt: _u, ...settingsPayload } = DEFAULT_SITE_SETTINGS;
    batch1.set(doc(db, 'siteSettings', 'studio'), {
      ...stripUndefined(settingsPayload),
      updatedAt: serverTimestamp(),
    });

    for (const cat of DEFAULT_CATEGORIES) {
      const { id, createdAt: _c, updatedAt: _cu, ...catPayload } = cat;
      batch1.set(doc(db, 'categories', id), {
        ...stripUndefined(catPayload),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    for (const alb of DEFAULT_ALBUMS) {
      const { id, createdAt: _c, updatedAt: _cu, ...albPayload } = alb;
      batch1.set(doc(db, 'albums', id), {
        ...stripUndefined(albPayload),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    try {
      await batch1.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'seed_catalog_batch1');
    }

    const batch2 = writeBatch(db);
    for (const item of DEFAULT_PORTFOLIO_ITEMS) {
      const { id, createdAt: _c, updatedAt: _u2, ...payload } = item;
      batch2.set(doc(db, 'portfolioItems', id), {
        ...stripUndefined(payload),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const proj of DEFAULT_PROJECTS) {
      const { id, createdAt: _c, updatedAt: _u2, ...payload } = proj;
      batch2.set(doc(db, 'projects', id), {
        ...stripUndefined(payload),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const srv of DEFAULT_SERVICES) {
      const { id, createdAt: _c, updatedAt: _u2, ...payload } = srv;
      batch2.set(doc(db, 'services', id), {
        ...stripUndefined(payload),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const test of DEFAULT_TESTIMONIALS) {
      const { id, createdAt: _c, updatedAt: _u2, ...payload } = test;
      batch2.set(doc(db, 'testimonials', id), {
        ...stripUndefined(payload),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const pg of DEFAULT_PAGES) {
      const { id, createdAt: _c, updatedAt: _u2, ...payload } = pg;
      batch2.set(doc(db, 'pages', id), {
        ...stripUndefined(payload),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const asset of DEFAULT_MEDIA_ASSETS) {
      const { id, createdAt: _c, updatedAt: _u2, ...payload } = asset;
      batch2.set(doc(db, 'mediaAssets', id), {
        ...stripUndefined(payload),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    try {
      await batch2.commit();
      await logActivity('Synced starter catalog', 'Firestore Studio DB');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'seed_catalog_batch2');
    }
  };

  const ensureCloudInitialized = async () => {
    if (!isCloudSeeded) {
      await seedDefaultCatalog();
    }
  };

  const saveSiteSettings = async (data: Omit<SiteSettings, 'id' | 'updatedAt'>) => {
    try {
      await setDoc(doc(db, 'siteSettings', 'studio'), {
        ...stripUndefined(data),
        updatedAt: serverTimestamp(),
      });
      await logActivity('Updated website settings & layout', data.brandName || 'TWINS');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'siteSettings/studio');
    }
  };

  const saveCategory = async (
    id: string,
    data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) => {
    await ensureCloudInitialized();
    const ref = doc(db, 'categories', id);
    try {
      if (isNew) {
        await setDoc(ref, {
          ...stripUndefined(data),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(ref, {
          ...stripUndefined(data),
          updatedAt: serverTimestamp(),
        });
      }
      await logActivity(isNew ? 'Created category' : 'Updated category', data.name);
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `categories/${id}`);
    }
  };

  const deleteCategory = async (id: string) => {
    await ensureCloudInitialized();
    try {
      await deleteDoc(doc(db, 'categories', id));
      await logActivity('Deleted category', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  };

  const saveAlbum = async (
    id: string,
    data: Omit<Album, 'id' | 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) => {
    await ensureCloudInitialized();
    const ref = doc(db, 'albums', id);
    try {
      if (isNew) {
        await setDoc(ref, {
          ...stripUndefined(data),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(ref, {
          ...stripUndefined(data),
          updatedAt: serverTimestamp(),
        });
      }
      await logActivity(isNew ? 'Created album' : 'Updated album', data.title);
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `albums/${id}`);
    }
  };

  const deleteAlbum = async (id: string) => {
    await ensureCloudInitialized();
    try {
      await deleteDoc(doc(db, 'albums', id));
      await logActivity('Deleted album', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `albums/${id}`);
    }
  };

  const savePortfolioItem = async (
    id: string,
    data: Omit<PortfolioItem, 'id' | 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) => {
    await ensureCloudInitialized();
    const ref = doc(db, 'portfolioItems', id);
    try {
      if (isNew) {
        await setDoc(ref, {
          ...stripUndefined(data),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(ref, {
          ...stripUndefined(data),
          updatedAt: serverTimestamp(),
        });
      }
      await logActivity(isNew ? 'Published photograph' : 'Updated photograph', data.title);
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `portfolioItems/${id}`);
    }
  };

  const deletePortfolioItem = async (id: string) => {
    await ensureCloudInitialized();
    try {
      await deleteDoc(doc(db, 'portfolioItems', id));
      await logActivity('Deleted photograph', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `portfolioItems/${id}`);
    }
  };

  const saveProject = async (
    id: string,
    data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) => {
    await ensureCloudInitialized();
    const ref = doc(db, 'projects', id);
    try {
      if (isNew) {
        await setDoc(ref, {
          ...stripUndefined(data),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(ref, {
          ...stripUndefined(data),
          updatedAt: serverTimestamp(),
        });
      }
      await logActivity(isNew ? 'Created project' : 'Updated project', data.title);
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `projects/${id}`);
    }
  };

  const deleteProject = async (id: string) => {
    await ensureCloudInitialized();
    try {
      await deleteDoc(doc(db, 'projects', id));
      await logActivity('Deleted project', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
    }
  };

  const saveService = async (
    id: string,
    data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) => {
    await ensureCloudInitialized();
    const ref = doc(db, 'services', id);
    try {
      if (isNew) {
        await setDoc(ref, {
          ...stripUndefined(data),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(ref, {
          ...stripUndefined(data),
          updatedAt: serverTimestamp(),
        });
      }
      await logActivity(isNew ? 'Added service' : 'Updated service', data.title);
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `services/${id}`);
    }
  };

  const deleteService = async (id: string) => {
    await ensureCloudInitialized();
    try {
      await deleteDoc(doc(db, 'services', id));
      await logActivity('Deleted service', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `services/${id}`);
    }
  };

  const saveTestimonial = async (
    id: string,
    data: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) => {
    await ensureCloudInitialized();
    const ref = doc(db, 'testimonials', id);
    try {
      if (isNew) {
        await setDoc(ref, {
          ...stripUndefined(data),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(ref, {
          ...stripUndefined(data),
          updatedAt: serverTimestamp(),
        });
      }
      await logActivity(isNew ? 'Added testimonial' : 'Updated testimonial', data.clientName);
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `testimonials/${id}`);
    }
  };

  const deleteTestimonial = async (id: string) => {
    await ensureCloudInitialized();
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      await logActivity('Deleted testimonial', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `testimonials/${id}`);
    }
  };

  const savePage = async (
    id: string,
    data: Omit<CustomPage, 'id' | 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) => {
    await ensureCloudInitialized();
    const ref = doc(db, 'pages', id);
    try {
      if (isNew) {
        await setDoc(ref, {
          ...stripUndefined(data),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(ref, {
          ...stripUndefined(data),
          updatedAt: serverTimestamp(),
        });
      }
      await logActivity(isNew ? 'Created page' : 'Updated page', data.title);
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `pages/${id}`);
    }
  };

  const deletePage = async (id: string) => {
    await ensureCloudInitialized();
    try {
      await deleteDoc(doc(db, 'pages', id));
      await logActivity('Deleted page', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `pages/${id}`);
    }
  };

  const saveMediaAsset = async (
    id: string,
    data: Omit<MediaAsset, 'id' | 'createdAt' | 'updatedAt'>,
    isNew: boolean
  ) => {
    await ensureCloudInitialized();
    const ref = doc(db, 'mediaAssets', id);
    try {
      if (isNew) {
        await setDoc(ref, {
          ...stripUndefined(data),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(ref, {
          ...stripUndefined(data),
          updatedAt: serverTimestamp(),
        });
      }
      await logActivity(isNew ? 'Uploaded media' : 'Updated media', data.name);
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `mediaAssets/${id}`);
    }
  };

  const deleteMediaAsset = async (id: string) => {
    await ensureCloudInitialized();
    try {
      await deleteDoc(doc(db, 'mediaAssets', id));
      await logActivity('Deleted media asset', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `mediaAssets/${id}`);
    }
  };

  const submitInquiry = async (data: {
    name: string;
    email: string;
    phone: string;
    eventDate: string;
    serviceName: string;
    location: string;
    message: string;
  }) => {
    const id = `inq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    try {
      await setDoc(doc(db, 'inquiries', id), {
        name: data.name.trim().slice(0, 100),
        email: data.email.trim().slice(0, 160),
        phone: data.phone.trim().slice(0, 40),
        eventDate: data.eventDate.trim().slice(0, 40),
        serviceName: data.serviceName.trim().slice(0, 120),
        location: data.location.trim().slice(0, 160),
        message: data.message.trim().slice(0, 2000),
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `inquiries/${id}`);
    }
  };

  const updateInquiry = async (id: string, status: InquiryStatus, adminNotes: string) => {
    try {
      await updateDoc(doc(db, 'inquiries', id), {
        status,
        adminNotes: adminNotes.trim().slice(0, 1000),
        updatedAt: serverTimestamp(),
      });
      await logActivity(`Updated inquiry status to ${status}`, id);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inquiries/${id}`);
    }
  };

  const deleteInquiry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inquiries', id));
      await logActivity('Deleted inquiry', id);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `inquiries/${id}`);
    }
  };

  const addAdminUser = async (
    uid: string,
    email: string,
    displayName: string,
    role: AdminRole = 'editor'
  ) => {
    const cleanUid = uid.trim();
    try {
      await setDoc(doc(db, 'admins', cleanUid), {
        email: email.trim().slice(0, 160),
        displayName: displayName.trim().slice(0, 100),
        role,
        addedBy: user?.uid || 'admin',
        createdAt: serverTimestamp(),
      });
      await logActivity(`Granted ${role} access`, email);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `admins/${cleanUid}`);
    }
  };

  const updateAdminUserRole = async (uid: string, role: AdminRole) => {
    try {
      await updateDoc(doc(db, 'admins', uid), { role });
      await logActivity(`Changed admin role to ${role}`, uid);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `admins/${uid}`);
    }
  };

  const removeAdminUser = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'admins', uid));
      await logActivity('Revoked admin access', uid);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `admins/${uid}`);
    }
  };

  const createBackupSnapshot = (): BackupSnapshot => {
    const { id: _sId, updatedAt: _sUp, ...cleanSettings } = siteSettings;
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      siteSettings: cleanSettings,
      categories: categories.map(({ createdAt: _c, updatedAt: _u, ...rest }) => rest),
      albums: albums.map(({ createdAt: _c, updatedAt: _u, ...rest }) => rest),
      portfolioItems: portfolioItems.map(({ createdAt: _c, updatedAt: _u, ...rest }) => rest),
      projects: projects.map(({ createdAt: _c, updatedAt: _u, ...rest }) => rest),
      services: services.map(({ createdAt: _c, updatedAt: _u, ...rest }) => rest),
      testimonials: testimonials.map(({ createdAt: _c, updatedAt: _u, ...rest }) => rest),
      pages: pages.map(({ createdAt: _c, updatedAt: _u, ...rest }) => rest),
      mediaAssets: mediaAssets.map(({ createdAt: _c, updatedAt: _u, ...rest }) => rest),
    };
  };

  const restoreBackupSnapshot = async (snapshot: BackupSnapshot) => {
    const batch1 = writeBatch(db);
    batch1.set(doc(db, 'siteSettings', 'studio'), {
      ...stripUndefined(snapshot.siteSettings as Record<string, unknown>),
      updatedAt: serverTimestamp(),
    });
    for (const cat of snapshot.categories || []) {
      const { id, ...rest } = cat;
      batch1.set(doc(db, 'categories', id), {
        ...stripUndefined(rest as Record<string, unknown>),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const alb of snapshot.albums || []) {
      const { id, ...rest } = alb;
      batch1.set(doc(db, 'albums', id), {
        ...stripUndefined(rest as Record<string, unknown>),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    try {
      await batch1.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'restore_batch1');
    }

    const batch2 = writeBatch(db);
    for (const item of snapshot.portfolioItems || []) {
      const { id, ...rest } = item;
      batch2.set(doc(db, 'portfolioItems', id), {
        ...stripUndefined(rest as Record<string, unknown>),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const proj of snapshot.projects || []) {
      const { id, ...rest } = proj;
      batch2.set(doc(db, 'projects', id), {
        ...stripUndefined(rest as Record<string, unknown>),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const srv of snapshot.services || []) {
      const { id, ...rest } = srv;
      batch2.set(doc(db, 'services', id), {
        ...stripUndefined(rest as Record<string, unknown>),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const test of snapshot.testimonials || []) {
      const { id, ...rest } = test;
      batch2.set(doc(db, 'testimonials', id), {
        ...stripUndefined(rest as Record<string, unknown>),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const pg of snapshot.pages || []) {
      const { id, ...rest } = pg;
      batch2.set(doc(db, 'pages', id), {
        ...stripUndefined(rest as Record<string, unknown>),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    for (const asset of snapshot.mediaAssets || []) {
      const { id, ...rest } = asset;
      batch2.set(doc(db, 'mediaAssets', id), {
        ...stripUndefined(rest as Record<string, unknown>),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    try {
      await batch2.commit();
      await logActivity('Restored studio backup', snapshot.exportedAt);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'restore_batch2');
    }
  };

  return (
    <StudioContext.Provider
      value={{
        loading,
        isCloudSeeded,
        siteSettings,
        categories,
        albums,
        portfolioItems,
        projects,
        services,
        testimonials,
        pages,
        mediaAssets,
        inquiries,
        adminUsers,
        activityLogs,
        user,
        authReady,
        isAdmin,
        currentAdminRole,
        signInWithGoogle,
        logout,
        sendAdminPasswordReset,
        seedDefaultCatalog,
        saveSiteSettings,
        saveCategory,
        deleteCategory,
        saveAlbum,
        deleteAlbum,
        savePortfolioItem,
        deletePortfolioItem,
        saveProject,
        deleteProject,
        saveService,
        deleteService,
        saveTestimonial,
        deleteTestimonial,
        savePage,
        deletePage,
        saveMediaAsset,
        deleteMediaAsset,
        submitInquiry,
        updateInquiry,
        deleteInquiry,
        addAdminUser,
        updateAdminUserRole,
        removeAdminUser,
        createBackupSnapshot,
        restoreBackupSnapshot,
      }}
    >
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) {
    throw new Error('useStudio must be used inside StudioProvider');
  }
  return ctx;
}
