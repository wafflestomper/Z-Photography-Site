import { promises as fs } from 'fs';
import path from 'path';
import { InstagramConfig, InstagramMedia, InstagramResponse, CachedData } from './types';

export class InstagramService {
    private config: InstagramConfig;
    private cacheFile: string;
    private rateLimitDelay = 1000; // 1 second between requests
    private lastRequestTime = 0;

    constructor(config: InstagramConfig) {
        this.config = config;
        this.cacheFile = path.join(process.cwd(), 'data', 'instagram-v2.json'); // Updated cache file name
    }

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async enforceRateLimit(): Promise<void> {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.rateLimitDelay) {
            await this.delay(this.rateLimitDelay - timeSinceLastRequest);
        }
        
        this.lastRequestTime = Date.now();
    }

    private async fetchWithRetry(url: string, retries = 0): Promise<InstagramResponse> {
        try {
            await this.enforceRateLimit();
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            if (retries < this.config.maxRetries - 1) { // Changed condition to ensure we don't exceed maxRetries
                console.log(`Retry ${retries + 1}/${this.config.maxRetries} after error:`, error);
                await this.delay(this.config.retryDelay * Math.pow(2, retries));
                return this.fetchWithRetry(url, retries + 1);
            }
            throw error;
        }
    }

    private async readCache(): Promise<CachedData | null> {
        try {
            const data = await fs.readFile(this.cacheFile, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return null;
        }
    }

    private async writeCache(data: InstagramMedia[]): Promise<void> {
        const cacheData: CachedData = {
            timestamp: Date.now(),
            data
        };
        
        await fs.mkdir(path.dirname(this.cacheFile), { recursive: true });
        await fs.writeFile(this.cacheFile, JSON.stringify(cacheData, null, 2));
    }

    private isCacheValid(cache: CachedData): boolean {
        const now = Date.now();
        const cacheAge = now - cache.timestamp;
        return cacheAge < this.config.cacheTTL * 1000;
    }

    async fetchMedia(): Promise<InstagramMedia[]> {
        let cache: CachedData | null = null;
        try {
            // Check cache first
            cache = await this.readCache();
            if (cache && this.isCacheValid(cache)) {
                console.log('Using cached Instagram data');
                return cache.data;
            }

            console.log('Fetching fresh Instagram data...');
            const url = `https://graph.facebook.com/v22.0/${this.config.userId}/media?fields=id,caption,media_url,permalink,thumbnail_url,timestamp&access_token=${this.config.accessToken}&limit=${this.config.mediaCount}`;
            
            const response = await this.fetchWithRetry(url);
            const media = response.data || [];
            
            // Cache the new data
            await this.writeCache(media);
            
            return media;
        } catch (error) {
            console.error('Error fetching Instagram media:', error);
            
            // If cache exists but expired, use it as fallback
            if (cache) {
                console.log('Using expired cache as fallback');
                return cache.data;
            }
            
            throw error;
        }
    }
} 