import { cssVariable } from "./common.mjs";

// Variables globales
let header, logo, mobileMenuBtn, navLinks;
let state = false;

const updateHeader = () => {
    if((window.scrollY > 10) != state){
        state = (window.scrollY > 10);
        if (state) {
            header.classList.add("header-color");
            logo.src = 'assets/images/logos/UPDS5.png';
        } else {
            header.classList.remove("header-color")
            logo.src = 'assets/images/logos/CiiA1.png';
        }
    }
}
const toggleMobileMenu = () => {
    if (!navLinks || !mobileMenuBtn) {
        return;
    }
    
    const isOpen = navLinks.classList.contains('mobile-open');
    const icon = mobileMenuBtn.querySelector('i');

    navLinks.classList.toggle('mobile-open');
    
    if(icon){
        if (isOpen) icon.className = 'fas fa-bars';
        else icon.className = 'fas fa-times';
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