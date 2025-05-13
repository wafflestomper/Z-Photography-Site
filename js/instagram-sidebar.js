// Load environment variables
let ACCESS_TOKEN = null;
const IG_USER_ID = '17841401845000174';
const MEDIA_COUNT = 5;

async function getAccessToken() {
    if (!ACCESS_TOKEN) {
        try {
            const response = await fetch('/api/instagram-token');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data.token) {
                throw new Error('No token received from server');
            }
            ACCESS_TOKEN = data.token;
        } catch (error) {
            console.error('Error fetching Instagram token:', error);
            throw error;
        }
    }
    return ACCESS_TOKEN;
}

async function fetchInstagramMedia() {
    try {
        const token = await getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }
        const url = `https://graph.facebook.com/v22.0/${IG_USER_ID}/media?fields=id,caption,media_url,permalink,thumbnail_url,timestamp&access_token=${token}&limit=${MEDIA_COUNT}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch Instagram media: ${response.status}`);
        }
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error in fetchInstagramMedia:', error);
        throw error;
    }
}

function renderInstagramGrid(media) {
    const container = document.getElementById('instagram-sidebar-gallery');
    if (!container) return;
    let html = '<h3 class="ig-sidebar-heading" style="text-align:center;">Latest on Instagram</h3><div class="ig-grid">';
    media.slice(0, MEDIA_COUNT).forEach(item => {
        html += `<a href="${item.permalink}" target="_blank" rel="noopener" class="ig-grid-item">
            <img src="${item.media_url}" alt="Instagram photo" loading="lazy" />
        </a>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Only run on blog pages
if (window.location.pathname.startsWith('/blog/')) {
    fetchInstagramMedia()
        .then(renderInstagramGrid)
        .catch(err => {
            const container = document.getElementById('instagram-sidebar-gallery');
            if (container) container.innerHTML = '<p>Could not load Instagram feed.</p>';
        });
}

// Add some basic styles
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