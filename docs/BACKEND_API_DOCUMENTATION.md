# Patliputra Motors - Admin Panel Backend API Documentation

## Tech Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary (images), Local Server (brochures/PDFs)
- **Validation**: Joi / express-validator

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   ├── cloudinary.js        # Cloudinary config
│   │   └── constants.js         # App constants
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── productController.js
│   │   ├── certifiedRefurbishedController.js
│   │   ├── leadController.js
│   │   ├── financeController.js
│   │   ├── cibilController.js
│   │   ├── dealerController.js
│   │   ├── mediaLibraryController.js
│   │   ├── offerSchemeController.js
│   │   ├── contentPageController.js
│   │   ├── analyticsController.js
│   │   ├── bannerController.js
│   │   ├── settingController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── rbac.js              # Role-based access control
│   │   ├── upload.js            # Multer config
│   │   ├── errorHandler.js      # Global error handler
│   │   └── validate.js          # Request validation
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── CertifiedRefurbished.js
│   │   ├── Lead.js
│   │   ├── FinanceApplication.js
│   │   ├── CibilCheck.js
│   │   ├── Dealer.js
│   │   ├── MediaItem.js
│   │   ├── Album.js
│   │   ├── OfferScheme.js
│   │   ├── ContentPage.js
│   │   ├── Analytics.js
│   │   ├── Banner.js
│   │   ├── Setting.js
│   │   └── Role.js
│   ├── routes/
│   │   ├── index.js             # Route aggregator
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── productRoutes.js
│   │   ├── certifiedRefurbishedRoutes.js
│   │   ├── leadRoutes.js
│   │   ├── financeRoutes.js
│   │   ├── cibilRoutes.js
│   │   ├── dealerRoutes.js
│   │   ├── mediaLibraryRoutes.js
│   │   ├── offerSchemeRoutes.js
│   │   ├── contentPageRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── bannerRoutes.js
│   │   ├── settingRoutes.js
│   │   └── userRoutes.js
│   ├── services/
│   │   ├── cloudinaryService.js
│   │   ├── cibilService.js
│   │   └── analyticsService.js
│   ├── utils/
│   │   ├── apiResponse.js       # Standardized responses
│   │   ├── asyncHandler.js      # Async error wrapper
│   │   ├── pagination.js        # Pagination helper
│   │   └── logger.js            # Winston logger
│   └── app.js                   # Express app setup
├── uploads/                      # Local brochure storage
├── .env
├── .env.example
└── server.js                    # Entry point
```

---

## Environment Variables (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/patliputra_motors

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Brochure Upload
BROCHURE_UPLOAD_PATH=./uploads/brochures
MAX_BROCHURE_SIZE=10485760

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173
```

---

## Database Schemas (MongoDB/Mongoose)

### 1. User Schema

```javascript
// models/User.js
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Don't return password by default
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['master_admin', 'admin', 'sales_user'],
    default: 'sales_user'
  },
  customRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
  },
  permissions: {
    type: Map,
    of: {
      view: Boolean,
      create: Boolean,
      edit: Boolean,
      delete: Boolean,
      export: Boolean
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  refreshToken: String
}, {
  timestamps: true
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

### 2. Role Schema (Custom Roles)

```javascript
// models/Role.js
const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true
  },
  permissions: {
    dashboard: { view: Boolean, create: Boolean, edit: Boolean, delete: Boolean, export: Boolean },
    products: { view: Boolean, create: Boolean, edit: Boolean, delete: Boolean, export: Boolean },
    certifiedRefurbished: { view: Boolean, create: Boolean, edit: Boolean, delete: Boolean, export: Boolean },
    leads: { view: Boolean, create: Boolean, edit: Boolean, delete: Boolean, export: Boolean },
    finance: { view: Boolean, create: Boolean, edit: Boolean, delete: Boolean, export: Boolean },
    cibil: { view: Boolean, create: Boolean, edit: Boolean, delete: Boolean, export: Boolean },
    analytics: { view: Boolean, create: Boolean, edit: Boolean, delete: Boolean, export: Boolean },
    banners: { view: Boolean, create: Boolean, edit: Boolean, delete: Boolean, export: Boolean },
    settings: { view: Boolean, create: Boolean, edit: Boolean, delete: Boolean, export: Boolean },
    dealers: { view: Boolean, create: Boolean, edit: Boolean, delete: Boolean, export: Boolean },
    users: { view: Boolean, create: Boolean, edit: Boolean, delete: Boolean, export: Boolean },
    mediaLibrary: { view: Boolean, create: Boolean, edit: Boolean, delete: Boolean, export: Boolean },
    offersSchemes: { view: Boolean, create: Boolean, edit: Boolean, delete: Boolean, export: Boolean },
    contentPages: { view: Boolean, create: Boolean, edit: Boolean, delete: Boolean, export: Boolean }
  },
  isSystem: {
    type: Boolean,
    default: false // true for default roles that can't be deleted
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});
```

### 3. Product Schema

```javascript
// models/Product.js
const productSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: 200
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  brand: {
    type: String,
    enum: ['JCB', 'Ashok Leyland', 'Switch EV'],
    required: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  
  // Classification
  segment: {
    type: String,
    enum: ['Construction', 'Agriculture', 'Commercial', 'Electric'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subcategory: String,
  applicationTags: [String],
  
  // Pricing
  price: {
    base: Number,
    showOnWebsite: {
      type: Boolean,
      default: false
    },
    priceLabel: String // "Starting from", "Contact for price", etc.
  },
  
  // Media
  images: [{
    url: String,          // Cloudinary URL
    publicId: String,     // Cloudinary public ID
    alt: String,
    isPrimary: Boolean,
    order: Number
  }],
  
  // Brochure (Local Storage)
  brochure: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: Date
  },
  
  // Specifications (Dynamic)
  specifications: [{
    category: String,     // "Engine", "Dimensions", "Performance"
    specs: [{
      label: String,
      value: String,
      unit: String
    }]
  }],
  
  // TCO Data
  tco: {
    fuelConsumption: Number,
    maintenanceCost: Number,
    insuranceCost: Number,
    depreciationRate: Number,
    resaleValue: Number,
    warrantyYears: Number,
    customFields: [{
      label: String,
      value: String
    }]
  },
  
  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    canonicalUrl: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  publishedAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});
