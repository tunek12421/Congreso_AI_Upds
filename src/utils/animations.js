// Animation utilities for the Congress application

class AnimationUtils {
    static fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
    }

    static slideDown(element, duration = 300) {
        const height = element.scrollHeight;
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.transition = `height ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.height = height + 'px';
        }, 10);
    }

    static fadeOut(element, duration = 300, callback = null) {
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            if (callback) callback();
        }, duration);
    }
}

// Export para uso global
window.AnimationUtils = AnimationUtils;
console.log('🎨 Utilidades de animación cargadas');
