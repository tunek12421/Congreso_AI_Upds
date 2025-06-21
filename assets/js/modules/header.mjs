import { cssVariable } from "./common.mjs";

// Variables globales
let header, logo, mobileMenuBtn, navLinks;
let state = false;

const updateHeader = () => {
    if((window.scrollY > 10) != state){
        state = (window.scrollY > 10);
        if (state) {
            header.style.background = cssVariable("primary-blue");
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
            
            if (logo) {
                logo.src = '/assets/images/logos/UPDS5.png';
            }
        } else {
            header.style.background = 'rgba(0, 0, 0, 0.0)';
            header.style.boxShadow = 'none';
            
            if (logo) {
                logo.src = '/assets/images/logos/CiiA1.png';
            }
        }
    }
}

const toggleMobileMenu = () => {
    if (!navLinks || !mobileMenuBtn) {
        return;
    }
    
    const isOpen = navLinks.classList.contains('mobile-open');
    const icon = mobileMenuBtn.querySelector('i');
    
    if (isOpen) {
        navLinks.classList.remove('mobile-open');
        if (icon) {
            icon.className = 'fas fa-bars';
        }
    } else {
        navLinks.classList.add('mobile-open');
        if (icon) {
            icon.className = 'fas fa-times';
        }
    }
}

const closeMobileMenuOnLinkClick = (e) => {
    if (e.target.tagName === 'A' && navLinks && navLinks.classList.contains('mobile-open')) {
        toggleMobileMenu();
    }
}

const closeMobileMenuOnOutsideClick = (e) => {
    if (navLinks && navLinks.classList.contains('mobile-open') &&
        !navLinks.contains(e.target) &&
        !mobileMenuBtn.contains(e.target)) {
        toggleMobileMenu();
    }
}

const closeMobileMenuOnEscape = (e) => {
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('mobile-open')) {
        toggleMobileMenu();
    }
}

async function init(){
    // Esperar a que el DOM esté listo
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Asignar variables globales
    header = document.querySelector('header');
    logo = document.querySelector('header .logo img');
    mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    navLinks = document.querySelector('.nav-links');
    
    // Reset inicial del menú móvil
    if (navLinks) {
        navLinks.classList.remove('mobile-open', 'show', 'active');
        navLinks.removeAttribute('style');
        navLinks.className = 'nav-links';
    }
    
    // Scroll header functionality
    window.addEventListener('scroll', updateHeader);
    updateHeader();
    
    // Mobile menu functionality
    if (mobileMenuBtn) {
        mobileMenuBtn.removeEventListener('click', toggleMobileMenu);
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-bars';
        }
    }
    
    if (navLinks) {
        navLinks.addEventListener('click', closeMobileMenuOnLinkClick);
    }
    
    document.addEventListener('click', closeMobileMenuOnOutsideClick);
    document.addEventListener('keydown', closeMobileMenuOnEscape);
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 850 && navLinks && navLinks.classList.contains('mobile-open')) {
            navLinks.classList.remove('mobile-open');
            const icon = mobileMenuBtn?.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
            }
        }
    });
}

export {init};