```

### 4. Certified Refurbished Schema

```javascript
// models/CertifiedRefurbished.js
const certifiedRefurbishedSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    enum: ['JCB', 'Ashok Leyland', 'Switch EV', 'Other'],
    required: true
  },
  model: String,
  manufacturingYear: Number,
  
  // Usage Details
  usageHours: Number,      // For equipment
  kilometersDriven: Number, // For vehicles
  fuelType: {
    type: String,
    enum: ['Diesel', 'Petrol', 'CNG', 'Electric', 'Hybrid']
  },
  ownershipNumber: {
    type: Number,
    default: 1
  },
  
  // Condition Report
  conditionReport: {
    engine: {
      rating: { type: Number, min: 1, max: 5 },
      notes: String
    },
    transmission: {
      rating: { type: Number, min: 1, max: 5 },
      notes: String
    },
    body: {
      rating: { type: Number, min: 1, max: 5 },
      notes: String
    },
    tyres: {
      rating: { type: Number, min: 1, max: 5 },
      notes: String
    },
    hydraulics: {
      rating: { type: Number, min: 1, max: 5 },
      notes: String
    },
    electrical: {
      rating: { type: Number, min: 1, max: 5 },
      notes: String
    }
  },
  
  // 150-Point Inspection
  inspection: {
    isCompleted: Boolean,
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    score: Number, // Out of 150
    reportUrl: String
  },
  
  // Pricing
  price: {
    asking: Number,
    negotiable: Boolean,
    emiAvailable: Boolean
  },
  
  // Media
  images: [{
    url: String,
    publicId: String,
    alt: String,
    isPrimary: Boolean,
    order: Number
  }],
  
  // Brochure/Documentation
  brochure: {
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: Date
  },
  
  // Warranty
  warranty: {
    available: Boolean,
    months: Number,
    coverage: String
  },
  
  // Location
  location: {
    dealer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dealer'
    },
    city: String,
    state: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['available', 'reserved', 'sold', 'archived'],
    default: 'available'
  },
  
  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});
```

### 5. Lead Schema

```javascript
// models/Lead.js
const leadSchema = new mongoose.Schema({
  // Contact Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  alternatePhone: String,
  
  // Lead Source
  source: {
    type: String,
    enum: ['website', 'walk_in', 'referral', 'campaign', 'social_media', 'other'],
    default: 'website'
  },
  
  // UTM Tracking
  utm: {
    source: String,
    medium: String,
    campaign: String,
    term: String,
    content: String
  },
  
  // Interest
  interestedIn: {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    certifiedRefurbished: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CertifiedRefurbished'
    },
    category: String,
    brand: String
  },
  
  // Location
  location: {
    city: String,
    district: String,
    state: String,
    pincode: String
  },
  
  // Status & Assignment
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'negotiation', 'won', 'lost', 'junk'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Notes & Activity
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  activities: [{
    type: {
      type: String,
      enum: ['call', 'email', 'meeting', 'whatsapp', 'site_visit', 'demo', 'follow_up', 'status_change']
    },
    description: String,
    outcome: String,
    scheduledAt: Date,
    completedAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Follow-up
  nextFollowUp: Date,
  
  // Linked Records
  financeApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinanceApplication'
  },
  
  // Conversion
  convertedAt: Date,
  lostReason: String
}, {
  timestamps: true
});

// Indexes for search
leadSchema.index({ name: 'text', email: 'text', phone: 'text' });
leadSchema.index({ status: 1, assignedTo: 1 });
leadSchema.index({ createdAt: -1 });
```

### 6. Finance Application Schema

```javascript
// models/FinanceApplication.js
const financeApplicationSchema = new mongoose.Schema({
  // Applicant Info
  applicant: {
    name: { type: String, required: true },
    email: String,
    phone: { type: String, required: true },
    alternatePhone: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    panNumber: String,
    aadhaarNumber: String
  },
  
  // Address
  address: {
    current: {
      line1: String,
      line2: String,
      city: String,
      district: String,
      state: String,
      pincode: String
    },
    permanent: {
      line1: String,
      line2: String,
      city: String,
      district: String,
      state: String,
      pincode: String
    },
    sameAsCurrent: Boolean
  },
  
  // Employment
  employment: {
    type: { type: String, enum: ['salaried', 'self_employed', 'business', 'farmer', 'other'] },
    companyName: String,
    designation: String,
    monthlyIncome: Number,
    yearsInBusiness: Number
  },
  
  // Loan Details
  loan: {
    amount: Number,
    tenure: Number, // in months
    downPayment: Number,
    emiPreference: Number
  },
  
  // Product Interest
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  certifiedRefurbished: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CertifiedRefurbished'
  },
  
  // Documents
  documents: [{
    type: {
      type: String,
      enum: ['aadhaar_front', 'aadhaar_back', 'pan_card', 'income_proof', 'bank_statement', 'photo', 'address_proof', 'other']
    },
    url: String,        // Cloudinary URL
    publicId: String,
    uploadedAt: Date,
    verified: Boolean,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // CIBIL
  cibilCheck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CibilCheck'
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'documents_required', 'under_review', 'approved', 'rejected', 'disbursed', 'cancelled'],
    default: 'pending'
  },
  
  // Processing
  processing: {
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    rejectionReason: String,
    remarks: String
  },
  
  // Linked Lead
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  
  // Bank Details (for disbursement)
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String
  }
}, {
  timestamps: true
});
```

### 7. CIBIL Check Schema

```javascript
// models/CibilCheck.js
const cibilCheckSchema = new mongoose.Schema({
  // Customer Info
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    panNumber: String,
    dateOfBirth: Date
  },
  
  // CIBIL Result
  score: {
    type: Number,
    min: 300,
    max: 900
  },
  band: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'No History'],
    // Excellent: 750-900, Good: 700-749, Fair: 650-699, Poor: 300-649
  },
  
  // Documents (Masked for privacy)
  documents: {
    aadhaar: {
      number: String,      // Store last 4 digits only: XXXX-XXXX-1234
      frontUrl: String,
      backUrl: String,
      verified: Boolean
    },
    pan: {
      number: String,      // Masked: XXXXX1234X
      url: String,
      verified: Boolean
    }
  },
  
  // API Response (from CIBIL/credit bureau)
  apiResponse: {
    requestId: String,
    responseCode: String,
    rawResponse: mongoose.Schema.Types.Mixed, // Store complete response
    fetchedAt: Date
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'expired'],
    default: 'pending'
  },
  
  // Linked Records
  financeApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinanceApplication'
  },
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  
  // Audit
  checkedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expiresAt: Date // CIBIL scores typically valid for 30-90 days
}, {
  timestamps: true
});

// Calculate band based on score
cibilCheckSchema.pre('save', function(next) {
  if (this.score) {
    if (this.score >= 750) this.band = 'Excellent';
    else if (this.score >= 700) this.band = 'Good';
    else if (this.score >= 650) this.band = 'Fair';
    else if (this.score >= 300) this.band = 'Poor';
    else this.band = 'No History';
  }
  next();
});
```

### 8. Dealer Schema

```javascript
// models/Dealer.js
const dealerSchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    unique: true
  },
  type: {
    type: String,
    enum: ['authorized', 'associate', 'service_center'],
    default: 'authorized'
  },
  brands: [{
    type: String,
    enum: ['JCB', 'Ashok Leyland', 'Switch EV']
  }],
  
  // Contact
  contact: {
    phone: { type: String, required: true },
    alternatePhone: String,
    whatsapp: String,
    email: String,
    website: String
  },
  
  // Address
  address: {
    line1: String,
    line2: String,
    landmark: String,
    city: { type: String, required: true },
    district: String,
    state: { type: String, required: true },
    pincode: String
  },
  
  // Geo Location (for map)
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number] // [longitude, latitude]
  },
  
  // Operating Hours
  operatingHours: {
    weekdays: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String, isClosed: Boolean }
  },
  
  // Services Offered
  services: [{
    type: String,
    enum: ['sales', 'service', 'spare_parts', 'finance', 'insurance', 'exchange']
  }],
  
  // Manager Info
  manager: {
    name: String,
    phone: String,
    email: String
  },
  
  // Media
  images: [{
    url: String,
    publicId: String,
    alt: String,
    isPrimary: Boolean
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Ratings (from customer feedback)
  ratings: {
    average: { type: Number, min: 0, max: 5 },
    count: Number
  }
}, {
  timestamps: true
});

