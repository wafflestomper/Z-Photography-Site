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
            <li data-page="about.html"><a href="/about.html">ABOUT</a></li>
            <li data-page="blog/index.html"><a href="/blog/index.html">BLOG</a></li>
            <li data-page="galleries"><a href="https://zollinhofer.com" target="_blank" rel="noopener noreferrer">GALLERIES</a></li>
            <li data-page="contact.html"><a href="https://z-photography.com/contact.html">CONTACT</a></li>
        </ul>
        <div class="upcoming-shoot" id="upcomingShoot">
            <!-- Content will be loaded dynamically -->
        </div>
        <div class="photo-nav" role="navigation" aria-label="Photo gallery navigation">
            ${isMainPage ? `<div class="nav-helper-text">
                ← → Arrow keys: Previous/Next<br>
                Spacebar: <span id="pauseText">Pause</span>/<span id="playText">Play</span>
            </div>` : ''}
            <div class="current-number" id="currentPhotoNumber">1</div>
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

// Add function to load and display upcoming shoot
async function loadUpcomingShoot() {
    try {
        const response = await fetch('/data/upcoming-shoot.json');
        if (!response.ok) throw new Error('Failed to fetch upcoming shoot data');
        const data = await response.json();
        
        const upcomingShootEl = document.getElementById('upcomingShoot');
        if (!upcomingShootEl) return;

        // Get current date
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
        
        // Find the next two upcoming shoots
        const nextShoots = data.upcomingShoots
            .filter(shoot => {
            const shootDate = new Date(shoot.date);
                shootDate.setHours(0, 0, 0, 0);
            return shootDate >= now;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 2);

        // If no upcoming shoots found, hide the section
        if (nextShoots.length === 0) {
            upcomingShootEl.style.display = 'none';
            return;
        }

        // Show the section if we have shoots
        upcomingShootEl.style.display = 'block';

        // Generate HTML for each shoot
        const shootsHTML = nextShoots.map((shoot, index) => {
            const { date, eventName, location, description, image, type, details } = shoot;
            const formattedDate = new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
                day: 'numeric'
        });

        // Format time if available
        const timeInfo = details.startTime ? 
            `${details.startTime}${details.endTime ? ` - ${details.endTime}` : ''}` : '';

            return `
            <div class="upcoming-shoot-card">
                ${image ? `<img src="${image}" alt="${eventName}" loading="lazy">` : ''}
                <div class="upcoming-shoot-details">
                    <h4>${eventName}</h4>
                    <p class="date">${formattedDate}</p>
                    ${timeInfo ? `<p class="time">${timeInfo}</p>` : ''}
                    <p class="location">${location}</p>
                    ${details ? `
                        <div class="shoot-details">
                            ${details.teams ? `<p class="teams">Teams: ${details.teams.join(', ')}</p>` : ''}
                            ${details.sessionType ? `<p class="session-type">Session: ${details.sessionType}</p>` : ''}
                            ${details.numberOfSubjects ? `<p class="subjects">Subjects: ${details.numberOfSubjects}</p>` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
            `;
        }).join('');

        upcomingShootEl.innerHTML = `
            <h3>Upcoming Events</h3>
            ${shootsHTML}
        `;
    } catch (error) {
        console.error('Error loading upcoming shoot:', error);
        // Hide the section on error
        const upcomingShootEl = document.getElementById('upcomingShoot');
        if (upcomingShootEl) {
            upcomingShootEl.style.display = 'none';
        }
    }
}

// Update the renderNavigation function to include loading the upcoming shoot
function renderNavigation() {
    const navContainer = getElement('main-nav');
    if (!navContainer) return;

    navContainer.innerHTML = generateNavHTML();
    setCopyrightText();
    setEmailAddress();
    setPhoneNumber();
    loadUpcomingShoot();
}

// Initialize navigation
onDOMReady(renderNavigation); 