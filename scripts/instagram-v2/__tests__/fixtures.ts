import { InstagramMedia, InstagramResponse } from '../types';

export const mockInstagramMedia: InstagramMedia[] = [
    {
        id: '123456789',
        caption: 'Test photo 1',
        media_url: 'https://example.com/photo1.jpg',
        permalink: 'https://instagram.com/p/123456',
        timestamp: '2025-05-24T01:32:17+0000'
    },
    {
        id: '987654321',
        caption: 'Test photo 2',
        media_url: 'https://example.com/photo2.jpg',
        permalink: 'https://instagram.com/p/987654',
        timestamp: '2025-05-23T01:32:17+0000'
    }
];

export const mockInstagramResponse: InstagramResponse = {
    data: mockInstagramMedia,
    paging: {
        cursors: {
            before: 'before_token',
            after: 'after_token'
        },
        next: 'https://graph.facebook.com/v22.0/next_page'
    }
}; 