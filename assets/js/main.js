// Main application initialization
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Inicializando Congreso IA - UPDS');

    // Initialize global components
    await initializeApp();
    
    // Setup global event listeners
    setupGlobalEvents();
    
    // Initialize scroll animations
    setupScrollAnimations();
    
    // Load dynamic content
    await loadDynamicContent();
    
    // Setup navigation
    setupNavigation();
    
    console.log('✅ Aplicación inicializada correctamente');
});

// Main initialization function
async function initializeApp() {
    try {
        // Validate data integrity
        const validation = await dataService.validateData();
        if (!validation.valid) {
            console.warn('⚠️ Problemas de integridad de datos:', validation.issues);
        }
        
        // Initialize components
        await initializeComponents();
        
        // Load event information
        await loadEventInfo();
        
        // Setup error handling
        setupErrorHandling();
        
    } catch (error) {
        console.error('❌ Error inicializando aplicación:', error);
        showGlobalError('Error al cargar la aplicación');
    }
}

// Initialize all components
async function initializeComponents() {
    try {
        // Initialize speakers component
        const speakersContainer = document.getElementById('speakers-container');
        if (speakersContainer) {
            window.speakerComponent = new SpeakerComponent(speakersContainer);
            await window.speakerComponent.init();
        }
        
        // Initialize schedule component
        const scheduleContainer = document.getElementById('schedule-container');
        if (scheduleContainer) {
            window.scheduleComponent = new ScheduleComponent(scheduleContainer);
            await window.scheduleComponent.init();
        }
        
        // Initialize tickets component
        const ticketsContainer = document.getElementById('tickets-container');
        if (ticketsContainer) {
            window.ticketComponent = new TicketSectionComponent(ticketsContainer);
            await window.ticketComponent.init();
        }
        
        console.log('✅ Componentes inicializados');
        
    } catch (error) {
        console.error('❌ Error inicializando componentes:', error);
        throw error;
    }
}
async function loadEventDate(){
}
// Load dynamic content
async function loadDynamicContent() {
    try {
        // Load event date
        await loadEventDate();
        
        // Load statistics
        await loadStatistics();
        
        // Load topics
        await loadTopics();
        
        console.log('✅ Contenido dinámico cargado');
        
    } catch (error) {
        console.error('❌ Error cargando contenido dinámico:', error);
    }
}

// Load event information
async function loadEventInfo() {
    try {
        const eventInfo = await dataService.getEventInfo();
        
        // Update event date in hero
        const eventDateElement = document.getElementById('event-date');
        if (eventDateElement && eventInfo.date) {
            const date = new Date(eventInfo.date);
            const options = { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
            };
            eventDateElement.textContent = `${date.toLocaleDateString('es-ES', options)} - ${eventInfo.location?.city}, ${eventInfo.location?.country}`;
        }
        
    } catch (error) {
        console.error('Error loading event info:', error);
        const eventDateElement = document.getElementById('event-date');
        if (eventDateElement) {
            eventDateElement.textContent = 'Cochabamba, Bolivia';
        }
    }
}

