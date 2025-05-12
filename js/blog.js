// Function to parse front matter from markdown content
function parseFrontMatter(content) {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = content.match(frontMatterRegex);
    
    if (!match) return { content, metadata: {} };
    
    const frontMatter = match[1];
    const metadata = {};
    
    frontMatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            const value = valueParts.join(':').trim();
            try {
                metadata[key.trim()] = JSON.parse(value);
            } catch {
                metadata[key.trim()] = value.replace(/^"|"$/g, '');
            }
        }
    });
    
    return {
        content: content.slice(match[0].length),
        metadata
    };
}

// Function to convert markdown to HTML (simplified version)
function markdownToHtml(markdown) {
    return markdown
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^\s*-\s+(.*$)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
        .replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/g, '<ol>$1</ol>');
}

// Function to create a blog card
function createBlogCard(post) {
    const card = document.createElement('article');
    card.className = 'blog-card';
    
    card.innerHTML = `
        <img src="${post.metadata.featuredImage}" alt="${post.metadata.title}" class="blog-card-image">
        <div class="blog-card-content">
            <h2 class="blog-card-title">${post.metadata.title}</h2>
            <p class="blog-card-excerpt">${post.metadata.excerpt}</p>
            <div class="blog-card-meta">
                <span>${new Date(post.metadata.date).toLocaleDateString()}</span>
                <span>${post.metadata.author}</span>
            </div>
            <div class="blog-card-tags">
                ${post.metadata.tags.map(tag => `<span class="blog-card-tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        window.location.href = `/blog/posts/${post.slug}.html`;
    });
    
    return card;
}

// Function to load and display blog posts
async function loadBlogPosts() {
    try {
        const response = await fetch('/blog/posts/2024-03-20-getting-started-with-sports-photography.md');
        const content = await response.text();
        
        const { metadata, content: markdownContent } = parseFrontMatter(content);
        const htmlContent = markdownToHtml(markdownContent);
        
        const blogGrid = document.getElementById('blogGrid');
        if (blogGrid) {
            const post = {
                metadata,
                content: htmlContent,
                slug: '2024-03-20-getting-started-with-sports-photography'
            };
            blogGrid.appendChild(createBlogCard(post));
        }
    } catch (error) {
        console.error('Error loading blog posts:', error);
    }
}

// Function to handle category filtering
function setupCategoryFiltering() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const category = button.dataset.category;
            const cards = document.querySelectorAll('.blog-card');
            
            cards.forEach(card => {
                if (category === 'all') {
                    card.style.display = 'block';
                } else {
                    const cardCategories = card.dataset.categories.split(',');
                    card.style.display = cardCategories.includes(category) ? 'block' : 'none';
                }
            });
        });
    });
}

// Function to highlight search matches in text
function highlightMatches(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Function to search through blog posts
function searchBlogPosts(searchTerm) {
    const cards = document.querySelectorAll('.blog-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const title = card.querySelector('.blog-card-title').textContent;
        const excerpt = card.querySelector('.blog-card-excerpt').textContent;
        const tags = Array.from(card.querySelectorAll('.blog-card-tag'))
            .map(tag => tag.textContent)
            .join(' ');
        
        const searchableText = `${title} ${excerpt} ${tags}`.toLowerCase();
        const searchTermLower = searchTerm.toLowerCase();
        
        if (searchableText.includes(searchTermLower)) {
            card.style.display = 'block';
            visibleCount++;
            
            // Highlight matches in title and excerpt
            if (searchTerm) {
                const titleEl = card.querySelector('.blog-card-title');
                const excerptEl = card.querySelector('.blog-card-excerpt');
                
                titleEl.innerHTML = highlightMatches(title, searchTerm);
                excerptEl.innerHTML = highlightMatches(excerpt, searchTerm);
            }
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update results count
    const resultsCount = document.getElementById('searchResultsCount');
    if (resultsCount) {
        resultsCount.textContent = searchTerm 
            ? `Found ${visibleCount} post${visibleCount !== 1 ? 's' : ''}`
            : '';
    }
}

// Function to setup search functionality
function setupSearch() {
    const searchInput = document.getElementById('blogSearch');
    if (!searchInput) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchBlogPosts(e.target.value);
        }, 300); // Debounce search for better performance
    });
    
    // Clear highlights when search is cleared
    searchInput.addEventListener('change', (e) => {
        if (!e.target.value) {
            const cards = document.querySelectorAll('.blog-card');
            cards.forEach(card => {
                const titleEl = card.querySelector('.blog-card-title');
                const excerptEl = card.querySelector('.blog-card-excerpt');
                
                titleEl.innerHTML = titleEl.textContent;
                excerptEl.innerHTML = excerptEl.textContent;
            });
        }
    });
}

// Lightbox modal for .enlarge-image
(function() {
    function createLightbox() {
        if (document.getElementById('lightbox-modal')) return; // Only one modal
        const modal = document.createElement('div');
        modal.id = 'lightbox-modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="lightbox-backdrop"></div>
            <button class="lightbox-close" aria-label="Close image">&times;</button>
            <img class="lightbox-img" src="" alt="Enlarged image">
        `;
        document.body.appendChild(modal);
        // Close on click outside image, on close button, or Escape
        modal.querySelector('.lightbox-backdrop').onclick = closeLightbox;
        modal.querySelector('.lightbox-close').onclick = closeLightbox;
        modal.addEventListener('click', function(e) {
            // Only close if clicking backdrop or modal itself (not image or close button)
            if (e.target === modal) closeLightbox();
        });
        document.addEventListener('keydown', function(e) {
            // Fix: close if modal is visible and Escape is pressed
            if (modal.style.display !== 'none' && e.key === 'Escape') closeLightbox();
        });
    }
    function openLightbox(src, alt) {
        const modal = document.getElementById('lightbox-modal');
        if (!modal) return;
        const img = modal.querySelector('.lightbox-img');
        img.src = src;
        img.alt = alt || '';
        modal.style.display = 'flex';
    }
    function closeLightbox() {
        const modal = document.getElementById('lightbox-modal');
        if (modal) modal.style.display = 'none';
    }
    document.addEventListener('DOMContentLoaded', function() {
        createLightbox();
        document.body.addEventListener('click', function(e) {
            const a = e.target.closest('a.enlarge-image');
            if (a) {
                e.preventDefault();
                const img = a.querySelector('img');
                openLightbox(a.href, img ? img.alt : '');
            }
        });
    });
})();

// Initialize blog functionality
document.addEventListener('DOMContentLoaded', () => {
    loadBlogPosts();
    setupCategoryFiltering();
    setupSearch();
}); 