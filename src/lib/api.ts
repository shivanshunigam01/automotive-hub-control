// API Configuration - Replace BASE_URL with actual API endpoint
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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
  condition: {
    engine: string;
    transmission: string;
    body: string;
    tyres: string;
    notes?: string;
  };
  certifications: {
    inspection150Point: boolean;
    financeAvailable: boolean;
    returnPolicy: boolean;
  };
  images: string[];
  isActive: boolean;
  tcoItems?: TCOItem[];
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
  leadId: string;
  customerName: string;
  mobile: string;
  email: string;
  productId?: string;
  productName?: string;
  loanAmount: number;
  tenure: number;
  status: 'new' | 'under_review' | 'approved' | 'rejected';
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
  leadId?: string;
  customerName: string;
  mobile: string;
  panNumber: string;
  dateOfBirth?: string;
  aadhaarUrl?: string;
  panUrl?: string;
  score: number;
  scoreBand: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  checkedAt: string;
}

export interface Dealer {
  id: string;
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
  isActive: boolean;
  lastLogin?: string;
  permissions?: ModulePermissions;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  id: string;
  titleEn: string;
  titleHi: string;
  mediaType: 'image' | 'video';
  url: string;
  category: 'gallery' | 'events' | 'testimonials';
  isFeatured: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
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

// API Helper
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem('admin_token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options?.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

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

    // Save token
    localStorage.setItem('admin_token', response.token);
    localStorage.setItem('admin_user', JSON.stringify(response.user));

    return response;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
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
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    // Mock data
    return {
      totalLeads: 1247,
      newLeadsToday: 23,
      financeApplications: 89,
      cibilChecks: 156,
      activeProducts: 45,
      activeUsedVehicles: 28,
      totalVisitors: 15840,
      todayVisitors: 342,
      uniqueVisitors: 8920,
    };
  },
  getRecentLeads: async (): Promise<Lead[]> => {
    return mockLeads.slice(0, 10);
  },
  getLeadsOverTime: async () => {
    return [
      { date: 'Jan', leads: 65 },
      { date: 'Feb', leads: 78 },
      { date: 'Mar', leads: 90 },
      { date: 'Apr', leads: 81 },
      { date: 'May', leads: 95 },
      { date: 'Jun', leads: 110 },
      { date: 'Jul', leads: 125 },
    ];
  },
  getFinanceStatus: async () => {
    return [
      { status: 'Approved', count: 45, fill: 'hsl(var(--success))' },
      { status: 'Under Review', count: 28, fill: 'hsl(var(--warning))' },
      { status: 'Rejected', count: 12, fill: 'hsl(var(--destructive))' },
      { status: 'New', count: 15, fill: 'hsl(var(--info))' },
    ];
  },
  getTrafficOverTime: async (): Promise<TrafficData[]> => {
    return [
      { date: 'Jan', visitors: 1200, uniqueVisitors: 890, pageViews: 3400 },
      { date: 'Feb', visitors: 1450, uniqueVisitors: 1020, pageViews: 4100 },
      { date: 'Mar', visitors: 1680, uniqueVisitors: 1180, pageViews: 4800 },
      { date: 'Apr', visitors: 1890, uniqueVisitors: 1340, pageViews: 5200 },
      { date: 'May', visitors: 2100, uniqueVisitors: 1520, pageViews: 5800 },
      { date: 'Jun', visitors: 2350, uniqueVisitors: 1680, pageViews: 6400 },
      { date: 'Jul', visitors: 2580, uniqueVisitors: 1850, pageViews: 7100 },
    ];
  },
  getWebsiteTraffic: async (): Promise<{
    totalVisitors: number;
    todayVisitors: number;
    uniqueVisitors: number;
    trafficTrend: Array<{ date: string; visitors: number }>;
  }> => {
    return {
      totalVisitors: 15840,
      todayVisitors: 342,
      uniqueVisitors: 8920,
      trafficTrend: [
        { date: 'Mon', visitors: 312 },
        { date: 'Tue', visitors: 285 },
        { date: 'Wed', visitors: 356 },
        { date: 'Thu', visitors: 298 },
        { date: 'Fri', visitors: 378 },
        { date: 'Sat', visitors: 445 },
        { date: 'Sun', visitors: 342 },
      ],
    };
  },
};

