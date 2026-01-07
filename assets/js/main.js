// Shared JavaScript utilities for Electrical Aptitude Test Practice Site

/**
 * Initialize common functionality when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function () {
    // Add any shared initialization code here
    console.log('Electrical Aptitude Test Practice Site loaded');

    // Example: Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});

/**
 * Utility function to format time (for future timer functionality)
 */
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Utility function to show notifications/alerts
 */
function showNotification(message, type = 'info') {
    // Placeholder for future notification system
    console.log(`[${type.toUpperCase()}] ${message}`);
}

