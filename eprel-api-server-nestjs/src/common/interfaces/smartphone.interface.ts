export interface LabelMetrics {
  energyClass?: string;
  repairabilityClass?: string;
  repairabilityIndex?: number | null;
  batteryEnduranceInCycles?: number | null;
  batteryEndurancePerCycle?: number | null;
  ipRating?: string;
  fallsWithoutDefect?: number | null;
  ratedBatteryCapacity?: number | null;
  operatingSystem?: string;
}

export interface Smartphone {
  id: string;
  brand: string;
  modelName: string;
  deviceType: string;
  eprelUrl?: string | null;
  metrics: LabelMetrics;
  lastUpdated: string;
}

export interface Pagination {
  total: number;
  count: number;
  limit: number | null;
  offset: number;
}

export interface Filters {
  brand: string | null;
}

export interface EPRELApiProduct {
  modelIdentifier: string;
  supplierOrTrademark: string;
  trademarkOwner: string;
  deviceType: string;
  energyClass?: string;
  repairabilityClass?: string;
  repairabilityIndex?: number;
  batteryEnduranceInCycles?: number;
  batteryEndurancePerCycle?: number;
  ingressProtectionRating?: string;
  fallsWithoutDefect?: number;
  ratedBatteryCapacity?: number;
  operatingSystem?: string;
  publicUrl?: string;
  [key: string]: any; // For additional properties we might not explicitly handle
}

export interface EPRELApiResponse {
  size: number;
  offset: number;
  hits: EPRELApiProduct[];
}

export interface BrandsResponse {
  brands: string[];
  total: number;
  lastUpdated: string;
}

export interface SmartphonesResponse {
  smartphones: Smartphone[];
  pagination: Pagination;
  filters: Filters;
  lastUpdated: string;
}

export interface SmartphoneResponse {
  smartphone: Smartphone;
  lastUpdated: string;
}

export interface SearchResponse {
  results: Smartphone[];
  query: string;
  total: number;
  lastUpdated: string;
}

export interface CacheStats {
  entries: number;
  keys: string[];
  lastUpdated: string;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
}
