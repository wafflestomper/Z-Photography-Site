// js/navigation.js

import { getElement } from '/js/utils.js';
import { onDOMReady } from '/js/dom-ready.js';

function generateNavHTML() {
    // Determine if we are on the main page
    const isMainPage = window.location.pathname === '/' || window.location.pathname === '/index.html';
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
            ${isMainPage ? `<div class="nav-helper-text">
                ← → Arrow keys: Previous/Next<br>
                Spacebar: <span id="pauseText">Pause</span>/<span id="playText">Play</span>
            </div>` : ''}
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
    const navContainer = getElement('main-nav');
    if (!navContainer) return;

    navContainer.innerHTML = generateNavHTML();
    setCopyrightText();
    setEmailAddress();
    setPhoneNumber();
}

// Initialize navigation
onDOMReady(renderNavigation); 