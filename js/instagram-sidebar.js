// Load environment variables
const MEDIA_COUNT = 10;

async function loadInstagramData() {
    try {
        console.log('Attempting to fetch Instagram data...');
        const response = await fetch('/data/instagram-v2.json');
        console.log('Fetch response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Instagram data loaded successfully:', data);
        return data.data || [];
    } catch (error) {
        console.error('Error loading Instagram data:', error);
        throw error;
    }
}

function renderInstagramGrid(media) {
    console.log('Rendering Instagram grid with media:', media);
    const container = document.getElementById('instagram-sidebar-gallery');
    if (!container) {
        console.error('Instagram container not found in DOM');
        return;
    }
    let html = '<h3 class="ig-sidebar-heading">Latest on Instagram</h3>';
    html += `<a href="https://www.instagram.com/brianzollinhofer/" target="_blank" rel="noopener" class="ig-follow-btn">Follow @brianzollinhofer</a>`;
    html += '<div class="ig-grid">';
    media.slice(0, MEDIA_COUNT).forEach(item => {
        console.log('Rendering image:', item.media_url);
        html += `<div class="ig-grid-item">
            <a href="${item.permalink}" target="_blank" rel="noopener" class="ig-grid-link">
                <img src="${item.media_url}" 
                     alt="${item.caption || 'Instagram photo'}" 
                     loading="lazy"
                     onerror="console.error('Failed to load image:', this.src)" />
            </a>
        </div>`;
    });
    html += '</div>';
    container.innerHTML = html;
    console.log('Instagram grid rendered');
}

// Initialize Instagram feed
function initInstagramFeed() {
    console.log('Initializing Instagram feed...');
    console.log('Current path:', window.location.pathname);
    // Only run on blog pages
    if (window.location.pathname.startsWith('/blog/')) {
        console.log('On blog page, loading Instagram data...');
        loadInstagramData()
            .then(media => {
                console.log('Instagram data loaded, rendering grid...');
                renderInstagramGrid(media);
            })
            .catch(err => {
                console.error('Instagram feed error:', err);
                const container = document.getElementById('instagram-sidebar-gallery');
                if (container) {
                    container.innerHTML = '<p>Could not load Instagram feed.</p>';
                    console.error('Error container rendered');
                } else {
                    console.error('Could not find container to show error');
                }
            });
    } else {
        console.log('Not on blog page, skipping Instagram feed');
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    console.log('Document still loading, waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded fired');
        initInstagramFeed();
    });
} else {
    console.log('Document already loaded');
    initInstagramFeed();
} 