// Load and animate statistics
async function loadStatistics() {
    try {
        const stats = await dataService.getStatistics();
        
        // Update stat numbers with animation trigger
        Object.entries(stats).forEach(([key, value]) => {
            const statElement = document.querySelector(`[data-target="${value}"]`);
            if (statElement) {
                statElement.setAttribute('data-target', value);
            }
        });
        
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Load topics
async function loadTopics() {
    try {
        const topics = await dataService.getTopics();
        const topicsContainer = document.getElementById('topics-container');
        
        if (topicsContainer && topics.length > 0) {
            topicsContainer.innerHTML = topics.map(topic => 
                `<span style="background: var(--gradient-accent); color: white; padding: 0.5rem 1.5rem; border-radius: 25px; font-weight: 500;">${topic}</span>`
            ).join('');
        }
        
    } catch (error) {
        console.error('Error loading topics:', error);
    }
}

// Setup global event listeners
function setupGlobalEvents() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
            if(document.querySelector(".mobile-open"))toggleMobileMenu();
        });
    });

    // Mobile menu toggle (future enhancement)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }

    // Global click handler for buttons with ripple effect
    document.addEventListener('click', function(e) {
        if (e.target.closest('.btn')) {
            createRippleEffect(e, e.target.closest('.btn'));
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Handle focus for accessibility
    setupFocusManagement();
    
    console.log('✅ Event listeners configurados');
}

// Setup scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Trigger counter animation for stats
                if (entry.target.closest('.impact-stats')) {
                    animateCounters();
                }
            }
        });
    }, observerOptions);

    // Observe all fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // Staggered animations for cards
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
            }
        });
    }, observerOptions);

    // Apply to card elements
    document.querySelectorAll('.about-card, .speaker-card, .ticket-card').forEach(card => {
        staggerObserver.observe(card);
    });
}

// Setup navigation functionality
function setupNavigation() {
    // Active section highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    
    const highlightNavigation = throttle(() => {
        const scrollPos = window.scrollY + 200;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, 100);
    
    window.addEventListener('scroll', highlightNavigation);
}

// Animate counter numbers
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        const isPercentage = counter.textContent.includes('%');
        let current = 0;
        const increment = target / 50;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.ceil(current) + (isPercentage ? '%' : '');
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + (isPercentage ? '%' : '');
            }
        };
        
        updateCounter();
    });
}

