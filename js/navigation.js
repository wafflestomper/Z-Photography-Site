// js/navigation.js

function generateNavHTML() {
    // Define the common inner HTML structure for the side navigation
    // Includes all links and the container for photo nav elements
    return `
        <div class="logo">
            <a href="/index.html" aria-label="Z Photography Home">
                <img src="/images/logo.png" alt="Z Photography - Richmond VA Sports Photographer" width="160" height="auto">
            </a>
        </div>
        <ul class="nav-links">
            <li data-page="about.html"><a href="/about.html">About</a></li>
            <li data-page="blog/index.html"><a href="/blog/index.html">Blog</a></li>
            <li data-page="galleries"><a href="https://zollinhofer.com" target="_blank" rel="noopener noreferrer">Galleries</a></li>
            <li data-page="contact.html">
                <a href="/contact.html">
                    <span class="desktop-only"><span class="large-first-letter">C</span>ontact</span>
                    <span class="mobile-only">Contact</span>
                </a>
            </li>
        </ul>
        <div class="photo-nav" role="navigation" aria-label="Photo gallery navigation">
             <div class="nav-helper-text">
                 ← → Arrow keys: Previous/Next<br>
                 Spacebar: <span id="pauseText">Pause</span>/<span id="playText">Play</span>
             </div>
             <div class="current-number" id="currentPhotoNumber">1</div>
             <div class="photo-dots" id="photoDots"></div>
             <p class="copyright-text" id="copyright"></p>
         </div>
    `;
}

function setCopyrightText() {
    const copyrightEl = document.getElementById('copyright');
    if (copyrightEl) {
        const date = new Date();
        const monthNames = ["January", "February", "March", "April", "May", "June",
                            "July", "August", "September", "October", "November", "December"];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        copyrightEl.innerHTML = `Copyright © Brian Zollinhofer<br>${month} ${year}`;
    }
}

function setEmailAddress() {
    const emailPlaceholder = document.getElementById('contact-email-placeholder');
    if (emailPlaceholder) { // Only run if the placeholder exists (i.e., on contact page)
        const user = 'brian';
        const domain = 'z-photography.com';
        const email = `${user}@${domain}`;
        emailPlaceholder.innerHTML = `<a href="mailto:${email}">${email}</a>`;
    }
}

// Function to set the phone number
function setPhoneNumber() {
    const phonePlaceholder = document.getElementById('contact-phone-placeholder');
    if (phonePlaceholder) { // Only run if the placeholder exists (i.e., on contact page)
        const areaCode = '804';
        const firstPart = '921';
        const lastPart = '3855';
        const phoneRaw = `${areaCode}-${firstPart}-${lastPart}`;
        const phoneDisplay = `${areaCode}-${firstPart}-${lastPart}`;
        phonePlaceholder.innerHTML = `Call or text: <a href="tel:+1${areaCode}${firstPart}${lastPart}">${phoneDisplay}</a>`;
    }
}

function renderNavigation() {
    const navContainer = document.querySelector('nav.side-nav'); // Target the existing <nav>
    if (!navContainer) {
        console.error("Navigation container (<nav class='side-nav'>) not found!");
        return;
    }

    // Inject the common HTML
    navContainer.innerHTML = generateNavHTML();

    // Determine current page
    const currentPath = window.location.pathname;
    const navLinks = navContainer.querySelectorAll('.nav-links li');
    navLinks.forEach(li => {
        const page = li.dataset.page;
        // Hide About link on /about.html
        if (page === 'about.html' && currentPath === '/about.html') {
            li.classList.add('nav-hidden');
        }
        // Hide Blog link on /blog/index.html or /blog/
        else if (page === 'blog/index.html' && (currentPath === '/blog/index.html' || currentPath === '/blog/')) {
            li.classList.add('nav-hidden');
        }
        // Hide Contact link on /contact.html
        else if (page === 'contact.html' && currentPath === '/contact.html') {
            li.classList.add('nav-hidden');
        }
    });

    // Hide photo nav elements on non-root-index pages
    const photoNav = navContainer.querySelector('.photo-nav');
    if (photoNav && !isRootIndex) {
        photoNav.style.display = 'none'; // Hide completely if not root index
    }

    // Set copyright text
    setCopyrightText();

    // Set email address (will only work if placeholder exists)
    setEmailAddress();

    // Set phone number (will only work if placeholder exists)
    setPhoneNumber();
}

// Run the function when the DOM is ready
document.addEventListener('DOMContentLoaded', renderNavigation); 