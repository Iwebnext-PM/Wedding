import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  onAuthStateChanged,
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
  DEFAULT_CATEGORIES,
  DEFAULT_PORTFOLIO_ITEMS,
  DEFAULT_PROJECTS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_TESTIMONIALS,
} from '../data/seedData';
import type {
  AdminUser,
  Category,
  Inquiry,
  InquiryStatus,
  PortfolioItem,
  Project,
  Service,
  SiteSettings,
  Testimonial,
} from '../types/studio';

interface StudioContextValue {
  loading: boolean;
  isCloudSeeded: boolean;
  siteSettings: SiteSettings;
  categories: Category[];
  portfolioItems: PortfolioItem[];
  projects: Project[];
  services: Service[];
  testimonials: Testimonial[];
  inquiries: Inquiry[];
  adminUsers: AdminUser[];

  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  seedDefaultCatalog: () => Promise<void>;
  saveSiteSettings: (data: Omit<SiteSettings, 'id' | 'updatedAt'>) => Promise<void>;
  saveCategory: (id: string, data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  savePortfolioItem: (id: string, data: Omit<PortfolioItem, 'id' | 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deletePortfolioItem: (id: string) => Promise<void>;
  saveProject: (id: string, data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  saveService: (id: string, data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  saveTestimonial: (id: string, data: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>, isNew: boolean) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
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
  addAdminUser: (uid: string, email: string, displayName: string) => Promise<void>;
  removeAdminUser: (uid: string) => Promise<void>;
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
  const [cloudPortfolio, setCloudPortfolio] = useState<PortfolioItem[]>([]);
  const [cloudProjects, setCloudProjects] = useState<Project[]>([]);
  const [cloudServices, setCloudServices] = useState<Service[]>([]);
  const [cloudTestimonials, setCloudTestimonials] = useState<Testimonial[]>([]);

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdminDocPresent, setIsAdminDocPresent] = useState(false);

  // Verify initial connection to Firestore on boot
  useEffect(() => {
    void testFirestoreConnection();
  }, []);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser && nextUser.emailVerified) {
        if (nextUser.email === BOOTSTRAPPED_ADMIN_EMAIL) {
          setIsAdminDocPresent(true);
        } else {
          try {
            const snap = await getDoc(doc(db, 'admins', nextUser.uid));
            setIsAdminDocPresent(snap.exists());
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

  // Public content real-time listeners
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
          setCloudSettings({ id: snap.id, ...(snap.data() as Omit<SiteSettings, 'id'>) });
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
      unsubPortfolio();
      unsubProjects();
      unsubServices();
      unsubTestimonials();
    };
  }, []);

  // Admin-only listeners (PII protected inquiries + admins)
  useEffect(() => {
    if (!authReady || !isAdmin) {
      setInquiries([]);
      setAdminUsers([]);
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

    const unsubAdmins = onSnapshot(
      collection(db, 'admins'),
      (snap) => {
        setAdminUsers(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AdminUser, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'admins')
    );

    return () => {
      unsubInquiries();
      unsubAdmins();
    };
  }, [authReady, isAdmin]);

  // Effective resolved data: uses Firestore live data when cloud is seeded, otherwise curated defaults
  const siteSettings = useMemo(
    () => cloudSettings ?? DEFAULT_SITE_SETTINGS,
    [cloudSettings]
  );

  const categories = useMemo(
    () => (isCloudSeeded ? cloudCategories : DEFAULT_CATEGORIES),
    [isCloudSeeded, cloudCategories]
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

  // Sync SEO metadata dynamically from SiteSettings
  useEffect(() => {
    if (siteSettings.seoTitle) {
      document.title = siteSettings.seoTitle;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const twTitle = document.querySelector('meta[name="twitter:title"]');
      if (ogTitle) ogTitle.setAttribute('content', siteSettings.seoTitle);
      if (twTitle) twTitle.setAttribute('content', siteSettings.seoTitle);
    }
    if (siteSettings.seoDescription) {
      const desc = document.querySelector('meta[name="description"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (desc) desc.setAttribute('content', siteSettings.seoDescription);
      if (ogDesc) ogDesc.setAttribute('content', siteSettings.seoDescription);
      if (twDesc) twDesc.setAttribute('content', siteSettings.seoDescription);
    }
  }, [siteSettings.seoTitle, siteSettings.seoDescription]);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    await signOut(auth);
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

    try {
      await batch1.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'siteSettings/studio+categories');
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

    try {
      await batch2.commit();
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
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `categories/${id}`);
    }
  };

  const deleteCategory = async (id: string) => {
    await ensureCloudInitialized();
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
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
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `portfolioItems/${id}`);
    }
  };

  const deletePortfolioItem = async (id: string) => {
    await ensureCloudInitialized();
    try {
      await deleteDoc(doc(db, 'portfolioItems', id));
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
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `projects/${id}`);
    }
  };

  const deleteProject = async (id: string) => {
    await ensureCloudInitialized();
    try {
      await deleteDoc(doc(db, 'projects', id));
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
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `services/${id}`);
    }
  };

  const deleteService = async (id: string) => {
    await ensureCloudInitialized();
    try {
      await deleteDoc(doc(db, 'services', id));
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
    } catch (err) {
      handleFirestoreError(err, isNew ? OperationType.CREATE : OperationType.UPDATE, `testimonials/${id}`);
    }
  };

  const deleteTestimonial = async (id: string) => {
    await ensureCloudInitialized();
    try {
      await deleteDoc(doc(db, 'testimonials', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `testimonials/${id}`);
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
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inquiries/${id}`);
    }
  };

  const deleteInquiry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'inquiries', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `inquiries/${id}`);
    }
  };

  const addAdminUser = async (uid: string, email: string, displayName: string) => {
    const cleanUid = uid.trim();
    try {
      await setDoc(doc(db, 'admins', cleanUid), {
        email: email.trim().slice(0, 160),
        displayName: displayName.trim().slice(0, 100),
        addedBy: user?.uid || 'admin',
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `admins/${cleanUid}`);
    }
  };

  const removeAdminUser = async (uid: string) => {
    try {
      await deleteDoc(doc(db, 'admins', uid));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `admins/${uid}`);
    }
  };

  return (
    <StudioContext.Provider
      value={{
        loading,
        isCloudSeeded,
        siteSettings,
        categories,
        portfolioItems,
        projects,
        services,
        testimonials,
        inquiries,
        adminUsers,
        user,
        authReady,
        isAdmin,
        signInWithGoogle,
        logout,
        seedDefaultCatalog,
        saveSiteSettings,
        saveCategory,
        deleteCategory,
        savePortfolioItem,
        deletePortfolioItem,
        saveProject,
        deleteProject,
        saveService,
        deleteService,
        saveTestimonial,
        deleteTestimonial,
        submitInquiry,
        updateInquiry,
        deleteInquiry,
        addAdminUser,
        removeAdminUser,
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
