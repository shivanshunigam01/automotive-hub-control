// API Configuration - Replace BASE_URL with actual API endpoint
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export function formatImageUrl(url: string | undefined): string {
  if (!url) return '/placeholder.svg';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) return url;
  return `${API_BASE_URL}/${url.replace(/\\/g, '/')}`;
}

/** Serves /uploads/... from the API host (VITE_FILE_BASE_URL or base URL with /api stripped). */
export function resolvePublicFileUrl(
  pathOrUrl: string | null | undefined
): string {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://'))
    return pathOrUrl;
  const rawBase =
    import.meta.env.VITE_FILE_BASE_URL ||
    String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '') ||
    '';
  const base = String(rawBase).replace(/\/$/, '');
  const p = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  if (!base) return p;
  return `${base}${p}`;
}

import type { UserRole, ModulePermissions } from './rbac';

// Types
export interface TCOItem {
  key: string;
  label: string;
  value: number;
  unit: "monthly" | "yearly" | "one-time";
}

export interface Product {
  id: string;

  brand: string;
  category: string;

  name: string;
  shortDescription: string;
  fullDescription?: string;

  price: number;
  priceDisplay?: string;

  images: string[];
  featuredImage?: string;

  specifications: Record<string, string>;
  keyFeatures?: string[];
  applications?: string[];

  /** ✅ TCO */
  tcoItems?: TCOItem[];

  isActive: boolean;
  isNewLaunch: boolean;
  isBestseller: boolean;
  isFeatured: boolean;

  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];

  createdAt: string;
  updatedAt: string;
  brochureUrl?: string;
brochureUpdatedAt?: string;
}

export interface UsedVehicle {
  id: string;

  vehicleType: string;
  brand: string;
  model: string;
  year: number;

  kilometers: number;
  hours?: number;

  price: number;
  ownership: string;
  fuelType: string;

  images: string[];

  /** ✅ UI EXPECTS THIS */
  condition: {
    engine: "Excellent" | "Good" | "Fair" | "Poor";
    transmission: "Excellent" | "Good" | "Fair" | "Poor";
    body: "Excellent" | "Good" | "Fair" | "Poor";
    tyres: string;
    notes?: string;
  };

  /** ✅ UI EXPECTS THIS */
  certifications: {
    inspection150Point: boolean;
    financeAvailable: boolean;
    returnPolicy: boolean;
  };

  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}



