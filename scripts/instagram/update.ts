import { config } from 'dotenv';
import { InstagramService } from './InstagramService';
import type { InstagramConfig } from './types';

// Load environment variables
config();

async function main() {
    // Validate environment variables
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.IG_ACCESS_TOKEN;
    if (!accessToken) {
        console.error('No Instagram access token found. Set INSTAGRAM_ACCESS_TOKEN or IG_ACCESS_TOKEN in environment variables.');
        process.exit(1);
    }

    // Instagram service configuration
    const instagramConfig: InstagramConfig = {
        userId: '17841401845000174', // Your Instagram user ID
        accessToken,
        mediaCount: 10,
        cacheTTL: 0, // Force fresh fetch
        maxRetries: 3,
        retryDelay: 1000 // Start with 1 second delay, will increase exponentially
    };

    try {
        console.log('Starting Instagram feed update...');
        const instagram = new InstagramService(instagramConfig);
        const media = await instagram.fetchMedia();
        
        console.log(`Successfully updated Instagram feed with ${media.length} posts`);
        process.exit(0);
    } catch (error) {
        console.error('Failed to update Instagram feed:', error);
        process.exit(1);
    }
}

// Run the update
main(); 