// Geo index for location-based queries
dealerSchema.index({ location: '2dsphere' });
dealerSchema.index({ 'address.city': 1, 'address.state': 1 });
```

### 9. Media Library Schemas

```javascript
// models/MediaItem.js
const mediaItemSchema = new mongoose.Schema({
  // File Info
  filename: {
    type: String,
    required: true
  },
  originalName: String,
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  mimeType: String,
  size: Number,
  
  // Cloudinary
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  thumbnailUrl: String,
  
  // Metadata
  title: {
    en: String,  // English
    hi: String   // Hindi
  },
  description: {
    en: String,
    hi: String
  },
  alt: String,
  tags: [String],
  
  // Organization
  album: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  },
  category: {
    type: String,
    enum: ['gallery', 'product', 'banner', 'event', 'team', 'other'],
    default: 'gallery'
  },
  order: {
    type: Number,
    default: 0
  },
  
  // Dimensions (for images)
  dimensions: {
    width: Number,
    height: Number
  },
  
  // Duration (for videos)
  duration: Number,
  
  // Status
  isPublic: {
    type: Boolean,
    default: true
  },
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// models/Album.js
const albumSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    hi: String
  },
  description: {
    en: String,
    hi: String
  },
  slug: {
    type: String,
    unique: true
  },
  coverImage: {
    url: String,
    publicId: String
  },
  order: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});
```

### 10. Offer & Scheme Schema

```javascript
// models/OfferScheme.js
const offerSchemeSchema = new mongoose.Schema({
  // Basic Info
  title: {
    en: { type: String, required: true },
    hi: String
  },
  description: {
    en: String,
    hi: String
  },
  type: {
    type: String,
    enum: ['discount', 'cashback', 'finance', 'exchange', 'accessory', 'service', 'combo', 'seasonal'],
    required: true
  },
  
  // Discount Details
  discount: {
    type: { type: String, enum: ['percentage', 'flat'] },
    value: Number,
    maxAmount: Number
  },
  
  // Validity
  validity: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  
  // Applicability
  applicableTo: {
    allProducts: Boolean,
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    brands: [String],
    categories: [String],
    segments: [String]
  },
  
  // Terms & Conditions
  terms: [String],
  
  // Media
  bannerImage: {
    url: String,
    publicId: String
  },
  thumbnailImage: {
    url: String,
    publicId: String
  },
  
  // Display
  displayOrder: {
    type: Number,
    default: 0
  },
  showOnHomepage: {
    type: Boolean,
    default: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'expired', 'archived'],
    default: 'draft'
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-update status based on dates
offerSchemeSchema.pre('save', function(next) {
  const now = new Date();
  if (this.validity.endDate < now) {
    this.status = 'expired';
  }
  next();
});
```

### 11. Content Page Schema

```javascript
// models/ContentPage.js
const contentPageSchema = new mongoose.Schema({
  // Basic Info
  title: {
    en: { type: String, required: true },
    hi: String
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['page', 'blog', 'news', 'faq', 'policy'],
    default: 'page'
  },
  
  // Content
  content: {
    en: { type: String, required: true }, // HTML/Markdown content
    hi: String
  },
  excerpt: {
    en: String,
    hi: String
  },
  
  // Featured Image
  featuredImage: {
    url: String,
    publicId: String,
    alt: String
  },
  
  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    canonicalUrl: String,
    noIndex: Boolean
  },
  
  // Organization
  category: String,
  tags: [String],
  order: Number,
  
  // Parent (for nested pages)
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentPage'
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  
  // Display
  showInNavigation: Boolean,
  showInFooter: Boolean,
  
  // Author
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});
```

### 12. Analytics Schema

```javascript
// models/Analytics.js
const analyticsSchema = new mongoose.Schema({
  // Date (for daily aggregation)
  date: {
    type: Date,
    required: true
  },
  
  // Traffic
  traffic: {
    totalVisits: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 }
  },
  
  // Page Analytics
  pages: [{
    path: String,
    views: Number,
    avgTimeOnPage: Number,
    bounceRate: Number
  }],
  
  // Source Analytics
  sources: {
    direct: Number,
    organic: Number,
    referral: Number,
    social: Number,
    paid: Number
  },
  
  // Device Analytics
  devices: {
    desktop: Number,
    mobile: Number,
    tablet: Number
  },
  
  // Geographic
  locations: [{
    state: String,
    city: String,
    visits: Number
  }]
}, {
  timestamps: true
});

// Unique index for daily records
analyticsSchema.index({ date: 1 }, { unique: true });

// Visitor Session Schema (for tracking)
const visitorSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  ip: String,
  userAgent: String,
  device: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
  
  // First visit info
  landingPage: String,
  referrer: String,
  utm: {
    source: String,
    medium: String,
    campaign: String
  },
  
  // Location
  location: {
    city: String,
    state: String,
    country: String
  },
  
  // Pages visited
  pages: [{
    path: String,
    visitedAt: Date,
    timeOnPage: Number
  }],
  
  // Session times
  startedAt: { type: Date, default: Date.now },
  lastActivityAt: { type: Date, default: Date.now },
  
  // Conversion events
  events: [{
    type: String,
    data: mongoose.Schema.Types.Mixed,
    occurredAt: Date
  }]
}, {
  timestamps: true
});

// TTL index - auto-delete after 90 days
visitorSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
```

### 13. Banner Schema

```javascript
// models/Banner.js
const bannerSchema = new mongoose.Schema({
  // Basic Info
  title: {
    en: { type: String, required: true },
    hi: String
  },
  subtitle: {
    en: String,
    hi: String
  },
  
  // Placement
  placement: {
    type: String,
    enum: ['home_hero', 'home_secondary', 'product_page', 'category_page', 'popup', 'sidebar'],
    required: true
  },
  
  // Media
  image: {
    desktop: {
      url: String,
      publicId: String
    },
    mobile: {
      url: String,
      publicId: String
    }
  },
  video: {
    url: String,
    publicId: String
  },
  
  // Link
  link: {
    url: String,
    openInNewTab: Boolean,
    linkType: { type: String, enum: ['internal', 'external', 'product', 'category'] }
  },
  
  // CTA Button
  cta: {
    text: {
      en: String,
      hi: String
    },
    style: { type: String, enum: ['primary', 'secondary', 'outline'] }
  },
  
  // Display Settings
  display: {
    order: { type: Number, default: 0 },
    showOnMobile: { type: Boolean, default: true },
    showOnDesktop: { type: Boolean, default: true }
  },
  
  // Schedule
  schedule: {
    startDate: Date,
    endDate: Date,
    isAlwaysActive: { type: Boolean, default: true }
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'scheduled', 'expired', 'archived'],
    default: 'draft'
  },
  
  // Analytics
  analytics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});
