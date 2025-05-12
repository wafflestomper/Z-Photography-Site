// Utility functions

/**
 * Highlights matching text in a string
 * @param {string} text - The text to search in
 * @param {string} searchTerm - The term to highlight
 * @returns {string} Text with highlighted matches
 */
export function highlightMatches(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

/**
 * Formats a date to a localized string
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

/**
 * Debounces a function call
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Checks if an element is in the viewport
 * @param {Element} element - The element to check
 * @returns {boolean} Whether the element is in viewport
 */
export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Safely gets an element by ID
 * @param {string} id - The element ID
 * @returns {Element|null} The element or null if not found
 */
export function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with ID "${id}" not found`);
        return null;
    }
    return element;
}

/**
 * Safely gets elements by selector
 * @param {string} selector - The CSS selector
 * @returns {NodeList} The matching elements
 */
export function getElements(selector) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) {
        console.warn(`No elements found matching selector "${selector}"`);
    }
    return elements;
} 