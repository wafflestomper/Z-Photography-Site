// Load environment variables
const MEDIA_COUNT = 5;

async function loadInstagramData() {
    try {
        const response = await fetch('/data/instagram.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error('Error loading Instagram data:', error);
        throw error;
    }
}

function renderInstagramGrid(media) {
    const container = document.getElementById('instagram-sidebar-gallery');
    if (!container) return;
    let html = '<h3 class="ig-sidebar-heading" style="text-align:center;">Latest on Instagram</h3><div class="ig-grid">';
    media.slice(0, MEDIA_COUNT).forEach(item => {
        html += `<a href="${item.permalink}" target="_blank" rel="noopener" class="ig-grid-item">
            <img src="${item.media_url}" alt="${item.caption || 'Instagram photo'}" loading="lazy" />
        </a>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Initialize Instagram feed
function initInstagramFeed() {
    // Only run on blog pages
    if (window.location.pathname.startsWith('/blog/')) {
        loadInstagramData()
            .then(renderInstagramGrid)
            .catch(err => {
                const container = document.getElementById('instagram-sidebar-gallery');
                if (container) container.innerHTML = '<p>Could not load Instagram feed.</p>';
            });
    }
}

// Add styles
function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
    #instagram-sidebar-gallery {
      margin-top: 0;
    }
    .ig-sidebar-heading {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      font-weight: bold;
      text-align: center;
    }
    .ig-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
    }
    .ig-grid-item img {
      width: 100%;
      max-width: 320px;
      height: auto;
      aspect-ratio: 1/1;
      object-fit: cover;
      border-radius: 4px;
      display: block;
      margin: 0 auto;
    }
    `;
    document.head.appendChild(style);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        addStyles();
        initInstagramFeed();
    });
} else {
    addStyles();
    initInstagramFeed();
} 