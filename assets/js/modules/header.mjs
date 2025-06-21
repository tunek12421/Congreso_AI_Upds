import { cssVariable } from "./common.mjs";

const header = document.querySelector('header');
const logo = document.querySelector('header .logo img');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

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
    const isOpen = navLinks.classList.contains('mobile-open');
    const icon = mobileMenuBtn.querySelector('i');
    
    if (isOpen) {
        navLinks.classList.remove('show');
        setTimeout(() => {
            navLinks.classList.remove('mobile-open');
        }, 300);
        
        if (icon) {
            icon.className = 'fas fa-bars';
        }
    } else {
        navLinks.classList.add('mobile-open');
        setTimeout(() => {
            navLinks.classList.add('show');
        }, 10);
        
        if (icon) {
            icon.className = 'fas fa-times';
        }
    }
}

const closeMobileMenuOnLinkClick = (e) => {
    if (e.target.tagName === 'A' && navLinks.classList.contains('mobile-open')) {
        toggleMobileMenu();
    }
}

const closeMobileMenuOnOutsideClick = (e) => {
    if (navLinks.classList.contains('mobile-open') &&
        !navLinks.contains(e.target) &&
        !mobileMenuBtn.contains(e.target)) {
        toggleMobileMenu();
    }
}

const closeMobileMenuOnEscape = (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
        toggleMobileMenu();
    }
}

async function init(){
    window.addEventListener('scroll', updateHeader);
    updateHeader();
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    if (navLinks) {
        navLinks.addEventListener('click', closeMobileMenuOnLinkClick);
    }
    
    document.addEventListener('click', closeMobileMenuOnOutsideClick);
    document.addEventListener('keydown', closeMobileMenuOnEscape);
    
    window.addEventListener('resize', () => {
        if (window.innerWidth > 850 && navLinks.classList.contains('mobile-open')) {
            navLinks.classList.remove('mobile-open', 'show');
            const icon = mobileMenuBtn.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars';
            }
        }
    });
}

export {init};