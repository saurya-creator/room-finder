export type UserRole = "USER" | "OWNER" | "ADMIN";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  avatar?: string | null;
  gender?: string | null;
  occupation?: string | null;
  collegeOrCompany?: string | null;
  preferredCity?: string | null;
  budget?: number | null;
  isVerified: boolean;
}

export interface AmenityItem {
  id: string;
  name: string;
  category: string;
  iconKey: string;
}

export interface RuleItem {
  id: string;
  ruleText: string;
  ruleType: "ALLOWED" | "NOT_ALLOWED" | "CONDITIONAL";
}

export interface PropertyImageItem {
  id: string;
  url: string;
  caption?: string | null;
  isCover: boolean;
  displayOrder: number;
}

export interface PropertyItem {
  id: string;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    ownerProfile?: {
      businessName?: string | null;
      verificationStatus: string;
      responseRate: number;
      responseTime: string;
      memberSince: Date | string;
    } | null;
  };
  title: string;
  slug: string;
  description: string;
  propertyType: string;
  roomType: string;
  furnishing: string;
  floor: number;
  totalFloors: number;
  roomSizeSqft: number;
  bathrooms: number;
  balconies: number;
  kitchenType: string;
  parkingType: string;
  rentMonthly: number;
  deposit: number;
  maintenanceCharges: number;
  electricityIncluded: boolean;
  waterIncluded: boolean;
  foodIncluded: boolean;
  availableFrom: Date | string;
  minStayMonths: number;
  maxStayMonths?: number | null;
  genderPreference: string;
  tenantPreference: string;
  country: string;
  state: string;
  city: string;
  area: string;
  address: string;
  landmark?: string | null;
  latitude: number;
  longitude: number;
  distanceToHub?: string | null;
  status: string;
  isVerified: boolean;
  featured: boolean;
  noBrokerage: boolean;
  petFriendly: boolean;
  viewsCount: number;
  favoritesCount: number;
  images: PropertyImageItem[];
  amenities: AmenityItem[];
  rules: RuleItem[];
  reviews?: ReviewItem[];
  createdAt: Date | string;
}

export interface ReviewItem {
  id: string;
  propertyId: string;
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    avatar?: string | null;
    occupation?: string | null;
  };
  ratingOverall: number;
  ratingCleanliness: number;
  ratingLocation: number;
  ratingAmenities: number;
  ratingOwner: number;
  comment: string;
  ownerReply?: string | null;
  createdAt: Date | string;
}

export interface BookingItem {
  id: string;
  propertyId: string;
  property: PropertyItem;
  tenantId: string;
  tenant: UserSummary;
  status: "INQUIRY" | "REQUESTED" | "ACCEPTED" | "PAYMENT_PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED";
  moveInDate: Date | string;
  stayMonths: number;
  occupantsCount: number;
  tenantMessage?: string | null;
  ownerNotes?: string | null;
  monthlyRent: number;
  depositAmount: number;
  maintenanceAmount: number;
  platformFee: number;
  taxesAmount: number;
  totalAmount: number;
  paidAmount: number;
  payment?: {
    id: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string | null;
    status: string;
    receiptUrl?: string | null;
  } | null;
  createdAt: Date | string;
}

export interface FilterParams {
  city?: string;
  area?: string;
  query?: string;
  minRent?: number;
  maxRent?: number;
  roomType?: string[];
  propertyType?: string[];
  furnishing?: string[];
  genderPreference?: string;
  tenantPreference?: string;
  amenities?: string[];
  verifiedOnly?: boolean;
  foodIncluded?: boolean;
  noBrokerage?: boolean;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "newest" | "rating";
}