```

### 14. Setting Schema

```javascript
// models/Setting.js
const settingSchema = new mongoose.Schema({
  // Setting Key
  key: {
    type: String,
    required: true,
    unique: true
  },
  
  // Setting Value (flexible)
  value: mongoose.Schema.Types.Mixed,
  
  // Categorization
  category: {
    type: String,
    enum: ['general', 'contact', 'social', 'seo', 'email', 'notifications', 'integrations', 'appearance'],
    required: true
  },
  
  // Metadata
  label: String,
  description: String,
  inputType: {
    type: String,
    enum: ['text', 'textarea', 'number', 'boolean', 'select', 'multiselect', 'image', 'json'],
    default: 'text'
  },
  options: [String], // For select/multiselect
  
  // Visibility
  isPublic: {
    type: Boolean,
    default: false // Public settings can be fetched without auth
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Default Settings to Seed
/*
[
  { key: 'company_name', value: 'Patliputra Motors', category: 'general', label: 'Company Name' },
  { key: 'company_tagline', value: 'Your Trusted Partner', category: 'general', label: 'Tagline' },
  { key: 'company_email', value: 'info@patliputramotors.com', category: 'contact', label: 'Email' },
  { key: 'company_phone', value: '+91 XXXXX XXXXX', category: 'contact', label: 'Phone' },
  { key: 'company_address', value: '...', category: 'contact', label: 'Address' },
  { key: 'social_facebook', value: '', category: 'social', label: 'Facebook URL' },
  { key: 'social_instagram', value: '', category: 'social', label: 'Instagram URL' },
  { key: 'social_youtube', value: '', category: 'social', label: 'YouTube URL' },
  { key: 'social_linkedin', value: '', category: 'social', label: 'LinkedIn URL' },
  { key: 'seo_default_title', value: 'Patliputra Motors', category: 'seo', label: 'Default Meta Title' },
  { key: 'seo_default_description', value: '...', category: 'seo', label: 'Default Meta Description' },
  { key: 'google_analytics_id', value: '', category: 'integrations', label: 'Google Analytics ID' },
  { key: 'primary_color', value: '#ff6600', category: 'appearance', label: 'Primary Color' },
  { key: 'logo_url', value: '', category: 'appearance', label: 'Logo', inputType: 'image' }
]
*/
```

---

## API Endpoints

### Base URL
```
Production: https://api.patliputramotors.com/api/v1
Development: http://localhost:5000/api/v1
```

### Standard Response Format

```javascript
// Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}

// Error Response
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

---

## 1. Authentication APIs

### POST /auth/login
Login user and get JWT token.

**Request:**
```json
{
  "email": "admin@patliputra.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "64abc123...",
      "name": "Master Admin",
      "email": "admin@patliputra.com",
      "role": "master_admin",
      "permissions": { ... }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  }
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/logout
Logout and invalidate tokens.

**Headers:**
```
Authorization: Bearer <accessToken>
```

### GET /auth/me
Get current user profile.

**Headers:**
```
Authorization: Bearer <accessToken>
```

### PUT /auth/change-password
Change current user's password.

**Request:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### POST /auth/forgot-password
Request password reset email.

**Request:**
```json
{
  "email": "user@example.com"
}
```

### POST /auth/reset-password
Reset password with token.

**Request:**
```json
{
  "token": "reset_token_from_email",
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

---

## 2. Dashboard APIs

### GET /dashboard/stats
Get dashboard statistics.

**Query Parameters:**
- `dateRange`: `today` | `yesterday` | `week` | `month` | `year` | `custom`
- `startDate`: ISO date (for custom range)
- `endDate`: ISO date (for custom range)

**Response:**
```json
{
  "success": true,
  "data": {
    "leads": {
      "total": 1250,
      "new": 45,
      "converted": 89,
      "conversionRate": 7.12,
      "trend": 12.5
    },
    "finance": {
      "total": 320,
      "pending": 45,
      "approved": 180,
      "rejected": 35,
      "approvalRate": 56.25
    },
    "products": {
      "total": 85,
      "published": 72,
      "draft": 13
    },
    "certifiedRefurbished": {
      "total": 34,
      "available": 28,
      "sold": 6
    },
    "traffic": {
      "totalVisits": 15420,
      "uniqueVisitors": 8930,
      "bounceRate": 42.5
    },
    "revenue": {
      "total": 4500000,
      "thisMonth": 650000,
      "trend": 8.3
    }
  }
}
```

### GET /dashboard/charts/leads
Get leads chart data.

**Query Parameters:**
- `period`: `7d` | `30d` | `90d` | `12m`
- `groupBy`: `day` | `week` | `month`

**Response:**
```json
{
  "success": true,
  "data": {
    "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "datasets": [
      {
        "label": "New Leads",
        "data": [12, 19, 3, 5, 2, 3, 9]
      },
      {
        "label": "Converted",
        "data": [2, 4, 1, 2, 0, 1, 3]
      }
    ]
  }
}
```

### GET /dashboard/charts/finance
Get finance application chart data.

### GET /dashboard/charts/brands
Get brand-wise distribution.

### GET /dashboard/recent-leads
Get recent leads for quick view.

**Query Parameters:**
- `limit`: Number (default: 5)

### GET /dashboard/recent-activities
Get recent system activities.

---

## 3. Products APIs

### GET /products
Get all products with filtering and pagination.

**Query Parameters:**
- `page`: Number (default: 1)
- `limit`: Number (default: 10)
- `search`: String (search in name, model)
- `brand`: String (JCB | Ashok Leyland | Switch EV)
- `segment`: String
- `category`: String
- `status`: String (draft | published | archived)
- `hasBrochure`: Boolean
- `isFeatured`: Boolean
- `sortBy`: String (createdAt | name | price)
- `sortOrder`: String (asc | desc)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "64abc123...",
      "name": "JCB 3DX Backhoe Loader",
      "slug": "jcb-3dx-backhoe-loader",
      "brand": "JCB",
      "model": "3DX",
      "segment": "Construction",
      "category": "Backhoe Loader",
      "price": {
        "base": 2500000,
        "showOnWebsite": true
      },
      "images": [...],
      "brochure": {...},
      "status": "published",
      "isFeatured": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 85,
    "totalPages": 9
  }
}
```

### GET /products/:id
Get single product by ID.

### POST /products
Create new product.

**Request (multipart/form-data):**
```
name: "JCB 3DX Backhoe Loader"
brand: "JCB"
model: "3DX"
segment: "Construction"
category: "Backhoe Loader"
price[base]: 2500000
price[showOnWebsite]: true
specifications: JSON string
tco: JSON string
seo: JSON string
status: "draft"
images: File[] (uploaded to Cloudinary)
brochure: File (uploaded to server)
```

### PUT /products/:id
Update product.

### DELETE /products/:id
Delete product (soft delete - moves to archived).

### POST /products/:id/images
Upload additional images to product.

### DELETE /products/:id/images/:imageId
Remove image from product.

### POST /products/:id/brochure
Upload/replace brochure PDF.

### DELETE /products/:id/brochure
Remove brochure.

### PUT /products/:id/status
Update product status.

**Request:**
```json
{
  "status": "published"
}
```

### PUT /products/reorder
Reorder products.

**Request:**
```json
{
  "items": [
    { "id": "abc123", "order": 1 },
    { "id": "def456", "order": 2 }
  ]
}
```

---

## 4. Certified Refurbished APIs

### GET /certified-refurbished
Get all certified refurbished vehicles.

**Query Parameters:**
- `page`, `limit`, `search`
- `brand`: String
- `status`: available | reserved | sold | archived
- `fuelType`: String
- `priceMin`, `priceMax`: Number
- `yearMin`, `yearMax`: Number
- `sortBy`, `sortOrder`

### GET /certified-refurbished/:id
Get single vehicle.

### POST /certified-refurbished
Create new certified refurbished listing.

**Request (multipart/form-data):**
```
name: "JCB 3DX 2020"
brand: "JCB"
model: "3DX"
manufacturingYear: 2020
usageHours: 3500
fuelType: "Diesel"
ownershipNumber: 1
conditionReport: JSON string
inspection: JSON string
price[asking]: 1800000
price[negotiable]: true
warranty[available]: true
warranty[months]: 6
location[city]: "Patna"
location[state]: "Bihar"
images: File[]
brochure: File
```

### PUT /certified-refurbished/:id
Update vehicle.

### DELETE /certified-refurbished/:id
Delete vehicle.

### PUT /certified-refurbished/:id/inspection
Update inspection details.

**Request:**
```json
{
  "isCompleted": true,
  "score": 142,
  "reportUrl": "https://..."
}
```

---

## 5. Leads APIs

### GET /leads
Get all leads with filtering.

**Query Parameters:**
- `page`, `limit`, `search`
- `status`: new | contacted | qualified | negotiation | won | lost | junk
- `priority`: low | medium | high | urgent
- `source`: website | walk_in | referral | campaign | social_media | other
- `assignedTo`: User ID
- `brand`: String
- `startDate`, `endDate`: Date range
- `hasFollowUp`: Boolean
- `sortBy`, `sortOrder`

### GET /leads/:id
Get single lead with full activity history.

### POST /leads
Create new lead.

**Request:**
```json
{
  "name": "Ramesh Kumar",
  "phone": "+91 9876543210",
  "email": "ramesh@example.com",
  "source": "website",
  "interestedIn": {
    "product": "product_id",
    "brand": "JCB"
  },
  "location": {
    "city": "Patna",
    "state": "Bihar"
  },
  "utm": {
    "source": "google",
    "medium": "cpc",
    "campaign": "summer_sale"
  }
}
```

### PUT /leads/:id
Update lead.

### DELETE /leads/:id
Delete lead.

### PUT /leads/:id/status
Update lead status.

**Request:**
```json
{
  "status": "qualified",
  "note": "Customer confirmed budget and timeline"
}
```

### PUT /leads/:id/assign
Assign lead to user.

**Request:**
```json
{
  "assignedTo": "user_id"
}
```

### POST /leads/:id/notes
Add note to lead.

**Request:**
```json
{
  "content": "Customer prefers financing option"
}
```

### POST /leads/:id/activities
Add activity to lead.

**Request:**
```json
{
  "type": "call",
  "description": "Initial call to discuss requirements",
  "outcome": "Customer interested, requested brochure",
  "scheduledAt": "2024-01-20T10:00:00Z"
}
```

### PUT /leads/:id/activities/:activityId
Update activity (mark as completed).

### POST /leads/:id/follow-up
Schedule follow-up.

**Request:**
```json
{
  "date": "2024-01-22T14:00:00Z",
  "note": "Send quotation"
}
```

### GET /leads/export
Export leads to CSV/Excel.

**Query Parameters:**
- All filter parameters from GET /leads
- `format`: csv | xlsx

---

## 6. Finance Application APIs

### GET /finance
Get all finance applications.

**Query Parameters:**
- `page`, `limit`, `search`
- `status`: pending | documents_required | under_review | approved | rejected | disbursed | cancelled
- `assignedTo`: User ID
- `startDate`, `endDate`
- `hasLead`: Boolean
- `sortBy`, `sortOrder`

### GET /finance/:id
Get single application with all details.

### POST /finance
Create new finance application.

**Request (multipart/form-data):**
```
applicant[name]: "Suresh Yadav"
applicant[phone]: "+91 9876543210"
applicant[email]: "suresh@example.com"
applicant[panNumber]: "ABCDE1234F"
applicant[dateOfBirth]: "1985-05-15"
address[current][line1]: "123 Main Street"
address[current][city]: "Patna"
employment[type]: "self_employed"
employment[monthlyIncome]: 75000
loan[amount]: 1500000
loan[tenure]: 60
product: "product_id"
lead: "lead_id"
documents: File[] (Aadhaar, PAN, etc.)
```

### PUT /finance/:id
Update application.

### DELETE /finance/:id
Delete application.

### PUT /finance/:id/status
Update application status.

**Request:**
```json
{
  "status": "approved",
  "remarks": "All documents verified successfully"
}
```

### POST /finance/:id/documents
Upload additional documents.

**Request (multipart/form-data):**
```
type: "bank_statement"
document: File
```

### PUT /finance/:id/documents/:docId/verify
Verify document.

**Request:**
```json
{
  "verified": true
}
```

### PUT /finance/:id/assign
Assign application to user.

### GET /finance/export
Export finance applications.

---

## 7. CIBIL Check APIs

### GET /cibil
Get all CIBIL checks.

**Query Parameters:**
- `page`, `limit`, `search`
- `band`: Excellent | Good | Fair | Poor | No History
- `status`: pending | completed | failed | expired
- `startDate`, `endDate`
- `sortBy`, `sortOrder`

### GET /cibil/:id
Get single CIBIL check.

### POST /cibil/check
Initiate new CIBIL check.

**Request:**
```json
{
  "customer": {
    "name": "Amit Kumar",
    "phone": "+91 9876543210",
    "panNumber": "ABCDE1234F",
    "dateOfBirth": "1990-03-15"
  },
  "financeApplication": "finance_app_id",
  "lead": "lead_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "CIBIL check initiated",
  "data": {
    "id": "cibil_check_id",
    "status": "pending"
  }
}
```

### GET /cibil/:id/result
Get CIBIL check result.

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 745,
    "band": "Good",
    "documents": {
      "aadhaar": { "number": "XXXX-XXXX-1234", "verified": true },
      "pan": { "number": "XXXXX1234X", "verified": true }
    },
    "status": "completed",
    "checkedAt": "2024-01-15T10:30:00Z",
    "expiresAt": "2024-04-15T10:30:00Z"
  }
}
```

### POST /cibil/:id/documents
Upload identity documents.

**Request (multipart/form-data):**
```
aadhaarFront: File
aadhaarBack: File
panCard: File
```

### GET /cibil/stats
Get CIBIL check statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalChecks": 450,
    "thisMonth": 45,
    "byBand": {
      "Excellent": 120,
      "Good": 180,
      "Fair": 90,
      "Poor": 50,
      "No History": 10
    },
    "averageScore": 698
  }
}
```

---

## 8. Dealer APIs

### GET /dealers
Get all dealers.

**Query Parameters:**
- `page`, `limit`, `search`
- `city`, `state`, `district`
- `brand`: String
- `type`: authorized | associate | service_center
- `services`: String (comma-separated)
- `isActive`: Boolean
- `lat`, `lng`, `radius`: For geo-search (in km)
- `sortBy`, `sortOrder`

### GET /dealers/:id
Get single dealer.

### POST /dealers
Create new dealer.

**Request (multipart/form-data):**
```json
{
  "name": "Patliputra Motors Patna",
  "code": "PM-PAT-001",
  "type": "authorized",
  "brands": ["JCB", "Ashok Leyland"],
  "contact": {
    "phone": "+91 9876543210",
    "whatsapp": "+91 9876543210",
    "email": "patna@patliputramotors.com"
  },
  "address": {
    "line1": "NH-30, Bailey Road",
    "city": "Patna",
    "district": "Patna",
    "state": "Bihar",
    "pincode": "800001"
  },
  "location": {
    "coordinates": [85.1376, 25.5941]
  },
  "operatingHours": {
    "weekdays": { "open": "09:00", "close": "18:00" },
    "saturday": { "open": "09:00", "close": "14:00" },
    "sunday": { "isClosed": true }
  },
  "services": ["sales", "service", "spare_parts", "finance"],
  "manager": {
    "name": "Rajesh Kumar",
    "phone": "+91 9876543211"
  }
}
images: File[]
```

### PUT /dealers/:id
Update dealer.

### DELETE /dealers/:id
Delete dealer (soft delete).

### PUT /dealers/:id/status
Toggle dealer active status.

### GET /dealers/nearby
Find dealers near a location.

**Query Parameters:**
- `lat`: Latitude (required)
- `lng`: Longitude (required)
- `radius`: Radius in km (default: 50)
- `brand`: Filter by brand
- `service`: Filter by service

---

## 9. Media Library APIs

### Albums

### GET /media/albums
Get all albums.

### GET /media/albums/:id
Get album with media items.

### POST /media/albums
Create new album.

**Request:**
```json
{
  "name": {
    "en": "Product Gallery",
    "hi": "उत्पाद गैलरी"
  },
  "description": {
    "en": "Collection of product images"
  },
  "isPublic": true
}
```

### PUT /media/albums/:id
Update album.

### DELETE /media/albums/:id
Delete album (and optionally its media).

### PUT /media/albums/reorder
Reorder albums.

### Media Items

### GET /media
Get all media items.

**Query Parameters:**
- `page`, `limit`, `search`
- `type`: image | video
- `category`: gallery | product | banner | event | team | other
- `album`: Album ID
- `isPublic`: Boolean
- `sortBy`, `sortOrder`

### GET /media/:id
Get single media item.

### POST /media/upload
Upload new media.

**Request (multipart/form-data):**
```
files: File[] (uploaded to Cloudinary)
album: "album_id"
category: "gallery"
title[en]: "Factory Image"
title[hi]: "फैक्ट्री छवि"
tags: "factory,production"
```

### PUT /media/:id
Update media metadata.

### DELETE /media/:id
Delete media (removes from Cloudinary).

### PUT /media/reorder
Reorder media items.

**Request:**
```json
{
  "items": [
    { "id": "media1", "order": 1 },
    { "id": "media2", "order": 2 }
  ]
}
```

### POST /media/bulk-delete
Delete multiple media items.

**Request:**
```json
{
  "ids": ["id1", "id2", "id3"]
}
```

---

## 10. Offers & Schemes APIs

### GET /offers
Get all offers and schemes.

**Query Parameters:**
- `page`, `limit`, `search`
- `type`: discount | cashback | finance | exchange | accessory | service | combo | seasonal
- `status`: draft | active | expired | archived
- `brand`: String
- `isHomepage`: Boolean
- `startDate`, `endDate`
- `sortBy`, `sortOrder`

### GET /offers/active
Get currently active offers (public API).

### GET /offers/:id
Get single offer.

### POST /offers
Create new offer.

**Request (multipart/form-data):**
```json
{
  "title": {
    "en": "Summer Sale - 10% Off",
    "hi": "ग्रीष्मकालीन बिक्री - 10% छूट"
  },
  "description": {
    "en": "Get 10% discount on all JCB products"
  },
  "type": "discount",
  "discount": {
    "type": "percentage",
    "value": 10,
    "maxAmount": 100000
  },
  "validity": {
    "startDate": "2024-04-01T00:00:00Z",
    "endDate": "2024-04-30T23:59:59Z"
  },
  "applicableTo": {
    "allProducts": false,
    "brands": ["JCB"]
  },
  "terms": [
    "Valid on new bookings only",
    "Cannot be combined with other offers"
  ],
  "showOnHomepage": true,
  "status": "active"
}
bannerImage: File
thumbnailImage: File
```

### PUT /offers/:id
Update offer.

### DELETE /offers/:id
Delete offer.

### PUT /offers/:id/status
Update offer status.

### PUT /offers/reorder
Reorder offers display order.

---

## 11. Content Pages APIs

### GET /content-pages
Get all content pages.

**Query Parameters:**
- `page`, `limit`, `search`
- `type`: page | blog | news | faq | policy
- `status`: draft | published | archived
- `category`: String
- `parent`: Parent page ID
- `sortBy`, `sortOrder`

### GET /content-pages/slug/:slug
Get page by slug (public API).

### GET /content-pages/:id
Get single page.

### POST /content-pages
Create new content page.

**Request (multipart/form-data):**
```json
{
  "title": {
    "en": "About Us",
    "hi": "हमारे बारे में"
  },
  "slug": "about-us",
  "type": "page",
  "content": {
    "en": "<h1>About Patliputra Motors</h1><p>...</p>",
    "hi": "<h1>पटलीपुत्र मोटर्स के बारे में</h1><p>...</p>"
  },
  "excerpt": {
    "en": "Learn about our company and values"
  },
  "seo": {
    "metaTitle": "About Us | Patliputra Motors",
    "metaDescription": "Learn about Patliputra Motors..."
  },
  "showInNavigation": true,
  "showInFooter": true,
  "status": "published"
}
featuredImage: File
```

### PUT /content-pages/:id
Update page.

### DELETE /content-pages/:id
Delete page.

### PUT /content-pages/:id/status
Update page status.

### PUT /content-pages/reorder
Reorder pages.

---

## 12. Analytics APIs

### GET /analytics/overview
Get analytics overview.

**Query Parameters:**
- `startDate`: ISO date (required)
- `endDate`: ISO date (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "traffic": {
      "totalVisits": 45230,
      "uniqueVisitors": 28450,
      "pageViews": 125600,
      "avgSessionDuration": 245,
      "bounceRate": 42.5,
      "trends": {
        "visits": 12.5,
        "visitors": 8.3
      }
    },
    "topPages": [
      { "path": "/products", "views": 12500, "avgTime": 180 },
      { "path": "/", "views": 10200, "avgTime": 45 }
    ],
    "sources": {
      "direct": 35,
      "organic": 40,
      "referral": 15,
      "social": 8,
      "paid": 2
    },
    "devices": {
      "desktop": 45,
      "mobile": 50,
      "tablet": 5
    },
    "topLocations": [
      { "state": "Bihar", "visits": 12500 },
      { "state": "Jharkhand", "visits": 8200 }
    ]
  }
}
```

