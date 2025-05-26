// Load environment variables
const MEDIA_COUNT = 10;

async function loadInstagramData() {
    try {
        const response = await fetch('/data/instagram-v2.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error loading Instagram data:', error);
        throw error;
    }
}

function renderInstagramGrid(media) {
    const container = document.getElementById('instagram-sidebar-gallery');
    if (!container) return;
    let html = '<h3 class="ig-sidebar-heading" style="text-align:center;">Latest on Instagram</h3>';
    html += `<a href="https://www.instagram.com/brianzollinhofer/" target="_blank" rel="noopener" class="ig-follow-btn">Follow @brianzollinhofer</a>`;
    html += '<div class="ig-grid">';
    media.slice(0, MEDIA_COUNT).forEach(item => {
        html += `<a href="${item.permalink}" target="_blank" rel="noopener" class="ig-grid-item">
            <img src="${item.media_url}" 
                 alt="${item.caption || 'Instagram photo'}" 
                 loading="lazy" />
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
                console.error('Instagram feed error:', err);
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
    .ig-follow-btn {
      display: block;
      width: 90%;
      margin: 0 auto 0.75rem auto;
      background: #0095F6;
      color: #fff;
      font-weight: 600;
      text-align: center;
      border-radius: 6px;
      padding: 0.5rem 0;
      text-decoration: none;
      font-size: 1rem;
      transition: background 0.2s;
    }
    .ig-follow-btn:hover {
      background: #0081D6;
    }
    .ig-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 6px;
    }
    .ig-grid-item {
      padding: 0;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 250px;
      height: 250px;
      overflow: hidden;
    }
    .ig-grid-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
      display: block;
      margin: 0;
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