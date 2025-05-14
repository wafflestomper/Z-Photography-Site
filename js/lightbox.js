// Lightbox Module
import { onDOMReady } from '/js/dom-ready.js';

export class Lightbox {
    constructor() {
        this.modal = null;
        this.init();
    }

    init() {
        this.createLightbox();
        this.setupEventListeners();
        console.log('Lightbox initialized'); // Debug log
    }

    createLightbox() {
        if (document.getElementById('lightbox-modal')) return; // Only one modal
        this.modal = document.createElement('div');
        this.modal.id = 'lightbox-modal';
        this.modal.style.display = 'none';
        this.modal.innerHTML = `
            <div class="lightbox-backdrop"></div>
            <button class="lightbox-close" aria-label="Close image">&times;</button>
            <img class="lightbox-img" src="" alt="Enlarged image">
        `;
        document.body.appendChild(this.modal);
        console.log('Lightbox modal created'); // Debug log
    }

    setupEventListeners() {
        if (!this.modal) return;
        
        // Close on click outside image, on close button, or Escape
        this.modal.querySelector('.lightbox-backdrop').onclick = () => this.close();
        this.modal.querySelector('.lightbox-close').onclick = () => this.close();
        
        this.modal.addEventListener('click', (e) => {
            // Only close if clicking backdrop or modal itself (not image or close button)
            if (e.target === this.modal) this.close();
        });
        
        document.addEventListener('keydown', (e) => {
            if (this.modal.style.display !== 'none' && e.key === 'Escape') this.close();
        });

        // Handle clicks on enlarge-image links and their child images
        document.body.addEventListener('click', (e) => {
            const link = e.target.closest('a.enlarge-image');
            if (link) {
                e.preventDefault();
                const img = link.querySelector('img');
                console.log('Enlarge image clicked:', link.href); // Debug log
                this.open(link.href, img ? img.alt : '');
            }
        });
    }

    open(src, alt) {
        if (!this.modal) return;
        const img = this.modal.querySelector('.lightbox-img');
        img.src = src;
        img.alt = alt || '';
        this.modal.style.display = 'flex';
        console.log('Lightbox opened:', src); // Debug log
    }

    close() {
        if (this.modal) this.modal.style.display = 'none';
        console.log('Lightbox closed'); // Debug log
    }
}

// Initialize lightbox when DOM is ready
onDOMReady(() => {
    console.log('DOM ready, initializing lightbox'); // Debug log
    window.lightbox = new Lightbox();
}); 