### GET /analytics/traffic
Get traffic data over time.

**Query Parameters:**
- `startDate`, `endDate`
- `granularity`: hourly | daily | weekly | monthly

### GET /analytics/pages
Get page-level analytics.

### GET /analytics/sources
Get traffic source breakdown.

### GET /analytics/locations
Get geographic distribution.

### POST /analytics/track
Track page view (public API).

**Request:**
```json
{
  "sessionId": "session_uuid",
  "path": "/products/jcb-3dx",
  "referrer": "https://google.com",
  "userAgent": "Mozilla/5.0...",
  "utm": {
    "source": "google",
    "medium": "organic"
  }
}
```

### POST /analytics/event
Track custom event (public API).

**Request:**
```json
{
  "sessionId": "session_uuid",
  "event": "product_view",
  "data": {
    "productId": "product_123",
    "productName": "JCB 3DX"
  }
}
```

### GET /analytics/export
Export analytics data.

---

## 13. Banner APIs

### GET /banners
Get all banners.

**Query Parameters:**
- `page`, `limit`
- `placement`: home_hero | home_secondary | product_page | category_page | popup | sidebar
- `status`: draft | active | scheduled | expired | archived
- `sortBy`, `sortOrder`

### GET /banners/active
Get active banners by placement (public API).

