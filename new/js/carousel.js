class Carousel {
    constructor() {
        console.log('Initializing carousel...');
        this.container = document.querySelector('.carousel-container');
        this.heroCarousel = document.querySelector('.hero-carousel');
        this.prevButton = document.querySelector('.carousel-arrow.prev');
        this.nextButton = document.querySelector('.carousel-arrow.next');
        
        // Log if elements are found
        console.log('Elements found:', {
            container: !!this.container,
            heroCarousel: !!this.heroCarousel,
            prevButton: !!this.prevButton,
            nextButton: !!this.nextButton
        });
        
        this.images = [
            '/new/images/photo1.jpg',
            '/new/images/photo2.jpg',
            '/new/images/photo3.jpg',
            '/new/images/photo4.jpg',
            '/new/images/photo5.jpg',
            '/new/images/photo6.jpg',
            '/new/images/photo7.jpg',
            '/new/images/photo8.jpg',
            '/new/images/photo9.jpg',
            '/new/images/photo10.jpg',
            '/new/images/photo11.jpg',
            '/new/images/photo12.jpg',
            '/new/images/photo13.jpg',
            '/new/images/photo14.jpg',
            '/new/images/photo15.jpg',
            '/new/images/photo16.jpg',
            '/new/images/photo17.jpg',
            '/new/images/photo18.jpg',
            '/new/images/photo19.jpg',
            '/new/images/photo20.jpg',
            '/new/images/photo21.jpg',
            '/new/images/photo22.jpg',
            '/new/images/photo23.jpg',
            '/new/images/photo24.jpg',
            '/new/images/photo25.jpg',
            '/new/images/photo26.jpg',
            '/new/images/photo27.jpg',
            '/new/images/photo28.jpg',
            '/new/images/photo29.jpg',
            '/new/images/photo30.jpg'
        ];
        
        this.currentIndex = 0;
        this.loadedImages = 0;
        this.isTransitioning = false;
        this.viewportWidth = window.innerWidth;
        this.imageData = new Map();
        this.horizontalWidth = 750;
        this.positions = [];
        this.touchStartX = 0;
        this.touchEndX = 0;

        // Bind the transition end handler to the instance
        this.handleTransitionEnd = this.handleTransitionEnd.bind(this);

        this.init();
        this.bindEvents();
    }

    bindEvents() {
        // Bind window resize event
        window.addEventListener('resize', () => {
            this.viewportWidth = window.innerWidth;
            this.calculatePositions();
            this.updatePosition(false);
        });

        // Bind arrow navigation
        if (this.prevButton && this.nextButton) {
            this.prevButton.addEventListener('click', () => {
                console.log('Previous button clicked');
                this.prev();
            });
            this.nextButton.addEventListener('click', () => {
                console.log('Next button clicked');
                this.next();
            });
        } else {
            console.error('Navigation arrows not found');
        }

        // Bind touch events with passive listeners
        this.container.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.container.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });

        // Remove any existing transition end listeners
        this.container.removeEventListener('transitionend', this.handleTransitionEnd);
        // Add the transition end listener
        this.container.addEventListener('transitionend', this.handleTransitionEnd);
    }

    init() {
        console.log('Starting initialization...');
        this.container.innerHTML = '';
        this.loadedImages = 0;
        this.imageData.clear();
        this.positions = [];
        this.heroCarousel.classList.remove('loaded');
        this.container.style.transition = 'none';

        // Create a continuous strip of images
        // First add clones at the end
        this.images.forEach((image, index) => {
            this.createImage(image, index, true);
        });

        // Add original images
        this.images.forEach((image, index) => {
            this.createImage(image, index, false);
        });

        // Add clones at the beginning
        this.images.forEach((image, index) => {
            this.createImage(image, index, true);
        });
    }

    createImage(src, index, isClone) {
        const img = document.createElement('img');
        img.className = 'carousel-image';
        if (isClone) {
            img.classList.add('clone');
        }
        img.src = src;
        img.alt = `Sports photography ${index + 1}`;
        
        img.onload = () => {
            console.log(`Image loaded: ${src}`);
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const isVertical = aspectRatio < 1;
            const width = isVertical ? Math.round(500 * aspectRatio) : this.horizontalWidth;
            
            this.imageData.set(src, {
                width,
                isVertical,
                aspectRatio
            });
            
            img.style.width = `${width}px`;
            
            this.loadedImages++;
            if (this.loadedImages === this.images.length * 3) {
                console.log('All images loaded, calculating positions...');
                this.calculatePositions();
                // Start at a random position in the middle section
                this.currentIndex = this.images.length + Math.floor(Math.random() * this.images.length);
                this.updatePosition(false);
                requestAnimationFrame(() => {
                    this.heroCarousel.classList.add('loaded');
                });
            }
        };

        img.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            this.loadedImages++;
            this.imageData.set(src, {
                width: 375,
                isVertical: true,
                aspectRatio: 0.75
            });
        };
        
        this.container.appendChild(img);
    }

    calculatePositions() {
        this.positions = [];
        let currentPosition = 0;
        const images = Array.from(this.container.children);
        
        images.forEach((img, index) => {
            const src = img.src.split('/').pop();
            const data = this.imageData.get(`/new/images/${src}`);
            if (data) {
                this.positions[index] = currentPosition;
                currentPosition += data.width;
            }
        });
        console.log('Positions calculated:', this.positions);
    }

    getImageData(index) {
        const images = Array.from(this.container.children);
        if (!images[index]) return null;
        const src = images[index].src.split('/').pop();
        return this.imageData.get(`/new/images/${src}`);
    }

    calculateScrollOffset(direction) {
        const currentData = this.getImageData(this.currentIndex);
        const targetIndex = direction === 'next' ? this.currentIndex + 1 : this.currentIndex - 1;
        const targetData = this.getImageData(targetIndex);

        if (!currentData || !targetData) return this.horizontalWidth;

        // Calculate offset based on orientation combinations
        if (!currentData.isVertical && !targetData.isVertical) {
            // Horizontal to Horizontal
            return this.horizontalWidth;
        } else if (currentData.isVertical && targetData.isVertical) {
            // Vertical to Vertical
            return (currentData.width + targetData.width) / 2;
        } else if (!currentData.isVertical && targetData.isVertical) {
            // Horizontal to Vertical
            return (this.horizontalWidth + targetData.width) / 2;
        } else {
            // Vertical to Horizontal
            return (currentData.width + this.horizontalWidth) / 2;
        }
    }

    updatePosition(useTransition = true) {
        console.log('Updating position:', { currentIndex: this.currentIndex, useTransition });
        
        if (useTransition) {
            // Set transition before the transform
            requestAnimationFrame(() => {
                this.container.style.transition = 'transform 0.5s ease-in-out';
                requestAnimationFrame(() => {
                    this.moveToPosition();
                });
            });
        } else {
            this.container.style.transition = 'none';
            this.moveToPosition();
        }
    }

    moveToPosition() {
        const currentPosition = this.positions[this.currentIndex] || 0;
        const currentWidth = this.getImageData(this.currentIndex)?.width || this.horizontalWidth;
        const centerOffset = (this.viewportWidth - currentWidth) / 2;
        
        const transform = `translateX(${-currentPosition + centerOffset}px)`;
        console.log('Moving to position:', { 
            currentPosition, 
            centerOffset, 
            transform,
            isTransitioning: this.isTransitioning,
            currentIndex: this.currentIndex
        });
        this.container.style.transform = transform;
    }

    handleTransitionEnd(e) {
        if (e.propertyName !== 'transform') return;
        
        console.log('Transition ended:', { 
            currentIndex: this.currentIndex,
            isTransitioning: this.isTransitioning,
            propertyName: e.propertyName
        });

        if (!this.isTransitioning) return;
        
        const totalImages = this.images.length;
        
        // Reset position if we've reached the clones
        if (this.currentIndex >= totalImages * 2) {
            this.currentIndex = totalImages;
            this.isTransitioning = false;
            this.updatePosition(false);
        } else if (this.currentIndex < totalImages) {
            this.currentIndex = totalImages * 2 - 1;
            this.isTransitioning = false;
            this.updatePosition(false);
        } else {
            this.isTransitioning = false;
        }
    }

    next() {
        console.log('Next clicked, current state:', { 
            isTransitioning: this.isTransitioning,
            currentIndex: this.currentIndex 
        });
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentIndex++;
        this.updatePosition(true);
    }

    prev() {
        console.log('Prev clicked, current state:', { 
            isTransitioning: this.isTransitioning,
            currentIndex: this.currentIndex 
        });
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        this.currentIndex--;
        this.updatePosition(true);
    }

    handleTouchStart(e) {
        if (this.isTransitioning) return;
        this.touchStartX = e.touches[0].clientX;
    }

    handleTouchEnd(e) {
        if (this.isTransitioning) return;
        this.touchEndX = e.changedTouches[0].clientX;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
        }
    }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, creating carousel...');
    new Carousel();
}); 