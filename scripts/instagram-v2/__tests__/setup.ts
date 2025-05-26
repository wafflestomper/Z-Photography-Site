/// <reference types="jest" />

// Mock environment variables
process.env.INSTAGRAM_ACCESS_TOKEN = 'test-token';
process.env.IG_ACCESS_TOKEN = 'test-token-alt';

// Mock fetch globally
global.fetch = jest.fn(); 