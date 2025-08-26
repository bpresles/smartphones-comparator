/**
 * API Service for EPREL data
 * This service communicates with our custom backend API server
 */

// Types
export interface LabelMetrics {
  energyClass?: string;
  autonomyMinutes?: number | null;
  cycleLifeTo80?: number | null;
  durabilityDrops?: number | null;
  ipRating?: string;
  reparabilityScore?: string | number;
}

export interface PhoneModel {
  id: string;
  brand: string;
  modelName: string;
  metrics: LabelMetrics;
  eprelUrl?: string;
  lastUpdated?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface BrandsResponse {
  brands: string[];
  total: number;
  lastUpdated: string;
}

export interface SmartphonesResponse {
  smartphones: PhoneModel[];
  pagination: {
    total: number;
    count: number;
    limit: number | null;
    offset: number;
  };
  filters: {
    brand: string | null;
  };
  lastUpdated: string;
}

export interface SmartphoneResponse {
  smartphone: PhoneModel;
  lastUpdated: string;
}

export interface SearchResponse {
  results: PhoneModel[];
  query: string;
  total: number;
  lastUpdated: string;
}

// Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-production-api.com'  // À remplacer par votre URL de production
  : 'http://localhost:3002';

const DEFAULT_TIMEOUT = 10000; // 10 secondes

/**
 * Generic fetch wrapper with error handling and timeout
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur de réseau' }));
      return {
        error: errorData.error || `Erreur HTTP: ${response.status}`,
        message: errorData.message
      };
    }

    const data = await response.json();
    console.log(`API Response: ${response.status} ${response.statusText}`);

    return { data };

  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          error: 'Timeout de la requête',
          message: 'La requête a pris trop de temps à répondre'
        };
      }

      return {
        error: 'Erreur de connexion',
        message: error.message
      };
    }

    return {
      error: 'Erreur inconnue',
      message: 'Une erreur inattendue s\'est produite'
    };
  }
}

/**
 * EPREL API Service
 */
export class EPRELApiService {
  /**
   * Vérifie l'état du serveur API
   */
  static async healthCheck(): Promise<ApiResponse<{ status: string; message: string; timestamp: string; version: string }>> {
    return apiRequest('/health');
  }

  /**
   * Récupère toutes les marques de smartphones disponibles
   */
  static async getBrands(): Promise<ApiResponse<BrandsResponse>> {
    return apiRequest('/api/brands');
  }

  /**
   * Récupère la liste des smartphones
   * @param options - Options de filtrage et pagination
   */
  static async getSmartphones(options: {
    brand?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<SmartphonesResponse>> {
    const params = new URLSearchParams();

    if (options.brand) params.append('brand', options.brand);
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());

    const queryString = params.toString();
    const endpoint = `/api/smartphones${queryString ? `?${queryString}` : ''}`;

    return apiRequest(endpoint);
  }

  /**
   * Récupère un smartphone spécifique par son ID
   * @param id - ID du smartphone
   */
  static async getSmartphoneById(id: string): Promise<ApiResponse<SmartphoneResponse>> {
    if (!id) {
      return {
        error: 'ID requis',
        message: 'L\'ID du smartphone est requis'
      };
    }

    return apiRequest(`/api/smartphones/${encodeURIComponent(id)}`);
  }

  /**
   * Recherche des smartphones par nom de modèle
   * @param query - Terme de recherche
   * @param limit - Limite du nombre de résultats (optionnel)
   */
  static async searchSmartphones(
    query: string,
    limit?: number
  ): Promise<ApiResponse<SearchResponse>> {
    if (!query || query.length < 2) {
      return {
        error: 'Requête invalide',
        message: 'La recherche doit contenir au moins 2 caractères'
      };
    }

    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());

    const queryString = params.toString();
    const endpoint = `/api/smartphones/search/${encodeURIComponent(query)}${queryString ? `?${queryString}` : ''}`;

    return apiRequest(endpoint);
  }

  /**
   * Vide le cache du serveur API
   */
  static async clearCache(): Promise<ApiResponse<{ message: string; timestamp: string }>> {
    return apiRequest('/api/cache', { method: 'DELETE' });
  }

  /**
   * Récupère les statistiques du cache
   */
  static async getCacheStats(): Promise<ApiResponse<{ entries: number; keys: string[]; lastUpdated: string }>> {
    return apiRequest('/api/cache/stats');
  }
}

/**
 * Hook-like wrapper pour une utilisation plus simple dans React
 */
export class EPRELDataManager {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Récupère les données avec cache local
   */
  private static async getCachedData<T>(
    key: string,
    fetcher: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> {
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`Cache local hit pour: ${key}`);
      return { data: cached.data };
    }

    const result = await fetcher();

    if (result.data) {
      this.cache.set(key, {
        data: result.data,
        timestamp: Date.now()
      });
    }

    return result;
  }

  /**
   * Récupère les marques avec cache local
   */
  static async getBrands(): Promise<ApiResponse<BrandsResponse>> {
    return this.getCachedData('brands', () => EPRELApiService.getBrands());
  }

  /**
   * Récupère les smartphones avec cache local
   */
  static async getSmartphones(options: {
    brand?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<SmartphonesResponse>> {
    const key = `smartphones-${JSON.stringify(options)}`;
    return this.getCachedData(key, () => EPRELApiService.getSmartphones(options));
  }

  /**
   * Vide le cache local
   */
  static clearLocalCache(): void {
    this.cache.clear();
    console.log('Cache local vidé');
  }
}

// Export par défaut
export default EPRELApiService;