// Products API
export const productsApi = {
  getAll: async (filters?: {
    brand?: string;
    category?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<Product[]> => {
    let products = [...mockProducts];
    if (filters?.brand) {
      products = products.filter(p => p.brand === filters.brand);
    }
    if (filters?.isActive !== undefined) {
      products = products.filter(p => p.isActive === filters.isActive);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.brand.toLowerCase().includes(search)
      );
    }
    return products;
  },
  getById: async (id: string): Promise<Product | undefined> => {
    return mockProducts.find(p => p.id === id);
  },
  create: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const newProduct: Product = {
      ...product,
      id: 'prod_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockProducts.push(newProduct);
    return newProduct;
  },
  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    mockProducts[index] = { ...mockProducts[index], ...product, updatedAt: new Date().toISOString() };
    return mockProducts[index];
  },
  delete: async (id: string): Promise<void> => {
    const index = mockProducts.findIndex(p => p.id === id);
    if (index !== -1) mockProducts.splice(index, 1);
  },
};

// Leads API
export const leadsApi = {
  getAll: async (filters?: {
    status?: string;
    brand?: string;
    source?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<Lead[]> => {
    let leads = [...mockLeads];
    if (filters?.status) {
      leads = leads.filter(l => l.status === filters.status);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      leads = leads.filter(l => 
        l.customerName.toLowerCase().includes(search) ||
        l.mobile.includes(search)
      );
    }
    return leads;
  },
  getById: async (id: string): Promise<Lead | undefined> => {
    return mockLeads.find(l => l.id === id);
  },
  updateStatus: async (id: string, status: Lead['status']): Promise<Lead> => {
    const index = mockLeads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');
    mockLeads[index] = { ...mockLeads[index], status, updatedAt: new Date().toISOString() };
    return mockLeads[index];
  },
  addNote: async (id: string, note: string): Promise<Lead> => {
    const index = mockLeads.findIndex(l => l.id === id);
    if (index === -1) throw new Error('Lead not found');
    mockLeads[index].notes.push(note);
    mockLeads[index].updatedAt = new Date().toISOString();
    return mockLeads[index];
  },
};

// Used Vehicles API
export const usedVehiclesApi = {
  getAll: async (): Promise<UsedVehicle[]> => mockUsedVehicles,
  getById: async (id: string): Promise<UsedVehicle | undefined> => {
    return mockUsedVehicles.find(v => v.id === id);
  },
  create: async (vehicle: Omit<UsedVehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<UsedVehicle> => {
    const newVehicle: UsedVehicle = {
      ...vehicle,
      id: 'uv_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsedVehicles.push(newVehicle);
    return newVehicle;
  },
  update: async (id: string, vehicle: Partial<UsedVehicle>): Promise<UsedVehicle> => {
    const index = mockUsedVehicles.findIndex(v => v.id === id);
    if (index === -1) throw new Error('Vehicle not found');
    mockUsedVehicles[index] = { ...mockUsedVehicles[index], ...vehicle, updatedAt: new Date().toISOString() };
    return mockUsedVehicles[index];
  },
  delete: async (id: string): Promise<void> => {
    const index = mockUsedVehicles.findIndex(v => v.id === id);
    if (index !== -1) mockUsedVehicles.splice(index, 1);
  },
};

// Finance API
export const financeApi = {
  getAll: async (): Promise<FinanceApplication[]> => mockFinanceApplications,
  getById: async (id: string): Promise<FinanceApplication | undefined> => {
    return mockFinanceApplications.find(f => f.id === id);
  },
  updateStatus: async (id: string, status: FinanceApplication['status']): Promise<FinanceApplication> => {
    const index = mockFinanceApplications.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Application not found');
    mockFinanceApplications[index] = { ...mockFinanceApplications[index], status, updatedAt: new Date().toISOString() };
    return mockFinanceApplications[index];
  },
};

// CIBIL API
export const cibilApi = {
  getAll: async (filters?: {
    search?: string;
    scoreMin?: number;
    scoreMax?: number;
  }): Promise<CibilCheck[]> => {
    let checks = [...mockCibilChecks];
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      checks = checks.filter(c => 
        c.customerName.toLowerCase().includes(search) ||
        c.mobile.includes(search)
      );
    }
    if (filters?.scoreMin) {
      checks = checks.filter(c => c.score >= filters.scoreMin!);
    }
    if (filters?.scoreMax) {
      checks = checks.filter(c => c.score <= filters.scoreMax!);
    }
    return checks;
  },
  getById: async (id: string): Promise<CibilCheck | undefined> => {
    return mockCibilChecks.find(c => c.id === id);
  },
};

// Comparison Analytics API
export const comparisonApi = {
  getAnalytics: async (): Promise<ComparisonAnalytics> => {
    return {
      mostComparedProducts: [
        { productId: '1', productName: 'JCB 3DX Backhoe Loader', comparisonCount: 245 },
        { productId: '2', productName: 'Ashok Leyland Dost', comparisonCount: 189 },
        { productId: '3', productName: 'Switch EiV 12', comparisonCount: 156 },
      ],
      productPairings: [
        { product1: 'JCB 3DX', product2: 'JCB 4DX', count: 89 },
        { product1: 'Dost', product2: 'Bada Dost', count: 67 },
      ],
      brandComparisons: [
        { brand: 'JCB', count: 456 },
        { brand: 'Ashok Leyland', count: 312 },
        { brand: 'Switch EV', count: 178 },
      ],
    };
  },
};

// Dealers API
const mockDealers: Dealer[] = [
  {
    id: 'dealer_1',
    name: 'Patliputra Motors - Main Branch',
    address: '123 Main Road, Near Railway Station',
    city: 'Patna',
    district: 'Patna',
    state: 'Bihar',
    pincode: '800001',
    phone: '+91 9876543210',
    email: 'main@patliputra-motors.com',
    latitude: 25.6102,
    longitude: 85.1415,
    isActive: true,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
  {
    id: 'dealer_2',
    name: 'Patliputra Motors - Muzaffarpur',
    address: '45 Station Road, Opposite Bus Stand',
    city: 'Muzaffarpur',
    district: 'Muzaffarpur',
    state: 'Bihar',
    pincode: '842001',
    phone: '+91 9876543211',
    email: 'mzp@patliputra-motors.com',
    latitude: 26.1209,
    longitude: 85.3647,
    isActive: true,
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
  },
  {
    id: 'dealer_3',
    name: 'Patliputra Motors - Gaya',
    address: '78 GT Road, Industrial Area',
    city: 'Gaya',
    district: 'Gaya',
    state: 'Bihar',
    pincode: '823001',
    phone: '+91 9876543212',
    email: 'gaya@patliputra-motors.com',
    latitude: 24.7955,
    longitude: 85.0128,
    isActive: false,
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z',
  },
];

export const dealersApi = {
  getAll: async (): Promise<Dealer[]> => mockDealers,
  getById: async (id: string): Promise<Dealer | undefined> => {
    return mockDealers.find(d => d.id === id);
  },
  create: async (dealer: Omit<Dealer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dealer> => {
    const newDealer: Dealer = {
      ...dealer,
      id: 'dealer_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockDealers.push(newDealer);
    return newDealer;
  },
  update: async (id: string, dealer: Partial<Dealer>): Promise<Dealer> => {
    const index = mockDealers.findIndex(d => d.id === id);
    if (index === -1) throw new Error('Dealer not found');
    mockDealers[index] = { ...mockDealers[index], ...dealer, updatedAt: new Date().toISOString() };
    return mockDealers[index];
  },
  delete: async (id: string): Promise<void> => {
    const index = mockDealers.findIndex(d => d.id === id);
    if (index !== -1) mockDealers.splice(index, 1);
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
  getAll: async (): Promise<AdminUser[]> => mockUsers,
  getById: async (id: string): Promise<AdminUser | undefined> => mockUsers.find(u => u.id === id),
  create: async (user: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser> => {
    const newUser: AdminUser = {
      ...user,
      id: 'user_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return newUser;
  },
  update: async (id: string, user: Partial<AdminUser>): Promise<AdminUser> => {
    const index = mockUsers.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    mockUsers[index] = { ...mockUsers[index], ...user, updatedAt: new Date().toISOString() };
    return mockUsers[index];
  },
  delete: async (id: string): Promise<void> => {
    const index = mockUsers.findIndex(u => u.id === id);
    if (index !== -1) mockUsers.splice(index, 1);
  },
};

// Media API
const mockMedia: MediaItem[] = [
  {
    id: 'media_1',
    titleEn: 'JCB Product Showcase',
    titleHi: 'JCB उत्पाद प्रदर्शन',
    mediaType: 'image',
    url: '/placeholder.svg',
    category: 'gallery',
    isFeatured: true,
    isActive: true,
    order: 1,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
];

export const mediaApi = {
  getAll: async (): Promise<MediaItem[]> => mockMedia,
  create: async (item: Omit<MediaItem, 'id' | 'order' | 'createdAt' | 'updatedAt'>): Promise<MediaItem> => {
    const newItem: MediaItem = { ...item, id: 'media_' + Date.now(), order: mockMedia.length + 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    mockMedia.push(newItem);
    return newItem;
  },
  update: async (id: string, item: Partial<MediaItem>): Promise<MediaItem> => {
    const index = mockMedia.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Media not found');
    mockMedia[index] = { ...mockMedia[index], ...item, updatedAt: new Date().toISOString() };
    return mockMedia[index];
  },
  delete: async (id: string): Promise<void> => {
    const index = mockMedia.findIndex(m => m.id === id);
    if (index !== -1) mockMedia.splice(index, 1);
  },
};

// Offers API
const mockOffers: Offer[] = [
  {
    id: 'offer_1',
    titleEn: 'Summer Sale',
    titleHi: 'गर्मियों की बिक्री',
    descriptionEn: 'Get special discounts on all JCB products',
    descriptionHi: 'सभी JCB उत्पादों पर विशेष छूट प्राप्त करें',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-06-30T23:59:59Z',
    applicableBrand: 'JCB',
    isActive: true,
    priority: 1,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
  },
];

export const offersApi = {
  getAll: async (): Promise<Offer[]> => mockOffers,
  create: async (offer: Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Offer> => {
    const newOffer: Offer = { ...offer, id: 'offer_' + Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    mockOffers.push(newOffer);
    return newOffer;
  },
  update: async (id: string, offer: Partial<Offer>): Promise<Offer> => {
    const index = mockOffers.findIndex(o => o.id === id);
    if (index === -1) throw new Error('Offer not found');
    mockOffers[index] = { ...mockOffers[index], ...offer, updatedAt: new Date().toISOString() };
    return mockOffers[index];
  },
  delete: async (id: string): Promise<void> => {
    const index = mockOffers.findIndex(o => o.id === id);
    if (index !== -1) mockOffers.splice(index, 1);
  },
};

// Content Pages API
const mockContentPages: ContentPage[] = [
  { id: 'page_1', key: 'about-us', titleEn: 'About Us', titleHi: 'हमारे बारे में', contentEn: 'About us content...', contentHi: 'हमारे बारे में सामग्री...', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'page_2', key: 'service-warranty', titleEn: 'Service & Warranty', titleHi: 'सेवा और वारंटी', contentEn: 'Service content...', contentHi: 'सेवा सामग्री...', updatedAt: '2024-01-01T10:00:00Z' },
  { id: 'page_3', key: 'parts-lubricants', titleEn: 'Parts & Lubricants', titleHi: 'पार्ट्स और लुब्रिकेंट्स', contentEn: 'Parts content...', contentHi: 'पार्ट्स सामग्री...', updatedAt: '2024-01-01T10:00:00Z' },
];

const mockSocialLinks: SocialLinks = { facebook: 'https://facebook.com/patliputra', instagram: 'https://instagram.com/patliputra', youtube: 'https://youtube.com/patliputra', linkedin: 'https://linkedin.com/company/patliputra' };

export const contentPagesApi = {
  getAll: async (): Promise<ContentPage[]> => mockContentPages,
  update: async (id: string, page: Partial<ContentPage>): Promise<ContentPage> => {
    const index = mockContentPages.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Page not found');
    mockContentPages[index] = { ...mockContentPages[index], ...page, updatedAt: new Date().toISOString() };
    return mockContentPages[index];
  },
  getSocialLinks: async (): Promise<SocialLinks> => mockSocialLinks,
  updateSocialLinks: async (links: SocialLinks): Promise<SocialLinks> => {
    Object.assign(mockSocialLinks, links);
    return mockSocialLinks;
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

const mockUsedVehicles: UsedVehicle[] = [
  {
    id: 'uv_1',
    vehicleType: 'Backhoe Loader',
    brand: 'JCB',
    model: '3DX',
    year: 2021,
    kilometers: 0,
    hours: 3500,
    price: 1850000,
    ownership: 'First Owner',
    fuelType: 'Diesel',
    condition: {
      engine: 'Good',
      transmission: 'Good',
      body: 'Fair',
      tyres: 'Good',
      notes: 'Minor scratches on body',
    },
    certifications: {
      inspection150Point: true,
      financeAvailable: true,
      returnPolicy: true,
    },
    images: ['/placeholder.svg'],
    isActive: true,
    createdAt: '2024-02-20T10:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z',
  },
];

const mockFinanceApplications: FinanceApplication[] = [
  {
    id: 'fin_1',
    leadId: 'lead_1',
    customerName: 'Rajesh Kumar',
    mobile: '9876543210',
    email: 'rajesh@example.com',
    productName: 'JCB 3DX Backhoe Loader',
    loanAmount: 2000000,
    tenure: 60,
    status: 'under_review',
    documents: [
      { type: 'PAN Card', url: '/docs/pan.pdf', uploadedAt: '2024-03-15T10:00:00Z' },
      { type: 'Aadhaar Card', url: '/docs/aadhaar.pdf', uploadedAt: '2024-03-15T10:00:00Z' },
    ],
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
];

const mockCibilChecks: CibilCheck[] = [
  {
    id: 'cibil_1',
    leadId: 'lead_1',
    customerName: 'Rajesh Kumar',
    mobile: '9876543210',
    panNumber: 'ABCDE1234F',
    dateOfBirth: '1985-06-15',
    score: 756,
    scoreBand: 'Good',
    checkedAt: '2024-03-15T09:45:00Z',
  },
  {
    id: 'cibil_2',
    leadId: 'lead_2',
    customerName: 'Suresh Patel',
    mobile: '9898989898',
    panNumber: 'XYZAB5678C',
    dateOfBirth: '1990-03-22',
    score: 812,
    scoreBand: 'Excellent',
    checkedAt: '2024-03-14T11:30:00Z',
  },
  {
    id: 'cibil_3',
    customerName: 'Vikram Singh',
    mobile: '9765432100',
    panNumber: 'PQRST9012D',
    dateOfBirth: '1978-11-08',
    score: 620,
    scoreBand: 'Fair',
    checkedAt: '2024-03-13T15:00:00Z',
  },
];
