export interface InstagramMedia {
    id: string;
    caption: string | null;
    media_url: string;
    permalink: string;
    timestamp: string;
    thumbnail_url?: string;
}

export interface InstagramResponse {
    data: InstagramMedia[];
    paging?: {
        cursors: {
            before: string;
            after: string;
        };
        next?: string;
    };
}

export interface InstagramConfig {
    userId: string;
    accessToken: string;
    mediaCount: number;
    cacheTTL: number; // in seconds
    maxRetries: number;
    retryDelay: number; // in milliseconds
}

export interface CachedData {
    timestamp: number;
    data: InstagramMedia[];
} 