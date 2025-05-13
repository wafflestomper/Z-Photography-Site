const ACCESS_TOKEN = 'EAAROKj7g0j0BOxt0bCutwHwSryzJZCcquzXhUy1EkHRDHRZBiFZANAgvIzSDbSXmGRbpEhZBzVEG8qG4qSKJsiwRlecqtmP2scyZAHjfaF69TvO0NA9400YdPWZC9TEgT7jrRiNYyNtRZCCjEAev7zcuerNboBAAqD72rwzngmgT9ZCmPs1E1ZBUIW2EfdwRtm06SfDXhFkfajbtAmyXZCT7JlZAlOAQ7a1QQZDZD'; // Replace with your full token for dev
const IG_USER_ID = '17841401845000174';
const MEDIA_COUNT = 5;

async function fetchInstagramMedia() {
    const url = `https://graph.facebook.com/v22.0/${IG_USER_ID}/media?fields=id,caption,media_url,permalink,thumbnail_url,timestamp&access_token=${ACCESS_TOKEN}&limit=${MEDIA_COUNT}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch Instagram media');
    const data = await response.json();
    return data.data || [];
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