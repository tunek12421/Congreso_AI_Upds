// Utility functions for the Congress application
console.log('🛠️ Utilidades cargadas correctamente');

class Utils {
    static formatDate(dateString, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            locale: 'es-ES'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        const locale = formatOptions.locale;
        delete formatOptions.locale;
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(locale, formatOptions);
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateString;
        }
    }

    static truncateText(text, maxLength = 100, suffix = '...') {
        if (!text || text.length <= maxLength) {
            return text || '';
        }
        return text.substring(0, maxLength).trim() + suffix;
    }

    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else if (key === 'textContent') {
                element.textContent = value;
            } else {
                element[key] = value;
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    }

    static debounce(func, wait) {
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

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Export para uso global
window.Utils = Utils;
window.formatDate = Utils.formatDate.bind(Utils);
window.truncateText = Utils.truncateText.bind(Utils);
window.debounce = Utils.debounce.bind(Utils);
window.throttle = Utils.throttle.bind(Utils);
window.createElement = Utils.createElement.bind(Utils);