**Query Parameters:**
- `placement`: Required

### GET /banners/:id
Get single banner.

### POST /banners
Create new banner.

**Request (multipart/form-data):**
```json
{
  "title": {
    "en": "New JCB 4DX Launch",
    "hi": "नया JCB 4DX लॉन्च"
  },
  "subtitle": {
    "en": "Experience the power"
  },
  "placement": "home_hero",
  "link": {
    "url": "/products/jcb-4dx",
    "linkType": "internal"
  },
  "cta": {
    "text": { "en": "Learn More" },
    "style": "primary"
  },
  "display": {
    "order": 1,
    "showOnMobile": true,
    "showOnDesktop": true
  },
  "schedule": {
    "isAlwaysActive": false,
    "startDate": "2024-04-01",
    "endDate": "2024-04-30"
  },
  "status": "active"
}
imageDesktop: File
imageMobile: File
video: File (optional)
```

### PUT /banners/:id
Update banner.

### DELETE /banners/:id
Delete banner.

### PUT /banners/:id/status
Update banner status.

### PUT /banners/reorder
Reorder banners.

### POST /banners/:id/analytics
Track banner impression/click.

**Request:**
```json
{
  "type": "impression" | "click"
}
```

---

## 14. Settings APIs

### GET /settings
Get all settings (admin only).

