// Wait for navigation to be loaded
const initNavigation = () => {
    const nav = document.querySelector('.top-nav');
    if (!nav) {
        // If navigation isn't loaded yet, try again in 100ms
        setTimeout(initNavigation, 100);
        return;
    }

    let lastScroll = 0;

    // Handle scroll events
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add/remove scrolled class based on scroll position
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Handle all navigation links
    document.querySelectorAll('.nav-menu a, .nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            // Handle links that point to specific sections
            const href = this.getAttribute('href');
            if (href.includes('#take-your-shot') || href.includes('#beyond-the-game')) {
                e.preventDefault();
                
                // If we're already on index.html, scroll to the section
                if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
                    const sectionId = href.split('#')[1];
                    const target = document.querySelector(`#${sectionId}`);
                    if (target) {
                        const navHeight = nav.offsetHeight;
                        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight + 10;
                        // Jump directly to the position without smooth scrolling
                        window.scrollTo(0, targetPosition);
                    }
                } else {
                    // If we're on another page, navigate to index.html with the hash
                    window.location.href = href;
                }
            }
        });
    });

    // Handle hash in URL when page loads
    if (window.location.hash === '#take-your-shot' || window.location.hash === '#beyond-the-game') {
        const target = document.querySelector(window.location.hash);
        if (target) {
            // Jump directly to the position without smooth scrolling
            const navHeight = nav.offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight + 10;
            window.scrollTo(0, targetPosition);
        }
    }
};

// Start initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', initNavigation); 