export interface Lead {
  id: string;
  customerName: string;
  email: string;
  mobile: string;
  productId?: string;
  productName?: string;
  brand?: string;
  source: string;
  sourcePage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedTo?: string;
  notes: string[];
  activities: Array<{
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceApplication {
  id: string;
  applicationNumber: string;
  email?: string; 
  customerName: string;
  mobile: string;
  district?: string;

  productId?: string;
  productName?: string;

  loanAmount: number;
  tenure?: number | null;

  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'disbursed';

  documents: Array<{
    type: string;
    url: string;
    uploadedAt: string;
  }>;

  createdAt: string;
  updatedAt: string;
}


export interface CibilCheck {
  id: string;
  customerName: string;
  mobile: string;
  panNumber: string;
  /** 12-digit Aadhaar as stored (admin). */
  aadhaarNumber?: string | null;
  /** Public path, e.g. /uploads/cibil-aadhaar/… */
  aadhaarDocumentUrl?: string | null;
  dateOfBirth?: string;
  score: number;
  scoreBand: 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Unknown';
  checkedAt: string;
  /** Public path to saved PDF, e.g. /uploads/cibil-reports/… — admin open/download. */
  cibilPdfReportUrl?: string | null;
}

export interface Dealer {
  _id: string;
  brand: string;
  name: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  phone: string;
  whatsapp?: string;
  email: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  roleLabel?: string;
  isActive: boolean;
  lastLogin?: string;
  permissions?: ModulePermissions;
  createdAt: string;
  updatedAt: string;
}
export interface MediaItem {
  id: string;
  url: string;
  thumbnail_url?: string;
  filename?: string;
  original_filename?: string;
  folder?: string;
  size?: number;
  mime_type?: string;
  created_at: string;
}

export interface Offer {
  _id: string;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  startDate: string;
  endDate: string;
  applicableBrand?: string;
  applicableCategory?: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentPage {
  id: string;
  key: string;
  titleEn: string;
  titleHi: string;
  contentEn: string;
  contentHi: string;
  updatedAt: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  youtube: string;
  linkedin: string;
}

export interface TrafficData {
  date: string;
  visitors: number;
  uniqueVisitors: number;
  pageViews: number;
}

export interface DashboardStats {
  totalLeads: number;
  newLeadsToday: number;
  financeApplications: number;
  cibilChecks: number;
  activeProducts: number;
  activeUsedVehicles: number;
  totalVisitors: number;
  todayVisitors: number;
  uniqueVisitors: number;
}

export interface ComparisonAnalytics {
  mostComparedProducts: Array<{
    productId: string;
    productName: string;
    comparisonCount: number;
  }>;
  productPairings: Array<{
    product1: string;
    product2: string;
    count: number;
  }>;
  brandComparisons: Array<{
    brand: string;
    count: number;
  }>;
}

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function isTokenExpired(): boolean {
  const savedAt = localStorage.getItem('admin_token_time');
  if (!savedAt) return true;
  return Date.now() - parseInt(savedAt, 10) > TOKEN_EXPIRY_MS;
}

function clearSession() {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  localStorage.removeItem('admin_token_time');
}

// API Helper
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('admin_token');

  // Auto-logout if token expired
  if (token && isTokenExpired()) {
    clearSession();
    window.location.href = '/admin/login';
    throw new Error('Session expired. Please login again.');
  }

  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  // 🔥 KEY FIX
  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearSession();
    window.location.href = '/admin/login';
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiRequest<{
      token: string;
      user: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Save token + timestamp
    localStorage.setItem('admin_token', response.token);
    localStorage.setItem('admin_user', JSON.stringify(response.user));
    localStorage.setItem('admin_token_time', Date.now().toString());

    return response;
  },

  logout: () => {
    clearSession();
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('admin_token');
  },

  getCurrentUser: (): AdminUser | null => {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  },
};

// Dashboard API
// ================= DASHBOARD API (REAL BACKEND) =================
export const dashboardApi = {
  // 🔹 Top stats cards
  getStats: async (): Promise<DashboardStats> => {
    const res = await apiRequest<{ data: DashboardStats }>("/dashboard/stats");
    return res.data;
  },

  // 🔹 Recent leads table
  getRecentLeads: async (): Promise<Lead[]> => {
    const res = await apiRequest<{ data: Lead[] }>("/dashboard/recent-leads");
    return res.data;
  },

  // 🔹 Leads over time (area chart)
  getLeadsOverTime: async (): Promise<Array<{ date: string; leads: number }>> => {
    const res = await apiRequest<{ data: any[] }>("/dashboard/leads-over-time");
    return res.data;
  },

  // 🔹 Finance status (pie chart)
  getFinanceStatus: async (): Promise<
    Array<{ status: string; count: number; fill: string }>
  > => {
    const res = await apiRequest<{ data: any[] }>("/dashboard/finance-status");
    return res.data;
  },

  // 🔹 Website traffic
  getWebsiteTraffic: async (): Promise<{
    totalVisitors: number;
    todayVisitors: number;
    uniqueVisitors: number;
    trafficTrend: Array<{ date: string; visitors: number }>;
  }> => {
    const res = await apiRequest<{ data: any }>("/dashboard/traffic");
    return res.data;
  },
};

// Products API
// Products API (REAL BACKEND)
export const productsApi = {
  // Admin + Public List
  getAll: async (params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<Product[]> => {
    const query = new URLSearchParams();

    if (params?.search) query.append("search", params.search);
    if (params?.isActive !== undefined) query.append("is_active", String(params.isActive));
    if (params?.page) query.append("page", String(params.page));
    if (params?.per_page) query.append("per_page", String(params.per_page));

    const res = await apiRequest<{
      data: Product[];
    }>(`/products?${query.toString()}`);

    return res.data;
  },

  // ✅ ADMIN: fetch product for edit
  getById: async (id: string): Promise<Product> => {
    const res = await apiRequest<{ data: Product }>(`/products/admin/${id}`);
    return res.data;
  },

  // ✅ WEBSITE: fetch by slug
  getBySlug: async (slug: string): Promise<Product> => {
    const res = await apiRequest<{ data: Product }>(`/products/slug/${slug}`);
    return res.data;
  },

// ✅ CREATE
create: async (formData: FormData): Promise<Product> => {
const res = await apiRequest<{ data: Product }>(`/products`, {
method: "POST",
body: formData,
});
return res.data;
},


// ✅ UPDATE
update: async (id: string, formData: FormData): Promise<Product> => {
const res = await apiRequest<{ data: Product }>(`/products/${id}`, {
method: "PUT",
body: formData,
});
return res.data;
},

  // ✅ DELETE
  delete: async (id: string): Promise<void> => {
    await apiRequest(`/products/${id}`, {
      method: "DELETE",
    });
  },

  // ✅ COMPARE
  compare: async (id1: string, id2: string) => {
    const res = await apiRequest<{
      data: {
        products: Product[];
        comparison_specs: string[];
      };
    }>(`/products/compare?ids=${id1},${id2}`);

    return res.data;
  },
};

// Leads API
export const leadsApi = {
  // ✅ LIST LEADS
  getAll: async (filters?: {
    status?: string;
    search?: string;
    source?: string;
    brand?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Lead[]> => {
    const params = new URLSearchParams();

    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.source) params.append("source", filters.source);
    if (filters?.brand) params.append("brand_interest", filters.brand);
    if (filters?.dateFrom) params.append("date_from", filters.dateFrom);
    if (filters?.dateTo) params.append("date_to", filters.dateTo);

    const res = await apiRequest<{ data: Lead[] }>(
      `/leads?${params.toString()}`
    );

    return res.data;
  },

  // ✅ GET SINGLE LEAD
  getById: async (id: string): Promise<Lead> => {
    const res = await apiRequest<{ data: Lead }>(`/leads/${id}`);
    return res.data;
  },

  // ✅ UPDATE STATUS
  updateStatus: async (
    id: string,
    status: Lead["status"]
  ): Promise<Lead> => {
    const res = await apiRequest<{ data: Lead }>(
      `/leads/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );

    return res.data;
  },

  // ✅ ADD NOTE
  addNote: async (id: string, note: string): Promise<Lead> => {
    const res = await apiRequest<{ data: Lead }>(
      `/leads/${id}/notes`,
      {
        method: "POST",
        body: JSON.stringify({ note }),
      }
    );

    return res.data;
  },
};


// Used Vehicles API
export const usedVehiclesApi = {
  getAll: async (): Promise<any[]> => {
    const res = await apiRequest<{ data: any[] }>("/used-vehicles");
    return res.data;
  },

  getById: async (id: string): Promise<any> => {
    const res = await apiRequest<{ data: any }>(`/used-vehicles/${id}`);
    return res.data;
  },

  create: async (formData: FormData): Promise<any> => {
    const res = await apiRequest<{ data: any }>(`/used-vehicles`, {
      method: "POST",
      body: formData,
    });
    return res.data;
  },

  update: async (id: string, formData: FormData): Promise<any> => {
    const res = await apiRequest<{ data: any }>(`/used-vehicles/${id}`, {
      method: "PUT",
      body: formData,
    });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/used-vehicles/${id}`, { method: "DELETE" });
  },
};



// Finance API
export const financeApi = {
  getAll: async (params?: { status?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);

    const res = await apiRequest<{
      data: FinanceApplication[];
    }>(`/finance/applications?${query.toString()}`);

    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiRequest<{ data: FinanceApplication }>(
      `/finance/applications/${id}`
    );
    return res.data;
  },

  updateStatus: async (
    id: string,
    status: FinanceApplication['status']
  ) => {
    const res = await apiRequest<{ data: FinanceApplication }>(
      `/finance/applications/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    );
    return res.data;
  },
};


// CIBIL API
export const cibilApi = {
  // ✅ LIST CIBIL CHECKS (REAL BACKEND)
  getAll: async (filters?: {
    search?: string;
    scoreMin?: number;
    scoreMax?: number;
    page?: number;
    per_page?: number;
  }): Promise<CibilCheck[]> => {
    const params = new URLSearchParams();

    if (filters?.search) params.append("search", filters.search);
    if (filters?.scoreMin !== undefined)
      params.append("min_score", String(filters.scoreMin));
    if (filters?.scoreMax !== undefined)
      params.append("max_score", String(filters.scoreMax));
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.per_page) params.append("per_page", String(filters.per_page));

    const res = await apiRequest<{
      data: CibilCheck[];
    }>(`/cibil?${params.toString()}`);

    return res.data;
  },

  // ✅ GET SINGLE CIBIL CHECK
  getById: async (id: string): Promise<CibilCheck> => {
    const res = await apiRequest<{ data: CibilCheck }>(
      `/cibil/${id}`
    );
    return res.data;
  },
};

export const createCibilOrder = async (payload: {
  customer_name: string;
  mobile: string;
  pan: string;
  dob: string;
  linked_lead_id?: string | null;
}) => {
  return apiRequest<{
    razorpay_key_id: string;
    order: {
      id: string;
      amount: number;
      currency: string;
    };
    payment_id: string;
  }>("/cibil/create-order", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const verifyCibilPayment = async (payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  return apiRequest<{
    data: CibilCheck;
  }>("/cibil/verify-payment", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// Comparison Analytics API
export const comparisonApi = {
  getAnalytics: async (): Promise<ComparisonAnalytics> => {
    const res = await apiRequest<ComparisonAnalytics>(
      "/analytics/comparisons"
    );
    return res;
  },
};


// Dealers API
// const mockDealers: Dealer[] = [
//   {
//     id: 'dealer_1',
//     name: 'Patliputra Motors - Main Branch',
//     address: '123 Main Road, Near Railway Station',
//     city: 'Patna',
//     district: 'Patna',
//     state: 'Bihar',
//     pincode: '800001',
//     phone: '+91 9876543210',
//     email: 'main@patliputra-motors.com',
//     latitude: 25.6102,
//     longitude: 85.1415,
//     isActive: true,
//     createdAt: '2024-01-01T10:00:00Z',
//     updatedAt: '2024-01-01T10:00:00Z',
//   },
//   {
//     id: 'dealer_2',
//     name: 'Patliputra Motors - Muzaffarpur',
//     address: '45 Station Road, Opposite Bus Stand',
//     city: 'Muzaffarpur',
//     district: 'Muzaffarpur',
//     state: 'Bihar',
//     pincode: '842001',
//     phone: '+91 9876543211',
//     email: 'mzp@patliputra-motors.com',
//     latitude: 26.1209,
//     longitude: 85.3647,
//     isActive: true,
//     createdAt: '2024-02-15T10:00:00Z',
//     updatedAt: '2024-02-15T10:00:00Z',
//   },
//   {
//     id: 'dealer_3',
//     name: 'Patliputra Motors - Gaya',
//     address: '78 GT Road, Industrial Area',
//     city: 'Gaya',
//     district: 'Gaya',
//     state: 'Bihar',
//     pincode: '823001',
//     phone: '+91 9876543212',
//     email: 'gaya@patliputra-motors.com',
//     latitude: 24.7955,
//     longitude: 85.0128,
//     isActive: false,
//     createdAt: '2024-03-10T10:00:00Z',
//     updatedAt: '2024-03-10T10:00:00Z',
//   },
// ];

export const dealersApi = {
  getAll: async (): Promise<Dealer[]> => {
    const res = await apiRequest<{ data: Dealer[] }>("/dealers");
    return res.data;
  },

  getById: async (id: string): Promise<Dealer> => {
    const res = await apiRequest<{ data: Dealer }>(`/dealers/${id}`);
    return res.data;
  },

  create: async (
    dealer: Omit<Dealer, "_id" | "createdAt" | "updatedAt">
  ): Promise<Dealer> => {
    const res = await apiRequest<{ data: Dealer }>("/dealers", {
      method: "POST",
      body: JSON.stringify(dealer),
    });
    return res.data;
  },

update: async (id: string, dealer: Partial<Dealer>): Promise<Dealer> => {
  if (!id) {
    throw new Error("Dealer ID missing");
  }

  const res = await apiRequest<{ data: Dealer }>(`/dealers/${id}`, {
    method: "PUT",
    body: JSON.stringify(dealer),
  });

  return res.data;
},


  delete: async (id: string): Promise<void> => {
    await apiRequest(`/dealers/${id}`, { method: "DELETE" });
  },
};


// Users API
const mockUsers: AdminUser[] = [
  {
    id: 'user_1',
    name: 'Master Admin',
    email: 'admin@patliputra.com',
    mobile: '+91 9876543210',
    role: 'master_admin',
    isActive: true,
    lastLogin: '2024-03-15T10:00:00Z',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'user_2',
    name: 'Sales Manager',
    email: 'sales@patliputra.com',
    mobile: '+91 9876543211',
    role: 'admin',
    isActive: true,
    lastLogin: '2024-03-14T15:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'user_3',
    name: 'Sales Executive',
    email: 'exec@patliputra.com',
    mobile: '+91 9876543212',
    role: 'sales_user',
    isActive: true,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z',
  },
];

export const usersApi = {
  // ✅ LIST USERS
  getAll: async (): Promise<AdminUser[]> => {
    const res = await apiRequest<{ data: any[] }>("/users");

    return res.data.map((u) => ({
      ...u,
      id: u._id, // normalize once
    }));
  },

  // ✅ CREATE USER
  create: async (
    user: Omit<AdminUser, "id" | "createdAt" | "updatedAt">
  ): Promise<AdminUser> => {
    const res = await apiRequest<{ user: any }>("/users", {
      method: "POST",
      body: JSON.stringify(user),
    });

    return {
      ...res.user,
      id: res.user._id, // 🔥 REQUIRED
    };
  },

  // ✅ UPDATE USER (incl. permissions)
  update: async (
    id: string,
    user: Partial<AdminUser>
  ): Promise<AdminUser> => {
    const res = await apiRequest<{ user: any }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(user),
    });

    return {
      ...res.user,
      id: res.user._id, // 🔥 REQUIRED
    };
  },

  // ✅ DELETE USER
  delete: async (id: string): Promise<void> => {
    await apiRequest(`/users/${id}`, { method: "DELETE" });
  },
};



// Media API
// const mockMedia: MediaItem[] = [
//   {
//     id: 'media_1',
//     titleEn: 'JCB Product Showcase',
//     titleHi: 'JCB उत्पाद प्रदर्शन',
//     mediaType: 'image',
//     url: '/placeholder.svg',
//     category: 'gallery',
//     isFeatured: true,
//     isActive: true,
//     order: 1,
//     createdAt: '2024-01-01T10:00:00Z',
//     updatedAt: '2024-01-01T10:00:00Z',
//   },
// ];

export const mediaApi = {
  getAll: async (): Promise<MediaItem[]> => {
    const res = await apiRequest<{ data: MediaItem[] }>("/media");
    return res.data;
  },

  uploadSingle: async (file: File, folder?: string) => {
    const fd = new FormData();
    fd.append("file", file);
    if (folder) fd.append("folder", folder);

    const res = await apiRequest<{ data: MediaItem }>("/media/upload", {
      method: "POST",
      body: fd,
    });

    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/media/${id}`, { method: "DELETE" });
  },
};


// Offers API
// const mockOffers: Offer[] = [
//   {
//     id: 'offer_1',
//     titleEn: 'Summer Sale',
//     titleHi: 'गर्मियों की बिक्री',
//     descriptionEn: 'Get special discounts on all JCB products',
//     descriptionHi: 'सभी JCB उत्पादों पर विशेष छूट प्राप्त करें',
//     startDate: '2024-03-01T00:00:00Z',
//     endDate: '2024-06-30T23:59:59Z',
//     applicableBrand: 'JCB',
//     isActive: true,
//     priority: 1,
//     createdAt: '2024-03-01T10:00:00Z',
//     updatedAt: '2024-03-01T10:00:00Z',
//   },
// ];

export const offersApi = {
  getAll: async (): Promise<Offer[]> => {
    const res = await apiRequest<{ data: Offer[] }>("/offers");
    return res.data;
  },

  getById: async (id: string): Promise<Offer> => {
    const res = await apiRequest<{ data: Offer }>(`/offers/${id}`);
    return res.data;
  },

  create: async (
    offer: Omit<Offer, "_id" | "createdAt" | "updatedAt">
  ): Promise<Offer> => {
    const res = await apiRequest<{ data: Offer }>("/offers", {
      method: "POST",
      body: JSON.stringify(offer),
    });
    return res.data;
  },

  update: async (
    id: string,
    offer: Partial<Offer>
  ): Promise<Offer> => {
    if (!id) throw new Error("Offer ID missing");

    const res = await apiRequest<{ data: Offer }>(`/offers/${id}`, {
      method: "PUT",
      body: JSON.stringify(offer),
    });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/offers/${id}`, { method: "DELETE" });
  },
};




// ================= CONTENT PAGES API (REAL BACKEND) =================
export const contentPagesApi = {
  // ✅ GET ALL CONTENT PAGES (FIXED)
  getAll: async (): Promise<ContentPage[]> => {
    const res = await apiRequest<any[]>("/content-pages");

    // 🔥 NORMALIZE MONGODB _id → id
    return res.map((p) => ({
      ...p,
      id: p._id,
    }));
  },

  // ✅ UPDATE PAGE CONTENT
  update: async (
    id: string,
    page: Pick<ContentPage, "contentEn" | "contentHi">
  ): Promise<ContentPage> => {
    const res = await apiRequest<ContentPage>(`/content-pages/${id}`, {
      method: "PUT",
      body: JSON.stringify(page),
    });
    return res;
  },

  // ================= SOCIAL LINKS =================

  // ✅ GET SOCIAL LINKS
  getSocialLinks: async (): Promise<SocialLinks> => {
    return apiRequest<SocialLinks>("/content-pages/social-links");
  },

  // ✅ UPDATE SOCIAL LINKS
  updateSocialLinks: async (
    links: SocialLinks
  ): Promise<SocialLinks> => {
    return apiRequest<SocialLinks>("/content-pages/social-links", {
      method: "PUT",
      body: JSON.stringify(links),
    });
  },
};



// Mock Data
const mockProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'JCB 3DX Backhoe Loader',
    brand: 'JCB',
    category: 'Backhoe Loader',
    price: 2850000,
    shortDescription: 'Versatile backhoe loader for construction and infrastructure projects',
    specifications: {
      'Engine Power': '76 HP',
      'Operating Weight': '7600 kg',
      'Bucket Capacity': '1.0 cum',
    },
    images: ['/placeholder.svg'],
    isNewLaunch: false,
    isBestseller: true,
    isFeatured: true,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'prod_2',
    name: 'Ashok Leyland Dost',
    brand: 'Ashok Leyland',
    category: 'Light Commercial Vehicle',
    price: 750000,
    shortDescription: 'India\'s most fuel-efficient LCV',
    specifications: {
      'Engine': '1.5L Diesel',
      'Payload': '1.25 Ton',
      'Mileage': '15.5 kmpl',
    },
    images: ['/placeholder.svg'],
    isNewLaunch: true,
    isBestseller: true,
    isFeatured: false,
    isActive: true,
    createdAt: '2024-02-10T10:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
  },
  {
    id: 'prod_3',
    name: 'Switch EiV 12',
    brand: 'Switch EV',
    category: 'Electric Bus',
    price: 12000000,
    shortDescription: 'Zero-emission electric bus for urban transport',
    specifications: {
      'Range': '250 km',
      'Battery': '231 kWh',
      'Seating': '31+D',
    },
    images: ['/placeholder.svg'],
    isNewLaunch: true,
    isBestseller: false,
    isFeatured: true,
    isActive: true,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
  },
];

const mockLeads: Lead[] = [
  {
    id: 'lead_1',
    customerName: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    mobile: '9876543210',
    productName: 'JCB 3DX Backhoe Loader',
    brand: 'JCB',
    source: 'website',
    sourcePage: '/products/jcb-3dx',
    status: 'new',
    notes: [],
    activities: [
      { type: 'created', description: 'Lead created from website inquiry', timestamp: '2024-03-15T09:30:00Z', user: 'System' },
    ],
    createdAt: '2024-03-15T09:30:00Z',
    updatedAt: '2024-03-15T09:30:00Z',
  },
  {
    id: 'lead_2',
    customerName: 'Suresh Patel',
    email: 'suresh@example.com',
    mobile: '9898989898',
    productName: 'Ashok Leyland Dost',
    brand: 'Ashok Leyland',
    source: 'walk-in',
    status: 'contacted',
    notes: ['Customer interested in financing options'],
    activities: [
      { type: 'created', description: 'Walk-in customer', timestamp: '2024-03-14T11:00:00Z', user: 'Sales Team' },
      { type: 'call', description: 'Follow-up call made', timestamp: '2024-03-15T10:00:00Z', user: 'Admin' },
    ],
    createdAt: '2024-03-14T11:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
  {
    id: 'lead_3',
    customerName: 'Amit Sharma',
    email: 'amit@example.com',
    mobile: '9123456789',
    productName: 'Switch EiV 12',
    brand: 'Switch EV',
    source: 'referral',
    status: 'qualified',
    notes: ['Fleet requirement for 5 buses', 'Budget approved'],
    activities: [],
    createdAt: '2024-03-13T14:00:00Z',
    updatedAt: '2024-03-15T16:00:00Z',
  },
];

// const mockUsedVehicles: UsedVehicle[] = [
//   {
//     id: 'uv_1',
//     vehicleType: 'Backhoe Loader',
//     brand: 'JCB',
//     model: '3DX',
//     year: 2021,
//     kilometers: 0,
//     hours: 3500,
//     price: 1850000,
//     ownership: 'First Owner',
//     fuelType: 'Diesel',
//     condition: {
//       engine: 'Good',
//       transmission: 'Good',
//       body: 'Fair',
//       tyres: 'Good',
//       notes: 'Minor scratches on body',
//     },
//     certifications: {
//       inspection150Point: true,
//       financeAvailable: true,
//       returnPolicy: true,
//     },
//     images: ['/placeholder.svg'],
//     isActive: true,
//     createdAt: '2024-02-20T10:00:00Z',
//     updatedAt: '2024-02-20T10:00:00Z',
//   },
// ];

// const mockFinanceApplications: FinanceApplication[] = [
//   {
//     id: 'fin_1',
//     leadId: 'lead_1',
//     customerName: 'Rajesh Kumar',
//     mobile: '9876543210',
//     email: 'rajesh@example.com',
//     productName: 'JCB 3DX Backhoe Loader',
//     loanAmount: 2000000,
//     tenure: 60,
//     status: 'under_review',
//     documents: [
//       { type: 'PAN Card', url: '/docs/pan.pdf', uploadedAt: '2024-03-15T10:00:00Z' },
//       { type: 'Aadhaar Card', url: '/docs/aadhaar.pdf', uploadedAt: '2024-03-15T10:00:00Z' },
//     ],
//     createdAt: '2024-03-15T10:00:00Z',
//     updatedAt: '2024-03-15T10:00:00Z',
//   },
// ];

// const mockCibilChecks: CibilCheck[] = [
//   {
//     id: 'cibil_1',
//     leadId: 'lead_1',
//     customerName: 'Rajesh Kumar',
//     mobile: '9876543210',
//     panNumber: 'ABCDE1234F',
//     dateOfBirth: '1985-06-15',
//     score: 756,
//     scoreBand: 'Good',
//     checkedAt: '2024-03-15T09:45:00Z',
//   },
//   {
//     id: 'cibil_2',
//     leadId: 'lead_2',
//     customerName: 'Suresh Patel',
//     mobile: '9898989898',
//     panNumber: 'XYZAB5678C',
//     dateOfBirth: '1990-03-22',
//     score: 812,
//     scoreBand: 'Excellent',
//     checkedAt: '2024-03-14T11:30:00Z',
//   },
//   {
//     id: 'cibil_3',
//     customerName: 'Vikram Singh',
//     mobile: '9765432100',
//     panNumber: 'PQRST9012D',
//     dateOfBirth: '1978-11-08',
//     score: 620,
//     scoreBand: 'Fair',
//     checkedAt: '2024-03-13T15:00:00Z',
//   },
// ];

// ================= BANNERS API =================
export interface Banner {
  id: string;
  page: "home" | "jcb" | "ashok_leyland" | "switch_ev" | "used_vehicles" | "finance";
  title: string;
  subtitle?: string;
  background_image?: string;
  background_video?: string;
  overlay_opacity: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export const bannersApi = {
  getAll: async (): Promise<Banner[]> => {
    const res = await apiRequest<{ data: any[] }>("/banners");

    return res.data.map(b => ({
      id: b._id,
      ...b,
    }));
  },

  create: async (payload: Partial<Banner>) => {
    const res = await apiRequest<{ data: Banner }>("/banners", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  update: async (id: string, payload: Partial<Banner>) => {
    const res = await apiRequest<{ data: Banner }>(`/banners/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  delete: async (id: string) => {
    await apiRequest(`/banners/${id}`, { method: "DELETE" });
  },
};


// ================= SETTINGS API =================

export interface SiteSettingsResponse {
  primary_phone?: string;
  whatsapp_number?: string;
  email?: string;
  address?: string;
  working_hours?: string;
  features?: {
    emiCalculator?: boolean;
    usedVehicles?: boolean;
    cibilCheck?: boolean;
    comparison?: boolean;
  };
}

export const settingsApi = {
  // 🔓 Public (website)
  getPublic: async (): Promise<SiteSettingsResponse | null> => {
    const res = await apiRequest<{ data: SiteSettingsResponse | null }>("/settings");
    return res.data;
  },

  // 🔐 Admin
  getAdmin: async (): Promise<SiteSettingsResponse | null> => {
    const res = await apiRequest<{ data: SiteSettingsResponse | null }>("/settings/admin");
    return res.data;
  },

  // 💾 Save
  update: async (payload: SiteSettingsResponse): Promise<SiteSettingsResponse> => {
    const res = await apiRequest<{ data: SiteSettingsResponse }>("/settings", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return res.data;
  },
};

// ================= TIMELINE TYPES =================
export interface TimelineEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  image: string;
  imageType: 'loan-mela' | 'rural-activity' | 'customer-meet' | 'operator-meet' | 'exchange-mela' | 'financer-meet' | 'launch-event' | 'road-show' | 'customer-testimony' | 'customer-visit' | 'group-event' | 'others';
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ================= TIMELINE API =================
export const timelineApi = {
  getAll: async (): Promise<TimelineEvent[]> => {
    const res = await apiRequest<{ data: TimelineEvent[] }>('/timeline');
    return res.data;
  },

  getById: async (id: string): Promise<TimelineEvent> => {
    const res = await apiRequest<{ data: TimelineEvent }>(`/timeline/${id}`);
    return res.data;
  },

  create: async (formData: FormData): Promise<TimelineEvent> => {
    const res = await apiRequest<{ data: TimelineEvent }>('/timeline', {
      method: 'POST',
      body: formData,
    });
    return res.data;
  },

  update: async (id: string, formData: FormData): Promise<TimelineEvent> => {
    const res = await apiRequest<{ data: TimelineEvent }>(`/timeline/${id}`, {
      method: 'PUT',
      body: formData,
    });
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiRequest(`/timeline/${id}`, { method: 'DELETE' });
  },
};

// ================= CAREERS TYPES =================
export interface JobOpening {
  _id: string;
  title: string;
  location: string;
  experience: string;
  employmentType: 'Full Time' | 'Part Time' | 'Contract' | 'Internship';
  description: string;
  qualifications: string[];
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  _id: string;
  jobId: string;
  jobTitle?: string;
  name: string;
  email: string;
  mobile: string;
  resumeUrl: string;
  whyShouldWeHire: string;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  createdAt: string;
  updatedAt: string;
}

// ================= CAREERS API =================
export const careersApi = {
  // Job Openings
  getAllOpenings: async (params?: { search?: string; isActive?: boolean }): Promise<JobOpening[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.isActive !== undefined) query.append('is_active', String(params.isActive));
    const res = await apiRequest<{ data: JobOpening[] }>(`/careers/openings?${query.toString()}`);
    return res.data;
  },

  getOpeningById: async (id: string): Promise<JobOpening> => {
    const res = await apiRequest<{ data: JobOpening }>(`/careers/openings/${id}`);
    return res.data;
  },

  createOpening: async (data: Partial<JobOpening>): Promise<JobOpening> => {
    const res = await apiRequest<{ data: JobOpening }>('/careers/openings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  updateOpening: async (id: string, data: Partial<JobOpening>): Promise<JobOpening> => {
    const res = await apiRequest<{ data: JobOpening }>(`/careers/openings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  deleteOpening: async (id: string): Promise<void> => {
    await apiRequest(`/careers/openings/${id}`, { method: 'DELETE' });
  },

  // Job Applications
  getAllApplications: async (params?: { jobId?: string; status?: string; search?: string }): Promise<JobApplication[]> => {
    const query = new URLSearchParams();
    if (params?.jobId) query.append('job_id', params.jobId);
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const res = await apiRequest<{ data: JobApplication[] }>(`/careers/applications?${query.toString()}`);
    return res.data;
  },

  updateApplicationStatus: async (id: string, status: JobApplication['status']): Promise<JobApplication> => {
    const res = await apiRequest<{ data: JobApplication }>(`/careers/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  deleteApplication: async (id: string): Promise<void> => {
    await apiRequest(`/careers/applications/${id}`, { method: 'DELETE' });
  },
};
