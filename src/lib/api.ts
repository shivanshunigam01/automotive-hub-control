// API Configuration - Replace BASE_URL with actual API endpoint
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Types
export interface Product {
  id: string;
  name: string;
  brand: 'JCB' | 'Ashok Leyland' | 'Switch EV';
  category: string;
  price: number;
  shortDescription: string;
  specifications: Record<string, string>;
  images: string[];
  isNewLaunch: boolean;
  isBestseller: boolean;
  isFeatured: boolean;
  isActive: boolean;
  seoTitle?: string;
  seoDescription?: string;
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
  dateOfBirth: string;
  score: number;
  scoreBand: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  checkedAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  newLeadsToday: number;
  financeApplications: number;
  cibilChecks: number;
  activeProducts: number;
  activeUsedVehicles: number;
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
    // Mock login for now
    if (email === 'admin@patliputra.com' && password === 'admin123') {
      const token = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('admin_token', token);
      return { token, user: { email, name: 'Admin User', role: 'master_admin' } };
    }
    throw new Error('Invalid credentials');
  },
  logout: () => {
    localStorage.removeItem('admin_token');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('admin_token');
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
