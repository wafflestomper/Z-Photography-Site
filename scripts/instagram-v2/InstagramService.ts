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

    private hasHashtag(caption: string | null, targetHashtag: string): boolean {
        if (!caption) {
            console.log('No caption found for post');
            return false;
        }
        const normalizedCaption = caption.toLowerCase();
        const normalizedHashtag = targetHashtag.toLowerCase().replace('#', '');
        const hasTag = normalizedCaption.includes(`#${normalizedHashtag}`);
        console.log(`Checking caption for #${normalizedHashtag}:`, {
            caption: normalizedCaption,
            hasTag
        });
        return hasTag;
    }

    async fetchMedia(): Promise<InstagramMedia[]> {
        let cache: CachedData | null = null;
        try {
            // Check cache first
            cache = await this.readCache();
            if (cache && this.isCacheValid(cache)) {
                console.log('Using cached Instagram data');
                console.log('Total posts before filtering:', cache.data.length);
                const filteredCache = cache.data.filter(post => this.hasHashtag(post.caption, 'zphotography'));
                console.log('Posts with #zphotography:', filteredCache.length);
                if (filteredCache.length < this.config.mediaCount) {
                    console.log('Not enough #zphotography posts in cache, fetching fresh data...');
                } else {
                    return filteredCache.slice(0, this.config.mediaCount);
                }
            }

            // First attempt with 5x posts
            console.log('Fetching fresh Instagram data (first attempt)...');
            const fetchLimit = this.config.mediaCount * 5;
            const url = `https://graph.facebook.com/v22.0/${this.config.userId}/media?fields=id,caption,media_url,permalink,thumbnail_url,timestamp&access_token=${this.config.accessToken}&limit=${fetchLimit}`;
            
            const response = await this.fetchWithRetry(url);
            const allMedia = response.data || [];
            console.log('Total posts fetched:', allMedia.length);
            
            // Filter posts with the zphotography hashtag
            const filteredMedia = allMedia.filter(post => this.hasHashtag(post.caption, 'zphotography'));
            console.log('Posts with #zphotography:', filteredMedia.length);
            
            // If we don't have enough posts, try with a larger limit
            if (filteredMedia.length < this.config.mediaCount) {
                console.log('Not enough #zphotography posts, trying with larger limit...');
                const largerLimit = this.config.mediaCount * 10;
                const newUrl = `https://graph.facebook.com/v22.0/${this.config.userId}/media?fields=id,caption,media_url,permalink,thumbnail_url,timestamp&access_token=${this.config.accessToken}&limit=${largerLimit}`;
                
                const newResponse = await this.fetchWithRetry(newUrl);
                const newAllMedia = newResponse.data || [];
                console.log('Total posts fetched (second attempt):', newAllMedia.length);
                
                const newFilteredMedia = newAllMedia.filter(post => this.hasHashtag(post.caption, 'zphotography'));
                console.log('Posts with #zphotography (second attempt):', newFilteredMedia.length);
                
                // Use the results from the second attempt
                const media = newFilteredMedia.slice(0, this.config.mediaCount);
                await this.writeCache(media);
                return media;
            }
            
            // Use results from first attempt if we have enough
            const media = filteredMedia.slice(0, this.config.mediaCount);
            await this.writeCache(media);
            return media;

        } catch (error) {
            console.error('Error fetching Instagram media:', error);
            
            // Only use cache as fallback if we have enough posts
            if (cache) {
                console.log('Using expired cache as fallback');
                console.log('Total posts in expired cache:', cache.data.length);
                const filteredCache = cache.data.filter(post => this.hasHashtag(post.caption, 'zphotography'));
                console.log('Posts with #zphotography in expired cache:', filteredCache.length);
                if (filteredCache.length >= this.config.mediaCount) {
                    return filteredCache.slice(0, this.config.mediaCount);
                }
            }
            
            throw new Error('Failed to fetch enough #zphotography posts and no valid cache available');
        }
    }
} 