**Query Parameters:**
- `category`: general | contact | social | seo | email | notifications | integrations | appearance

### GET /settings/public
Get public settings (no auth required).

### GET /settings/:key
Get single setting by key.

### PUT /settings/:key
Update setting.

**Request:**
```json
{
  "value": "new_value"
}
```

### PUT /settings/bulk
Update multiple settings.

**Request:**
```json
{
  "settings": [
    { "key": "company_name", "value": "Patliputra Motors" },
    { "key": "company_email", "value": "info@patliputramotors.com" }
  ]
}
```

### POST /settings/:key/image
Upload image for setting (logo, favicon, etc.).

**Request (multipart/form-data):**
```
image: File
```

---

## 15. Users & Roles APIs

### Users

### GET /users
Get all users.

**Query Parameters:**
- `page`, `limit`, `search`
- `role`: String
- `isActive`: Boolean
- `sortBy`, `sortOrder`

**Access:** master_admin, admin (limited)

### GET /users/:id
Get single user.

### POST /users
Create new user.

**Request:**
```json
{
  "name": "New User",
  "email": "newuser@patliputra.com",
  "password": "password123",
  "phone": "+91 9876543210",
  "role": "sales_user",
  "permissions": {
    "leads": { "view": true, "create": true, "edit": true, "delete": false }
  },
  "isActive": true
}
```

**Access:** master_admin only

### PUT /users/:id
Update user.

### DELETE /users/:id
Delete user (soft delete - deactivate).

### PUT /users/:id/status
Toggle user active status.

### PUT /users/:id/role
Change user role.

**Request:**
```json
{
  "role": "admin",
  "customRole": "custom_role_id" // optional, for custom roles
}
```

### PUT /users/:id/permissions
Update user-specific permissions.

**Request:**
```json
{
  "permissions": {
    "products": { "view": true, "create": true, "edit": true, "delete": false },
    "leads": { "view": true, "create": true, "edit": true, "delete": true, "export": true }
  }
}
```

### Roles

### GET /roles
Get all roles.

### GET /roles/:id
Get single role.

### POST /roles
Create custom role.

**Request:**
```json
{
  "name": "branch_manager",
  "displayName": "Branch Manager",
  "permissions": {
    "dashboard": { "view": true, "create": false, "edit": false, "delete": false },
    "products": { "view": true, "create": false, "edit": false, "delete": false },
    "leads": { "view": true, "create": true, "edit": true, "delete": false },
    "finance": { "view": true, "create": true, "edit": true, "delete": false },
    "dealers": { "view": true, "create": false, "edit": false, "delete": false }
  }
}
```

**Access:** master_admin only

### PUT /roles/:id
Update custom role.

### DELETE /roles/:id
Delete custom role (only non-system roles).

---

## Middleware Implementation

### Authentication Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('customRole');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};
```

### RBAC Middleware

```javascript
// middleware/rbac.js
const { ROLE_PERMISSIONS } = require('../config/permissions');

// Check specific permission on a module
exports.checkPermission = (module, action) => {
  return (req, res, next) => {
    const { user } = req;
    
    // Get permissions from role or custom role
    let permissions;
    if (user.customRole) {
      permissions = user.customRole.permissions;
    } else if (user.permissions && user.permissions.size > 0) {
      // User-specific permission overrides
      permissions = Object.fromEntries(user.permissions);
    } else {
      permissions = ROLE_PERMISSIONS[user.role];
    }
    
    if (!permissions) {
      return res.status(403).json({
        success: false,
        message: 'Role not configured'
      });
    }
    
    const modulePermissions = permissions[module];
    if (!modulePermissions || !modulePermissions[action]) {
      return res.status(403).json({
        success: false,
        message: `You don't have permission to ${action} ${module}`
      });
    }
    
    next();
  };
};

// Check if user can view module
exports.canView = (module) => exports.checkPermission(module, 'view');
exports.canCreate = (module) => exports.checkPermission(module, 'create');
exports.canEdit = (module) => exports.checkPermission(module, 'edit');
exports.canDelete = (module) => exports.checkPermission(module, 'delete');
exports.canExport = (module) => exports.checkPermission(module, 'export');

