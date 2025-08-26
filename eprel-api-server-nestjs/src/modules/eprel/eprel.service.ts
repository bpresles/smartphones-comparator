import { Injectable, Logger, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import fetch from "node-fetch";

import { Configuration } from "../../config/configuration";
import { CacheService } from "../../common/services/cache.service";
import {
  EPRELApiResponse,
  EPRELApiProduct,
  Smartphone,
  BrandsResponse,
  SmartphonesResponse,
  SmartphoneResponse,
  SearchResponse,
  LabelMetrics,
} from "../../common/interfaces/smartphone.interface";
import {
  SmartphonesQueryDto,
  SearchQueryDto,
} from "../../common/dto/query.dto";

@Injectable()
export class EprelService {
  private readonly logger = new Logger(EprelService.name);
  private readonly eprelApiKey: string;
  private readonly eprelBaseUrl: string;
  private readonly eprelProductGroup: string;
  private readonly eprelTimeout: number;

  constructor(
    private readonly configService: ConfigService<Configuration>,
    private readonly cacheService: CacheService,
  ) {
    const eprelConfig = this.configService.get("eprel");
    this.eprelApiKey = eprelConfig?.apiKey || "";
    this.eprelBaseUrl =
      eprelConfig?.baseUrl || "https://eprel.ec.europa.eu/api/public";
    this.eprelProductGroup =
      eprelConfig?.productGroup || "smartphonestablets20231669";
    this.eprelTimeout = eprelConfig?.timeout || 10000;

    if (!this.eprelApiKey) {
      this.logger.warn("EPREL API key not configured");
    }
  }

  /**
   * Make EPREL API request
   */
  private async makeEPRELRequest(
    endpoint: string,
    queryParams: Record<string, any> = {},
  ): Promise<EPRELApiResponse> {
    try {
      const url = new URL(`${this.eprelBaseUrl}/${endpoint}`);

      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });

      this.logger.log(`Making EPREL API request to: ${url.toString()}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.eprelTimeout);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "X-API-KEY": this.eprelApiKey,
          "Content-Type": "application/json",
          "User-Agent": "EPREL-API-Server/1.0",
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new HttpException(
          `EPREL API error: ${response.status} ${response.statusText} - ${errorText}`,
          response.status >= 500
            ? HttpStatus.BAD_GATEWAY
            : HttpStatus.BAD_REQUEST,
        );
      }

      const data = await response.json();
      this.logger.log(`EPREL API request successful: ${response.status}`);

      return data as EPRELApiResponse;
    } catch (error) {
      if (error.name === "AbortError") {
        this.logger.error("EPREL API request timeout");
        throw new HttpException(
          "EPREL API request timeout",
          HttpStatus.REQUEST_TIMEOUT,
        );
      }

      this.logger.error("EPREL API request failed:", error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Failed to communicate with EPREL API",
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Transform EPREL product data to our format
   */
  private transformProductData(product: EPRELApiProduct): Smartphone {
    const metrics: LabelMetrics = {
      energyClass: product.energyClass || "—",
      repairabilityClass: product.repairabilityClass || "—",
      repairabilityIndex: product.repairabilityIndex || null,
      batteryEnduranceInCycles: product.batteryEnduranceInCycles || null,
      batteryEndurancePerCycle: product.batteryEndurancePerCycle || null,
      ipRating: product.ingressProtectionRating || "—",
      fallsWithoutDefect: product.fallsWithoutDefect || null,
      ratedBatteryCapacity: product.ratedBatteryCapacity || null,
      operatingSystem: product.operatingSystem || "—",
    };

    return {
      id: product.modelIdentifier,
      brand: product.supplierOrTrademark,
      modelName: product.modelIdentifier,
      deviceType: product.deviceType,
      eprelUrl: product.publicUrl || null,
      metrics,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Get all smartphone brands
   */
  async getBrands(): Promise<BrandsResponse> {
    const cacheKey = "brands";

    return this.cacheService.getOrSet(cacheKey, async () => {
      this.logger.log("Fetching brands from EPREL API");

      const data = await this.makeEPRELRequest(
        `products/${this.eprelProductGroup}`,
      );

      if (!data.hits || !Array.isArray(data.hits)) {
        throw new HttpException(
          "Invalid response format from EPREL API",
          HttpStatus.BAD_GATEWAY,
        );
      }

      // Extract unique brands and sort them
      const brands = [...new Set(data.hits.map((p) => p.supplierOrTrademark))]
        .filter(Boolean)
        .sort();

      const response: BrandsResponse = {
        brands,
        total: brands.length,
        lastUpdated: new Date().toISOString(),
      };

      this.logger.log(`Found ${brands.length} unique brands`);
      return response;
    });
  }

  /**
   * Get smartphones with optional filtering and pagination
   */
  async getSmartphones(
    query: SmartphonesQueryDto,
  ): Promise<SmartphonesResponse> {
    const cacheKey = `smartphones-${JSON.stringify(query)}`;

    return this.cacheService.getOrSet(cacheKey, async () => {
      this.logger.log("Fetching smartphones from EPREL API", { query });

      const data = await this.makeEPRELRequest(
        `products/${this.eprelProductGroup}`,
      );

      if (!data.hits || !Array.isArray(data.hits)) {
        throw new HttpException(
          "Invalid response format from EPREL API",
          HttpStatus.BAD_GATEWAY,
        );
      }

      // Transform the data
      let smartphones = data.hits.map((product) =>
        this.transformProductData(product),
      );

      // Apply brand filtering if specified
      if (query.brand) {
        smartphones = smartphones.filter(
          (p) => p.brand && p.brand.toLowerCase() === query.brand.toLowerCase(),
        );
      }

      // Apply pagination if requested
      const totalCount = smartphones.length;
      if (query.limit) {
        const offset = query.offset || 0;
        smartphones = smartphones.slice(offset, offset + query.limit);
      }

      const response: SmartphonesResponse = {
        smartphones,
        pagination: {
          total: totalCount,
          count: smartphones.length,
          limit: query.limit || null,
          offset: query.offset || 0,
        },
        filters: {
          brand: query.brand || null,
        },
        lastUpdated: new Date().toISOString(),
      };

      this.logger.log(
        `Returning ${smartphones.length} of ${totalCount} smartphones`,
      );
      return response;
    });
  }

  /**
   * Get specific smartphone by ID
   */
  async getSmartphoneById(id: string): Promise<SmartphoneResponse> {
    const cacheKey = `smartphone-${id}`;

    return this.cacheService.getOrSet(cacheKey, async () => {
      this.logger.log(`Fetching smartphone by ID: ${id}`);

      // Get all smartphones and find the one with matching modelIdentifier
      const data = await this.makeEPRELRequest(
        `products/${this.eprelProductGroup}`,
      );

      if (!data.hits || !Array.isArray(data.hits)) {
        throw new HttpException(
          "Invalid response format from EPREL API",
          HttpStatus.BAD_GATEWAY,
        );
      }

      const product = data.hits.find((p) => p.modelIdentifier === id);

      if (!product) {
        throw new HttpException(
          `Smartphone with ID '${id}' not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      const smartphone = this.transformProductData(product);

      const response: SmartphoneResponse = {
        smartphone,
        lastUpdated: new Date().toISOString(),
      };

      this.logger.log(
        `Found smartphone: ${smartphone.brand} ${smartphone.modelName}`,
      );
      return response;
    });
  }

  /**
   * Search smartphones by model identifier and brand
   */
  async searchSmartphones(
    searchQuery: SearchQueryDto,
  ): Promise<SearchResponse> {
    const cacheKey = `search-${JSON.stringify(searchQuery)}`;

    return this.cacheService.getOrSet(cacheKey, async () => {
      this.logger.log("Searching smartphones", { query: searchQuery.query });

      // Get all smartphones first
      const data = await this.makeEPRELRequest(
        `products/${this.eprelProductGroup}`,
      );

      if (!data.hits || !Array.isArray(data.hits)) {
        throw new HttpException(
          "Invalid response format from EPREL API",
          HttpStatus.BAD_GATEWAY,
        );
      }

      // Filter by model identifier and brand (case insensitive)
      const searchTerm = searchQuery.query.toLowerCase();
      let results = data.hits
        .filter(
          (p) =>
            (p.modelIdentifier &&
              p.modelIdentifier.toLowerCase().includes(searchTerm)) ||
            (p.supplierOrTrademark &&
              p.supplierOrTrademark.toLowerCase().includes(searchTerm)),
        )
        .map((product) => this.transformProductData(product));

      // Apply limit if requested
      if (searchQuery.limit) {
        results = results.slice(0, searchQuery.limit);
      }

      const response: SearchResponse = {
        results,
        query: searchQuery.query,
        total: results.length,
        lastUpdated: new Date().toISOString(),
      };

      this.logger.log(
        `Search returned ${results.length} results for query: ${searchQuery.query}`,
      );
      return response;
    });
  }

  /**
   * Clear cache
   */
  clearCache(): { message: string; timestamp: string } {
    this.cacheService.clear();
    this.logger.log("Cache cleared");

    return {
      message: "Cache cleared successfully",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cacheService.getStats();
  }
}