// Parallax effect for floating elements
function updateParallaxElements(scrollY) {
    const parallaxElements = document.querySelectorAll('.floating-element');
    const speed = 0.5;

    parallaxElements.forEach(element => {
        const yPos = -(scrollY * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
}

// Dynamic gradient animation speed
function updateAnimatedBackground(scrollY) {
    const scrollPercent = scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    const animatedBg = document.querySelector('.animated-bg');
    if (animatedBg) {
        animatedBg.style.animationDuration = `${15 - (scrollPercent * 10)}s`;
    }
}

// Ripple effect for buttons
function createRippleEffect(event, button) {
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
        z-index: 1;
    `;
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
        }
    }, 600);
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    
    if (navLinks) {
        navLinks.classList.toggle('mobile-open');
        mobileBtn.classList.toggle('active');
        
        // Toggle icon
        const icon = mobileBtn.querySelector('i');
        if (icon) {
            icon.className = navLinks.classList.contains('mobile-open') ? 
                'fas fa-times' : 'fas fa-bars';
        }
    }
}

// Keyboard navigation handler
function handleKeyboardNavigation(e) {
    // Close modals on Escape
    if (e.key === 'Escape') {
        const activeModals = document.querySelectorAll('.speaker-modal.active, .session-modal.active');
        activeModals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) closeBtn.click();
        });
        
        // Close mobile menu
        const navLinks = document.querySelector('.nav-links.mobile-open');
        if (navLinks) {
            toggleMobileMenu();
        }
    }
    
    // Navigate sections with arrow keys (when focused on nav)
    if (document.activeElement.closest('.nav-links')) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const links = document.querySelectorAll('.nav-links a');
            const currentIndex = Array.from(links).indexOf(document.activeElement);
            const nextIndex = (currentIndex + 1) % links.length;
            links[nextIndex].focus();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const links = document.querySelectorAll('.nav-links a');
            const currentIndex = Array.from(links).indexOf(document.activeElement);
            const prevIndex = currentIndex === 0 ? links.length - 1 : currentIndex - 1;
            links[prevIndex].focus();
        }
    }
}

// Focus management for accessibility
function setupFocusManagement() {
    // Skip link functionality
    /*const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Saltar al contenido principal';
    document.body.insertBefore(skipLink, document.body.firstChild);*/
    
    // Add main landmark if not exists
    const main = document.querySelector('main');
    if (main && !main.id) {
        main.id = 'main';
    }
    
    // Trap focus in modals
    document.addEventListener('keydown', function(e) {
        const activeModal = document.querySelector('.speaker-modal.active, .session-modal.active');
        if (activeModal && e.key === 'Tab') {
            trapFocus(e, activeModal);
        }
    });
}

// Trap focus within modal
function trapFocus(e, modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey) {
        if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        }
    } else {
        if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }
}

// Error handling setup
function setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', function(e) {
        console.error('❌ Error global:', e.error);
        showGlobalError('Ha ocurrido un error inesperado');
    });
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', function(e) {
        console.error('❌ Promise rejection:', e.reason);
        showGlobalError('Error al cargar datos');
    });
    
    // Network errors
    window.addEventListener('offline', function() {
        showGlobalError('Sin conexión a internet', 'warning');
    });
    
    window.addEventListener('online', function() {
        showToast('Conexión restablecida', 'success');
    });
}

// Show global error message
function showGlobalError(message, type = 'error') {
    const errorBanner = document.createElement('div');
    errorBanner.className = `error-banner error-${type}`;
    errorBanner.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button class="error-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles for error banner
    const style = document.createElement('style');
    style.textContent = `
        .error-banner {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: var(--error);
            color: white;
            padding: 1rem;
            z-index: 9999;
            transform: translateY(-100%);
            transition: transform 0.3s ease;
        }
        .error-banner.error-warning {
            background: var(--warning);
            color: var(--dark-background-text);
        }
        .error-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        .error-close {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            padding: 0.25rem;
        }
    `;
    
    if (!document.querySelector('#error-banner-styles')) {
        style.id = 'error-banner-styles';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(errorBanner);
    
    // Animate in
    setTimeout(() => {
        errorBanner.style.transform = 'translateY(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorBanner.parentElement) {
            errorBanner.style.transform = 'translateY(-100%)';
            setTimeout(() => {
                if (errorBanner.parentElement) {
                    errorBanner.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Toast notification utility
function showToast(message, type = 'info', duration = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 300);
    }, duration);
}

function getToastIcon(type) {
    const icons = {
        'success': 'check',
        'error': 'times',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Utility functions
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function debounce(func, wait) {
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

// Performance monitoring
function monitorPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');
                
                console.log('📊 Performance Metrics:');
                console.log(`- DOM Content Loaded: ${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`);
                console.log(`- Page Load: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
                
                paint.forEach(entry => {
                    console.log(`- ${entry.name}: ${entry.startTime}ms`);
                });
                
                // Log any long tasks
                if ('PerformanceObserver' in window) {
                    const observer = new PerformanceObserver((list) => {
                        list.getEntries().forEach((entry) => {
                            if (entry.duration > 50) {
                                console.warn(`⚠️ Long task detected: ${entry.duration}ms`);
                            }
                        });
                    });
                    observer.observe({entryTypes: ['longtask']});
                }
            }, 1000);
        });
    }
}

// Service Worker registration for future PWA
function registerServiceWorker() {
    if ('serviceWorker' in navigator && 'production' === 'production') {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ SW registered:', registration);
                })
                .catch(error => {
                    console.log('❌ SW registration failed:', error);
                });
        });
    }
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        const debouncedSearch = debounce(performSearch, 300);
        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    }
}

function performSearch(query) {
    if (query.length < 2) return;
    
    // Search across speakers, schedule, and topics
    const results = {
        speakers: [],
        sessions: [],
        topics: []
    };
    
    // Implementation would search through loaded data
    console.log('🔍 Searching for:', query);
    
    // Display results in UI
    displaySearchResults(results);
}

function displaySearchResults(results) {
    // Implementation for displaying search results
    console.log('Search results:', results);
}

// Analytics integration (placeholder)
function initializeAnalytics() {
    // Google Analytics, GTM, or other analytics
    console.log('📈 Analytics initialized');
    
    // Track page views
    trackPageView();
    
    // Track interactions
    setupAnalyticsEvents();
}

