// Function to load the footer
async function loadFooter() {
    try {
        const response = await fetch('/new/templates/footer.html');
        const footerHtml = await response.text();
        
        // Insert the footer before the closing body tag
        document.body.insertAdjacentHTML('beforeend', footerHtml);
        
        // Update the current year
        document.getElementById('current-year').textContent = new Date().getFullYear();
    } catch (error) {
        console.error('Error loading footer:', error);
    }
}

// Load the footer when the DOM is ready
document.addEventListener('DOMContentLoaded', loadFooter); 