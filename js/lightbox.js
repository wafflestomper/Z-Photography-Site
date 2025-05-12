// Lightbox Module
export class Lightbox {
    constructor() {
        this.modal = null;
        this.init();
    }

    init() {
        this.createLightbox();
        this.setupEventListeners();
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

        // Handle clicks on enlarge-image links
        document.body.addEventListener('click', (e) => {
            const a = e.target.closest('a.enlarge-image');
            if (a) {
                e.preventDefault();
                const img = a.querySelector('img');
                this.open(a.href, img ? img.alt : '');
            }
        });
    }

    open(src, alt) {
        if (!this.modal) return;
        const img = this.modal.querySelector('.lightbox-img');
        img.src = src;
        img.alt = alt || '';
        this.modal.style.display = 'flex';
    }

    close() {
        if (this.modal) this.modal.style.display = 'none';
    }
}

// Initialize lightbox when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.lightbox = new Lightbox();
}); 