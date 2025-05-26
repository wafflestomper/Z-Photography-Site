import { promises as fs } from 'fs';
import path from 'path';
import { InstagramConfig, InstagramMedia } from './types';
import { InstagramService } from './InstagramService';
import fetch from 'node-fetch';

async function downloadImage(url: string, filename: string): Promise<string> {
    try {
        // Check if the URL is already a local path
        if (url.startsWith('/images/instagram/')) {
            return url;
        }

        // Ensure URL is absolute
        if (!url.startsWith('http')) {
            throw new Error('Invalid URL: must be absolute');
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
        
        const buffer = await response.buffer();
        const localPath = path.join(process.cwd(), 'images', 'instagram', filename);
        
        // Ensure directory exists
        await fs.mkdir(path.join(process.cwd(), 'images', 'instagram'), { recursive: true });
        
        await fs.writeFile(localPath, buffer);
        return `/images/instagram/${filename}`;
    } catch (error) {
        console.error(`Error downloading image ${url}:`, error);
        throw error;
    }
}

async function main() {
    // Validate environment variables
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.IG_ACCESS_TOKEN;
    if (!accessToken) {
        console.error('No Instagram access token found. Set INSTAGRAM_ACCESS_TOKEN or IG_ACCESS_TOKEN in environment variables.');
        process.exit(1);
    }

    // Instagram service configuration
    const instagramConfig: InstagramConfig = {
        userId: '17841401845000174',
        accessToken,
        mediaCount: 10,
        cacheTTL: 3600, // 1 hour cache
        maxRetries: 3,
        retryDelay: 1000
    };

    try {
        console.log('Starting Instagram feed update (v2)...');
        const instagram = new InstagramService(instagramConfig);
        const media = await instagram.fetchMedia();
        
        // Download all images and update media_url to local path
        const updatedMedia = await Promise.all(media.map(async (item) => {
            const filename = `${item.id}.jpg`;
            try {
                const localPath = await downloadImage(item.media_url, filename);
                return {
                    ...item,
                    media_url: localPath
                };
            } catch (error) {
                console.error(`Failed to download image for post ${item.id}, using original URL`);
                return item;
            }
        }));

        // Write updated media data to cache
        const cacheData = {
            timestamp: Date.now(),
            data: updatedMedia
        };
        
        await fs.writeFile(
            path.join(process.cwd(), 'data', 'instagram-v2.json'),
            JSON.stringify(cacheData, null, 2)
        );
        
        console.log(`Successfully updated Instagram feed with ${media.length} posts`);
        process.exit(0);
    } catch (error) {
        console.error('Failed to update Instagram feed:', error);
        process.exit(1);
    }
}

main(); 