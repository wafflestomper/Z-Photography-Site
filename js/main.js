import { PhotoManager } from './photoManager.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize photo showcase
    const photoShowcase = document.getElementById('photoShowcase');
    const currentNumberEl = document.getElementById('currentPhotoNumber');
    
    const photoManager = new PhotoManager(photoShowcase, currentNumberEl);
    
    // Add keyboard event listeners
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            photoManager.previousPhoto();
        } else if (e.key === 'ArrowRight') {
            photoManager.nextPhoto();
        } else if (e.code === 'Space') {
            e.preventDefault();
            photoManager.togglePause();
        }
    });

    // Initialize the photo showcase
    photoManager.init();
}); 