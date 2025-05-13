require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

const IG_USER_ID = '17841401845000174';
const MEDIA_COUNT = 10;

async function fetchInstagramMedia() {
    // Try both token names
    const token = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.IG_ACCESS_TOKEN;
    if (!token) {
        throw new Error('No Instagram access token found in environment variables. Please set either INSTAGRAM_ACCESS_TOKEN or IG_ACCESS_TOKEN');
    }

    const url = `https://graph.facebook.com/v22.0/${IG_USER_ID}/media?fields=id,caption,media_url,permalink,thumbnail_url,timestamp&access_token=${token}&limit=${MEDIA_COUNT}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch Instagram media: ${response.status}`);
        }
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching Instagram media:', error);
        throw error;
    }
}

async function buildInstagramData() {
    try {
        console.log('Fetching Instagram media...');
        const media = await fetchInstagramMedia();
        
        // Create data directory if it doesn't exist
        const dataDir = path.join(__dirname, '..', 'data');
        await fs.mkdir(dataDir, { recursive: true });
        
        // Write the data to a JSON file
        const outputPath = path.join(dataDir, 'instagram.json');
        await fs.writeFile(outputPath, JSON.stringify(media, null, 2));
        
        console.log(`Successfully wrote Instagram data to ${outputPath}`);
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

buildInstagramData(); 