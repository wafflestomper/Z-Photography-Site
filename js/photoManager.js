// Photo Manager Module
export class PhotoManager {
    constructor(photoShowcase, currentNumberEl) {
        this.photoShowcase = photoShowcase;
        this.currentNumberEl = currentNumberEl;
        this.pauseTextEl = document.getElementById('pauseText'); // Get pause element
        this.playTextEl = document.getElementById('playText');   // Get play element
        this.currentPhotoIndex = 0;
        this.photos = []; // Will hold the loaded Image elements
        this.photoData = []; // Will hold the data from JSON
        this.autoRotateInterval = null;
        this.autoRotateDelay = 3500;
        this.isPausedBySpacebar = false;
        this.isMobile = window.innerWidth < 768;

        // Add resize listener to update mobile state
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth < 768;
            
            // If mobile state changed, reinitialize the display
            if (wasMobile !== this.isMobile) {
                this.reinitializeDisplay();
            }
        });
    }

    // --- Initialization & Data Fetching ---

    async init() {
        try {
            await this.fetchPhotoData(); // Fetch data first
            this.photos = await this.preloadImages(); // Preload based on fetched data
            
            if (this.photos.length === 0) {
                 console.error('No valid photos loaded. Cannot initialize showcase.');
                 return;
            }

            if (this.isMobile) {
                this.displayAllPhotosVertically();
                this.stopAutoRotate(); // Ensure rotation is stopped on mobile
            } else {
                // Append preloaded images to the showcase container for desktop
                this.photos.forEach(photo => this.photoShowcase.appendChild(photo));
                const randomStartIndex = Math.floor(Math.random() * this.photos.length);
                this.changePhoto(randomStartIndex); // Show initial random photo
                this.startAutoRotate();
            }
        } catch (error) {
            console.error('Failed to initialize photo showcase:', error);
        }
    }

    async fetchPhotoData() {
        try {
            const response = await fetch('data/photos.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.photoData = await response.json();
            console.log('Successfully fetched photo data:', this.photoData.length);
        } catch (error) {
            console.error("Could not fetch photo data:", error);
            this.photoData = []; // Ensure it's an empty array on error
        }
    }

    // --- Image Preloading ---

    async preloadImages() {
        return new Promise((resolve) => {
            if (!this.photoData || this.photoData.length === 0) {
                console.warn("No photo data available for preloading.");
                resolve([]);
                return;
            }

            const loadedImageElements = [];
            let loadedCount = 0;
            const totalImages = this.photoData.length;

            this.photoData.forEach((photoInfo, index) => {
                const img = new Image();
                img.src = photoInfo.src; 
                // USE THE ALT TEXT FROM JSON
                img.alt = photoInfo.alt || `Sports photography example ${index + 1}`; // Fallback alt text
                console.log('Loading image:', img.src, 'with alt:', img.alt);
                
                img.onerror = () => {
                    console.error(`Failed to load image: ${img.src}`);
                    loadedCount++;
                    loadedImageElements[index] = null;
                    this.checkAllLoaded(loadedImageElements, loadedCount, totalImages, resolve);
                };
                
                img.onload = () => {
                    console.log('Successfully loaded image:', img.src);
                    img.dataset.orientation = this.isPortrait(img) ? 'portrait' : 'landscape';
                    loadedImageElements[index] = img;
                    loadedCount++;
                    this.checkAllLoaded(loadedImageElements, loadedCount, totalImages, resolve);
                };
            });
        });
    }

    checkAllLoaded(loadedImageElements, loadedCount, totalImages, resolve) {
        if (loadedCount === totalImages) {
            const validImages = loadedImageElements.filter(img => img !== null);
            console.log('All images preloaded:', validImages.length);
            resolve(validImages);
        }
    }

    // --- Image Display & DOM Manipulation ---

    changePhoto(newIndex = null) {
        // Don't change photo if on mobile (uses vertical scroll)
        if (this.isMobile || !this.photos || this.photos.length === 0) return;

        // Fade out current active photos
        const activePhotos = this.photoShowcase.querySelectorAll('.active');
        activePhotos.forEach(photo => {
             if (photo) photo.style.opacity = '0';
        });

        // After fade-out duration, update the photo
        setTimeout(() => {
            // Remove active class from previously active photos
            activePhotos.forEach(photo => {
                if (photo) photo.classList.remove('active');
            });

            // Update index if newIndex is provided, otherwise cycle
            if (newIndex !== null) {
                this.currentPhotoIndex = newIndex;
            } else {
                this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.photos.length;
            }
            
            // Validate index
            if (this.currentPhotoIndex < 0 || this.currentPhotoIndex >= this.photos.length) {
                console.error("Invalid photo index:", this.currentPhotoIndex);
                this.currentPhotoIndex = 0; // Reset to first photo on error
            }

            // Get the new photo element
            const currentPhoto = this.photos[this.currentPhotoIndex];
            
            if (currentPhoto) {
                // Set class and fade in
                currentPhoto.className = 'showcase-photo active'; // Set base and active class
                void currentPhoto.offsetWidth; // Trigger reflow to ensure transition applies
                currentPhoto.style.opacity = '1';
            } else {
                console.error("Attempted to show null photo at index", this.currentPhotoIndex);
            }

            // Update photo number if element exists
            if (this.currentNumberEl) {
                this.updatePhotoNav();
            }
        }, 500); // Match this with CSS transition duration
    }

    displayAllPhotosVertically() {
        // Clear existing photos from showcase
        while (this.photoShowcase.firstChild) {
            this.photoShowcase.removeChild(this.photoShowcase.firstChild);
        }

        // Add all photos vertically
        this.photos.forEach(photo => {
            const photoClone = photo.cloneNode(true); // Use clone to avoid moving original elements
            photoClone.className = 'showcase-photo mobile-photo'; // Apply mobile styling
            photoClone.style.opacity = '1'; // Ensure they are visible
            this.photoShowcase.appendChild(photoClone);
        });

        // Hide desktop navigation elements
        if (this.currentNumberEl) {
            this.currentNumberEl.style.display = 'none';
        }
        // Hide pause/play text if they exist
        if (this.pauseTextEl) this.pauseTextEl.style.display = 'none';
        if (this.playTextEl) this.playTextEl.style.display = 'none';
    }
    
    // --- Navigation ---

    updatePhotoNav() {
        // Ensure element exists before trying to update
        if (!this.currentNumberEl) return;
        if (!this.photos.length) return;
        
        this.currentNumberEl.textContent = (this.currentPhotoIndex + 1).toString();
    }

    previousPhoto() {
        if (this.isMobile || !this.photos || this.photos.length === 0) return;
        this.stopAutoRotate();
        this.isPausedBySpacebar = false; 
        this.updatePausePlayText();
        const newIndex = (this.currentPhotoIndex - 1 + this.photos.length) % this.photos.length;
        this.changePhoto(newIndex);
        this.startAutoRotate(); 
    }

    nextPhoto() {
        if (this.isMobile || !this.photos || this.photos.length === 0) return;
        this.stopAutoRotate();
        this.isPausedBySpacebar = false;
        this.updatePausePlayText(); 
        const newIndex = (this.currentPhotoIndex + 1) % this.photos.length;
        this.changePhoto(newIndex);
        this.startAutoRotate();
    }

    // --- Auto-Rotation & Pause/Play ---

    startAutoRotate() {
        this.stopAutoRotate(); // Clear any existing interval first
        // Only rotate if not mobile and not paused by spacebar
        if (!this.isMobile && !this.isPausedBySpacebar) {
            this.autoRotateInterval = setInterval(() => this.changePhoto(), this.autoRotateDelay); // Use changePhoto with no index for auto-advance
        }
    }

    stopAutoRotate() {
        clearInterval(this.autoRotateInterval);
        this.autoRotateInterval = null; // Clear the interval ID
    }

    togglePause() {
        if (this.isMobile) return; // No pause/play on mobile
        this.isPausedBySpacebar = !this.isPausedBySpacebar;
        if (this.isPausedBySpacebar) {
            this.stopAutoRotate();
        } else {
            this.startAutoRotate(); // Resume rotation
        }
        this.updatePausePlayText(); // Update text bolding and color
    }

    updatePausePlayText() {
        // Ensure elements exist (they are created by navigation.js)
        if (!this.pauseTextEl || !this.playTextEl) {
            this.pauseTextEl = document.getElementById('pauseText');
            this.playTextEl = document.getElementById('playText');
        }

        // If elements still don't exist (nav not loaded?), exit
        if (!this.pauseTextEl || !this.playTextEl) return;

        const activeColor = 'var(--accent-color)'; // Blue
        const inactiveColor = 'var(--text-color)'; // Black

        if (this.isPausedBySpacebar) {
            // Paused: Make Pause bold/active, Play normal/inactive
            this.pauseTextEl.style.fontWeight = 'bold';
            this.pauseTextEl.style.color = activeColor;
            this.playTextEl.style.fontWeight = 'normal';
            this.playTextEl.style.color = inactiveColor;
        } else {
            // Playing: Make Play bold/active, Pause normal/inactive
            this.pauseTextEl.style.fontWeight = 'normal';
            this.pauseTextEl.style.color = inactiveColor;
            this.playTextEl.style.fontWeight = 'bold';
            this.playTextEl.style.color = activeColor;
        }
    }
    
    // --- Mobile Responsiveness ---

    reinitializeDisplay() {
        // Clear existing content in the showcase
        while (this.photoShowcase.firstChild) {
            this.photoShowcase.removeChild(this.photoShowcase.firstChild);
        }

        // Restore display property of nav elements in case they were hidden
        if (this.currentNumberEl) this.currentNumberEl.style.display = 'block';
        if (this.pauseTextEl) this.pauseTextEl.style.display = 'inline'; // Use inline or block as appropriate
        if (this.playTextEl) this.playTextEl.style.display = 'inline';

        if (this.isMobile) {
            this.stopAutoRotate();
            this.displayAllPhotosVertically(); // Handles hiding nav elements
        } else {
            // Re-append original photo elements for desktop carousel
            this.photos.forEach(photo => {
                photo.className = 'showcase-photo'; // Reset class
                photo.style.opacity = '0'; // Start hidden
                this.photoShowcase.appendChild(photo);
            });
            
            // Ensure photo number is visible
            if (this.currentNumberEl) this.currentNumberEl.style.display = 'block';

            // Ensure pause/play text is visible
            if (this.pauseTextEl) this.pauseTextEl.style.display = 'inline';
            if (this.playTextEl) this.playTextEl.style.display = 'inline';
            
            // Restart showcase (random photo, rotation, nav)
            const randomStartIndex = Math.floor(Math.random() * this.photos.length);
            this.changePhoto(randomStartIndex);
            this.updatePausePlayText(); // Update bolding based on current pause state
            this.startAutoRotate(); // Restart rotation based on pause state
        }
    }
    
    // --- Utility Methods ---

    isPortrait(img) {
        // Check if image dimensions indicate portrait orientation
        return img && img.naturalHeight > 0 && img.naturalWidth > 0 && img.naturalHeight > img.naturalWidth;
    }
} 