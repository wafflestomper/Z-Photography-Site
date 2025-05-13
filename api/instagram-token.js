// Load environment variables
require('dotenv').config();

// Simple endpoint to get Instagram token
export async function getInstagramToken() {
    return {
        token: process.env.INSTAGRAM_ACCESS_TOKEN
    };
} 