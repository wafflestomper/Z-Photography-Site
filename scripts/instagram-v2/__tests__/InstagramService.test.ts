import { InstagramService } from '../InstagramService';
import { mockInstagramMedia, mockInstagramResponse } from './fixtures';
import { promises as fs } from 'fs';
import path from 'path';

// Mock the fs module
jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
        writeFile: jest.fn(),
        mkdir: jest.fn()
    }
}));

describe('InstagramService', () => {
    const mockConfig = {
        userId: 'test-user-id',
        accessToken: 'test-token',
        mediaCount: 10,
        cacheTTL: 3600,
        maxRetries: 3,
        retryDelay: 1 // Minimal delay for tests
    };

    let service: InstagramService;
    let mockFetch: jest.Mock;

    beforeEach(() => {
        service = new InstagramService(mockConfig);
        mockFetch = global.fetch as jest.Mock;
        mockFetch.mockClear();
        (fs.readFile as jest.Mock).mockClear();
        (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
        (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('fetchMedia', () => {
        it('should fetch and cache Instagram media successfully', async () => {
            // Mock successful API response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockInstagramResponse
            });

            // Mock cache miss
            (fs.readFile as jest.Mock).mockRejectedValueOnce(new Error('File not found'));

            const result = await service.fetchMedia();

            // Verify API call
            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(`/media?fields=id,caption,media_url,permalink,thumbnail_url,timestamp&access_token=${mockConfig.accessToken}`)
            );

            // Verify cache write
            expect(fs.mkdir).toHaveBeenCalled();
            const writeFileArgs = (fs.writeFile as jest.Mock).mock.calls[0];
            expect(writeFileArgs[0]).toMatch(/instagram-v2\.json$/);
            const writtenData = JSON.parse(writeFileArgs[1]);
            expect(writtenData.data).toEqual(mockInstagramMedia);

            // Verify result
            expect(result).toEqual(mockInstagramMedia);
        });

        it('should use cache when available and valid', async () => {
            const cachedData = {
                timestamp: Date.now(),
                data: mockInstagramMedia
            };

            // Mock cache hit
            (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify(cachedData));

            const result = await service.fetchMedia();

            // Verify no API call was made
            expect(mockFetch).not.toHaveBeenCalled();

            // Verify result comes from cache
            expect(result).toEqual(mockInstagramMedia);
        });

        it('should retry on API failure', async () => {
            jest.useRealTimers(); // Use real timers for retry delays

            // Mock failed API responses
            mockFetch
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({
                    ok: true,
                    json: async () => mockInstagramResponse
                });

            // Mock cache miss
            (fs.readFile as jest.Mock).mockRejectedValueOnce(new Error('File not found'));

            const result = await service.fetchMedia();

            // Verify retry attempts
            expect(mockFetch).toHaveBeenCalledTimes(3);

            // Verify final result
            expect(result).toEqual(mockInstagramMedia);
        });

        it('should use expired cache as fallback on API failure', async () => {
            jest.useRealTimers(); // Use real timers for retry delays

            const cachedData = {
                timestamp: Date.now() - (mockConfig.cacheTTL * 2000), // Expired cache
                data: mockInstagramMedia
            };

            // Mock cache hit with expired data
            (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify(cachedData));

            // Mock API failure for all retries
            mockFetch
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'));

            const result = await service.fetchMedia();

            // Verify API was called
            expect(mockFetch).toHaveBeenCalledTimes(3);

            // Verify fallback to expired cache
            expect(result).toEqual(mockInstagramMedia);
        });

        it('should throw error when API fails and no cache exists', async () => {
            jest.useRealTimers(); // Use real timers for retry delays

            // Mock cache miss
            (fs.readFile as jest.Mock).mockRejectedValueOnce(new Error('File not found'));

            // Mock API failure for all retries
            mockFetch
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'));

            await expect(service.fetchMedia()).rejects.toThrow('Network error');
        });
    });
}); 