// Master admin only
exports.masterAdminOnly = (req, res, next) => {
  if (req.user.role !== 'master_admin') {
    return res.status(403).json({
      success: false,
      message: 'This action requires master admin privileges'
    });
  }
  next();
};

// Admin or above
exports.adminOnly = (req, res, next) => {
  if (!['master_admin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'This action requires admin privileges'
    });
  }
  next();
};
```

### File Upload Middleware

```javascript
// middleware/upload.js
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Cloudinary storage for images
const cloudinaryStorage = require('multer-storage-cloudinary').CloudinaryStorage;
const cloudinary = require('../config/cloudinary');

const imageStorage = new cloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'patliputra-motors',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  }
});

// Local storage for brochures/PDFs
const brochureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.BROCHURE_UPLOAD_PATH || './uploads/brochures');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filters
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const brochureFilter = (req, file, cb) => {
  const allowedTypes = /pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'application/pdf';
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for brochures'), false);
  }
};

exports.uploadImages = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

exports.uploadBrochure = multer({
  storage: brochureStorage,
  fileFilter: brochureFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

exports.uploadDocuments = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});
```

---

## Route Examples

### Products Routes

```javascript
// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { canView, canCreate, canEdit, canDelete } = require('../middleware/rbac');
const { uploadImages, uploadBrochure } = require('../middleware/upload');

// Public routes (if needed)
// router.get('/public', productController.getPublicProducts);

// Protected routes
router.use(protect);

router
  .route('/')
  .get(canView('products'), productController.getProducts)
  .post(
    canCreate('products'),
    uploadImages.array('images', 10),
    uploadBrochure.single('brochure'),
    productController.createProduct
  );

router
  .route('/:id')
  .get(canView('products'), productController.getProduct)
  .put(
    canEdit('products'),
    uploadImages.array('images', 10),
    uploadBrochure.single('brochure'),
    productController.updateProduct
  )
  .delete(canDelete('products'), productController.deleteProduct);

router.put('/:id/status', canEdit('products'), productController.updateStatus);
router.post('/:id/images', canEdit('products'), uploadImages.array('images', 10), productController.addImages);
router.delete('/:id/images/:imageId', canEdit('products'), productController.removeImage);
router.post('/:id/brochure', canEdit('products'), uploadBrochure.single('brochure'), productController.uploadBrochure);
router.delete('/:id/brochure', canEdit('products'), productController.removeBrochure);
router.put('/reorder', canEdit('products'), productController.reorderProducts);

module.exports = router;
```

---

## Cloudinary Service

```javascript
// services/cloudinaryService.js
const cloudinary = require('../config/cloudinary');

exports.uploadImage = async (file, folder = 'general') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `patliputra-motors/${folder}`,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

exports.deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error(`Failed to delete image: ${error.message}`);
    return false;
  }
};

exports.uploadVideo = async (file, folder = 'videos') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: `patliputra-motors/${folder}`,
      resource_type: 'video',
      eager: [
        { format: 'mp4', transformation: [{ quality: 'auto' }] }
      ]
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration,
      thumbnailUrl: result.secure_url.replace(/\.[^/.]+$/, '.jpg')
    };
  } catch (error) {
    throw new Error(`Video upload failed: ${error.message}`);
  }
};

exports.getOptimizedUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    ...options
  });
};
```

---

## CIBIL Service Integration

```javascript
// services/cibilService.js

// Note: This is a mock implementation
// Replace with actual CIBIL/Credit Bureau API integration

exports.checkCibilScore = async (customerData) => {
  try {
    // In production, call actual CIBIL API
    // const response = await axios.post(CIBIL_API_URL, {
    //   panNumber: customerData.panNumber,
    //   name: customerData.name,
    //   dob: customerData.dateOfBirth,
    //   // ... other required fields
    // }, {
    //   headers: {
    //     'Authorization': `Bearer ${CIBIL_API_KEY}`
    //   }
    // });
    
    // Mock response for development
    const mockScore = Math.floor(Math.random() * (850 - 400) + 400);
    
    return {
      success: true,
      requestId: `CIBIL_${Date.now()}`,
      score: mockScore,
      responseCode: 'SUCCESS',
      fetchedAt: new Date()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      responseCode: 'ERROR'
    };
  }
};

exports.verifyPAN = async (panNumber, name, dob) => {
  // Integrate with PAN verification API
  // Mock implementation
  return {
    valid: true,
    name: name,
    maskedPan: `XXXXX${panNumber.slice(-5)}`
  };
};

exports.verifyAadhaar = async (aadhaarNumber) => {
  // Integrate with Aadhaar verification API (requires separate consent)
  // Mock implementation
  return {
    valid: true,
    maskedNumber: `XXXX-XXXX-${aadhaarNumber.slice(-4)}`
  };
};
```

---

## Error Codes Reference

| Code | Message | HTTP Status |
|------|---------|-------------|
| AUTH_001 | Invalid credentials | 401 |
| AUTH_002 | Token expired | 401 |
| AUTH_003 | User not found | 404 |
| AUTH_004 | Account disabled | 403 |
| RBAC_001 | Permission denied | 403 |
| RBAC_002 | Role not found | 404 |
| VAL_001 | Validation error | 400 |
| VAL_002 | Invalid file type | 400 |
| VAL_003 | File too large | 400 |
| DB_001 | Database error | 500 |
| DB_002 | Duplicate entry | 409 |
| DB_003 | Record not found | 404 |
| UPLOAD_001 | Upload failed | 500 |
| CIBIL_001 | CIBIL check failed | 500 |
| CIBIL_002 | Invalid PAN | 400 |

---

## Frontend Integration Guide

### API Configuration

```typescript
// src/lib/api.ts (update)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Axios instance with interceptors
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - try refresh or logout
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### React Query Hooks Example

```typescript
// src/hooks/useProducts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export function useProducts(params?: ProductsQueryParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await api.get('/products', { params });
      return data;
    }
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data;
    },
    enabled: !!id
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  F
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, formData }: { id: string; formData: FormData }) => {
      const { data } = await api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', id] });
    }
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/products/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });
}
```

---

## Deployment Notes

### Environment Setup

1. **MongoDB**: Use MongoDB Atlas for production or self-hosted MongoDB with replica sets
2. **Cloudinary**: Create separate folders for production/staging
3. **Brochure Storage**: 
   - Development: Local file system
   - Production: Consider S3, GCS, or dedicated file server
4. **CORS**: Configure allowed origins for production

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Implement rate limiting
- [ ] Sanitize all user inputs
- [ ] Use helmet.js for security headers
- [ ] Implement request logging
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Regular security audits
- [ ] Rotate JWT secrets periodically
- [ ] Mask sensitive data in logs

---

## Summary

This documentation covers the complete backend API for the Patliputra Motors admin panel with:

- **15 main modules** with full CRUD operations
- **Role-based access control** with 3 default roles and custom role support
- **Cloudinary integration** for images and videos
- **Local storage** for brochures and PDFs
- **MongoDB schemas** with all required fields and relationships
- **Middleware** for auth, RBAC, file uploads, and validation
- **Standard API response format** for consistent frontend integration

Use this documentation to generate the complete backend codebase with any AI code generator or as a reference for manual implementation.
