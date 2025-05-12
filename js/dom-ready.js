// DOM ready event handler

/**
 * Executes a function when the DOM is ready
 * @param {Function} fn - The function to execute
 */
export function onDOMReady(fn) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        fn();
    }
}

/**
 * Executes multiple functions when the DOM is ready
 * @param {...Function} fns - The functions to execute
 */
export function onDOMReadyAll(...fns) {
    onDOMReady(() => {
        fns.forEach(fn => {
            try {
                fn();
            } catch (error) {
                console.error('Error in DOM ready handler:', error);
            }
        });
    });
} 