function trackPageView() {
    // Implementation for page view tracking
    console.log('📊 Page view tracked');
}

function setupAnalyticsEvents() {
    // Track button clicks, form submissions, etc.
    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-track]')) {
            const element = e.target.closest('[data-track]');
            trackEvent('click', element.dataset.track, element.textContent);
        }
    });
}

function trackEvent(action, category, label) {
    console.log('📊 Event tracked:', { action, category, label });
    
    // Implementation for event tracking
    // gtag('event', action, { category, label });
}

// Initialize accessibility features
function initializeAccessibility() {
    // Add ARIA labels where needed
    enhanceAccessibility();
    
    // Setup reduced motion preferences
    setupReducedMotion();
    
    // Setup high contrast mode
    setupHighContrast();
    
    console.log('♿ Accessibility features initialized');
}

function enhanceAccessibility() {
    // Add missing alt texts, ARIA labels, etc.
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach(img => {
        img.alt = 'Imagen del congreso de IA';
    });
    
    // Add landmarks
    const sections = document.querySelectorAll('section:not([role])');
    sections.forEach(section => {
        section.setAttribute('role', 'region');
    });
}

function setupReducedMotion() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('reduced-motion');
    }
}

function setupHighContrast() {
    if (window.matchMedia('(prefers-contrast: high)').matches) {
        document.documentElement.classList.add('high-contrast');
    }
}

// Cache management for better performance
function initializeCaching() {
    // Implement caching strategy for API responses
    if ('caches' in window) {
        // Service worker will handle most caching
        console.log('💾 Caching initialized');
    }
}

// Initialize progressive enhancement features
function initializeProgressiveEnhancement() {
    // Add features that enhance the experience when JS is available
    
    // Lazy loading for images
    if ('IntersectionObserver' in window) {
        setupLazyLoading();
    }
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Setup offline detection
    setupOfflineHandling();
}

function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

function preloadCriticalResources() {
    // Preload critical CSS and JS
    const criticalResources = [
        '/assets/css/critical.css',
        '/data/speakers.json'
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource;
        document.head.appendChild(link);
    });
}

function setupOfflineHandling() {
    window.addEventListener('online', () => {
        showToast('Conexión restablecida', 'success');
        // Sync any pending data
    });
    
    window.addEventListener('offline', () => {
        showToast('Sin conexión a internet', 'warning');
        // Enable offline mode
    });
}

// Initialize development tools
function initializeDevelopmentTools() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Development mode features
        console.log('🔧 Development mode active');
        
        // Add performance monitoring
        monitorPerformance();
        
        // Add debug utilities
        window.debugApp = {
            dataService,
            ticketService,
            showToast,
            trackEvent
        };
        
        console.log('Debug utilities available at window.debugApp');
    }
}

// Final initialization call
function finalizeInitialization() {
    // Initialize additional features
    initializeSearch();
    initializeAnalytics();
    initializeAccessibility();
    initializeCaching();
    initializeProgressiveEnhancement();
    initializeDevelopmentTools();
    
    // Register service worker
    registerServiceWorker();
    
    // Dispatch custom event for initialization complete
    document.dispatchEvent(new CustomEvent('appInitialized', {
        detail: { timestamp: Date.now() }
    }));
    
    console.log('🎉 Aplicación completamente inicializada');
}

// Export functions for external use
window.CongresoIA = {
    showToast,
    trackEvent,
    dataService,
    ticketService
};

// Listen for app initialization complete
document.addEventListener('appInitialized', function(e) {
    console.log('🚀 App ready at:', new Date(e.detail.timestamp));
    
    // Final setup after everything is loaded
    finalizeInitialization();
    
    // Hide loading screen if exists
    const loader = document.querySelector('.loading-screen');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        console.log('📱 Page hidden');
        // Pause animations, stop timers, etc.
    } else {
        console.log('📱 Page visible');
        // Resume animations, refresh data if needed
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    // Cleanup resources, save state, etc.
    console.log('👋 Page unloading');
});