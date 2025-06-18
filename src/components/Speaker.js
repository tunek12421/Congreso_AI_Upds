class SpeakerComponent {
    constructor(container) {
        this.container = container;
        this.speakers = [];
        this.internationalSpeakers = [];
        this.nationalSpeakers = [];
        this.currentSlides = {
            international: 0,
            national: 0
        };
        this.slidesToShow = 3; // Por defecto mostrar 3 cards
        this.autoPlayInterval = null;
        this.isMobile = false;
        this.resizeHandler = null;
    }

    async init() {
        try {
            this.speakers = await dataService.getSpeakers();
            this.categorizeSpakers();
            this.render();
            this.bindEvents();
            this.setupResponsive();
            this.startAutoPlay();
        } catch (error) {
            console.error('Error initializing speakers:', error);
            this.renderError();
        }
    }

    categorizeSpakers() {
        // Separar speakers por categoría (internacional vs nacional)
        this.internationalSpeakers = this.speakers.filter(speaker => 
            speaker.country !== 'Bolivia'
        );
        this.nationalSpeakers = this.speakers.filter(speaker => 
            speaker.country === 'Bolivia'
        );
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="speakers-carousels">
                ${this.createCarouselSection('international', 'Ponentes Internacionales', this.internationalSpeakers)}
                ${this.createCarouselSection('national', 'Ponentes Nacionales', this.nationalSpeakers)}
            </div>
        `;
        
        this.applyAnimations();
    }

    createCarouselSection(type, title, speakers) {
        if (!speakers.length) return '';

        const speakersHTML = speakers.map(speaker => this.createSpeakerCard(speaker)).join('');
        
        return `
            <div class="speaker-carousel-section fade-in" data-type="${type}">
                <div class="carousel-header">
                    <h3 class="carousel-title">${title}</h3>
                    <div class="carousel-indicators">
                        ${this.createIndicators(speakers.length, type)}
                    </div>
                </div>
                <div class="carousel-container" data-type="${type}">
                    <button class="carousel-btn carousel-prev" data-type="${type}" aria-label="Anterior">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="carousel-btn carousel-next" data-type="${type}" aria-label="Siguiente">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <div class="carousel-track" data-type="${type}">
                        ${speakersHTML}
                    </div>
                </div>
            </div>
        `;
    }

    createIndicators(totalSlides, type) {
        const totalPages = Math.ceil(totalSlides / this.slidesToShow);
        let indicators = '';
        
        for (let i = 0; i < totalPages; i++) {
            indicators += `<button class="carousel-indicator ${i === 0 ? 'active' : ''}" 
                data-type="${type}" data-slide="${i}" aria-label="Ir a página ${i + 1}"></button>`;
        }
        
        return indicators;
    }

    createSpeakerCard(speaker) {
        const socialLinks = this.createSocialLinks(speaker.social || {});

        return `
            <div class="speaker-card" data-speaker-id="${speaker.id}" role="button" tabindex="0" aria-label="Ver detalles de ${speaker.name}">
                <div class="speaker-avatar">
                    ${speaker.photo ? 
                        `<img src="${speaker.photo}" alt="${speaker.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="avatar-fallback" style="display:none;"><i class="fas fa-user-tie"></i></div>` :
                        `<div class="avatar-fallback"><i class="fas fa-user-tie"></i></div>`
                    }
                    <div class="speaker-country-sash">
                        <div class="sash-content">
                            <span class="flag">${speaker.flag || '🌎'}</span>
                        </div>
                    </div>
                </div>
                <div class="speaker-overlay">
                    <button class="btn-view-details" data-speaker-id="${speaker.id}">
                        <i class="fas fa-info-circle"></i>
                        Ver Detalles
                    </button>
                </div>
                <div class="speaker-info">
                    <h4 class="speaker-name">${speaker.name}</h4>
                    <p class="speaker-title">${speaker.title}</p>
                    <div class="social-links">
                        ${socialLinks}
                    </div>
                </div>
            </div>
        `;
    }

    createSocialLinks(social) {
        const links = [];
        
        if (social.linkedin) {
            links.push(`<a href="${social.linkedin}" target="_blank" class="social-link" aria-label="LinkedIn" onclick="event.stopPropagation();"><i class="fab fa-linkedin"></i></a>`);
        }
        if (social.twitter) {
            links.push(`<a href="https://twitter.com/${social.twitter.replace('@', '')}" target="_blank" class="social-link" aria-label="Twitter" onclick="event.stopPropagation();"><i class="fab fa-twitter"></i></a>`);
        }
        if (social.email) {
            links.push(`<a href="mailto:${social.email}" class="social-link" aria-label="Email" onclick="event.stopPropagation();"><i class="fas fa-envelope"></i></a>`);
        }
        
        return links.join('');
    }

    // Detectar si es dispositivo móvil o táctil
    detectMobileDevice() {
        this.isMobile = window.innerWidth <= 768 || 
                       !window.matchMedia('(hover: hover)').matches || 
                       navigator.maxTouchPoints > 0;
    }

    bindEvents() {
        // Detectar tipo de dispositivo
        this.detectMobileDevice();

        // Event delegation principal
        this.container.addEventListener('click', (e) => {
            // Manejar clicks en botones de detalles (desktop con overlay)
            if (e.target.closest('.btn-view-details')) {
                e.preventDefault();
                e.stopPropagation();
                const speakerId = parseInt(e.target.closest('.btn-view-details').dataset.speakerId);
                this.showSpeakerModal(speakerId);
                return;
            }

            // Manejar controles del carrusel
            if (e.target.closest('.carousel-prev')) {
                e.preventDefault();
                e.stopPropagation();
                const type = e.target.closest('.carousel-prev').dataset.type;
                this.prevSlide(type);
                return;
            }

            if (e.target.closest('.carousel-next')) {
                e.preventDefault();
                e.stopPropagation();
                const type = e.target.closest('.carousel-next').dataset.type;
                this.nextSlide(type);
                return;
            }

            // Manejar indicadores del carrusel
            if (e.target.closest('.carousel-indicator')) {
                e.preventDefault();
                e.stopPropagation();
                const indicator = e.target.closest('.carousel-indicator');
                const type = indicator.dataset.type;
                const slideIndex = parseInt(indicator.dataset.slide);
                this.goToSlide(type, slideIndex);
                return;
            }

            // Manejar clicks en cards (móviles y tablets)
            const clickedCard = e.target.closest('.speaker-card');
            const clickedSocialLink = e.target.closest('.social-link');
            
            if (clickedCard && !clickedSocialLink) {
                // Verificar si es dispositivo móvil/táctil
                if (this.isMobile) {
                    e.preventDefault();
                    const speakerId = parseInt(clickedCard.dataset.speakerId);
                    if (speakerId) {
                        this.showSpeakerModal(speakerId);
                    }
                }
            }
        });

        // Manejar eventos de teclado para accesibilidad
        this.container.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const clickedCard = e.target.closest('.speaker-card');
                if (clickedCard) {
                    e.preventDefault();
                    const speakerId = parseInt(clickedCard.dataset.speakerId);
                    if (speakerId) {
                        this.showSpeakerModal(speakerId);
                    }
                }
            }
        });

        // Touch/swipe support mejorado
        this.setupTouchEvents();

        // Hover effects para pausar autoplay (solo en desktop)
        if (!this.isMobile) {
            this.container.addEventListener('mouseenter', () => {
                this.pauseAutoPlay();
            });

            this.container.addEventListener('mouseleave', () => {
                this.startAutoPlay();
            });
        }

        // Focus management para accesibilidad
        this.container.addEventListener('focusin', () => {
            this.pauseAutoPlay();
        });

        this.container.addEventListener('focusout', () => {
            setTimeout(() => {
                if (!this.container.contains(document.activeElement)) {
                    this.startAutoPlay();
                }
            }, 100);
        });
    }

    setupTouchEvents() {
        const carousels = this.container.querySelectorAll('.carousel-container');
        
        carousels.forEach(carousel => {
            let startX = 0;
            let currentX = 0;
            let startY = 0;
            let currentY = 0;
            let isDragging = false;
            let isVerticalScroll = false;
            const type = carousel.dataset.type;
            const threshold = 50;

            // Prevenir interferencia con scroll vertical
            carousel.addEventListener('touchstart', (e) => {
                if (e.touches.length > 1) return; // Solo un dedo
                
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                isDragging = true;
                isVerticalScroll = false;
                this.pauseAutoPlay();
            }, { passive: true });

            carousel.addEventListener('touchmove', (e) => {
                if (!isDragging || e.touches.length > 1) return;
                
                currentX = e.touches[0].clientX;
                currentY = e.touches[0].clientY;
                
                const diffX = Math.abs(currentX - startX);
                const diffY = Math.abs(currentY - startY);
                
                // Determinar si es scroll vertical
                if (diffY > diffX && !isVerticalScroll) {
                    isVerticalScroll = true;
                    isDragging = false;
                    return;
                }
                
                // Si es swipe horizontal, prevenir scroll
                if (diffX > diffY && diffX > 10) {
                    e.preventDefault();
                }
            }, { passive: false });

            carousel.addEventListener('touchend', (e) => {
                if (!isDragging || isVerticalScroll) {
                    isDragging = false;
                    this.startAutoPlay();
                    return;
                }
                
                isDragging = false;
                
                const diffX = startX - currentX;
                
                if (Math.abs(diffX) > threshold) {
                    if (diffX > 0) {
                        this.nextSlide(type);
                    } else {
                        this.prevSlide(type);
                    }
                }
                
                this.startAutoPlay();
            }, { passive: true });

            // Cancelar en caso de cancelación del touch
            carousel.addEventListener('touchcancel', () => {
                isDragging = false;
                isVerticalScroll = false;
                this.startAutoPlay();
            }, { passive: true });
        });
    }

    setupResponsive() {
        const updateSlidesToShow = () => {
            const width = window.innerWidth;
            const oldSlidesToShow = this.slidesToShow;
            
            // Detectar tipo de dispositivo en cada resize
            this.detectMobileDevice();
            
            if (width <= 480) {
                this.slidesToShow = 1;
            } else if (width <= 768) {
                this.slidesToShow = 1;
            } else if (width <= 1024) {
                this.slidesToShow = 2;
            } else if (width <= 1440) {
                this.slidesToShow = 3;
            } else {
                this.slidesToShow = Math.min(4, Math.max(this.internationalSpeakers.length, this.nationalSpeakers.length));
            }
            
            // Solo actualizar si cambió el número de slides
            if (oldSlidesToShow !== this.slidesToShow) {
                this.updateCarouselDisplay();
            }
        };

        // Debounce para mejorar performance
        let resizeTimer;
        this.resizeHandler = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(updateSlidesToShow, 150);
        };

        window.addEventListener('resize', this.resizeHandler);
        updateSlidesToShow();
    }

    updateCarouselDisplay() {
        const tracks = this.container.querySelectorAll('.carousel-track');
        
        tracks.forEach(track => {
            const type = track.dataset.type;
            const cards = track.querySelectorAll('.speaker-card');
            
            // Actualizar ancho de las cards
            cards.forEach(card => {
                card.style.minWidth = `${100 / this.slidesToShow}%`;
                card.style.width = `${100 / this.slidesToShow}%`;
            });
            
            // Resetear posición si es necesario
            const speakers = type === 'international' ? this.internationalSpeakers : this.nationalSpeakers;
            const maxSlides = Math.ceil(speakers.length / this.slidesToShow) - 1;
            
            if (this.currentSlides[type] > maxSlides) {
                this.currentSlides[type] = maxSlides;
            }
            
            // Actualizar posición actual
            this.updateCarousel(type);
            
            // Actualizar indicadores
            this.updateIndicatorsDisplay(type);
        });
    }

    updateIndicatorsDisplay(type) {
        const speakers = type === 'international' ? this.internationalSpeakers : this.nationalSpeakers;
        const totalPages = Math.ceil(speakers.length / this.slidesToShow);
        const indicatorsContainer = this.container.querySelector(`.carousel-indicators`);
        const existingIndicators = this.container.querySelectorAll(`.carousel-indicator[data-type="${type}"]`);
        
        if (existingIndicators.length !== totalPages) {
            // Recrear indicadores si el número cambió
            const newIndicators = this.createIndicators(speakers.length, type);
            // Encontrar el contenedor específico y actualizar
            const headerElement = this.container.querySelector(`[data-type="${type}"]`).parentElement.querySelector('.carousel-header .carousel-indicators');
            if (headerElement) {
                headerElement.innerHTML = newIndicators;
            }
        }
        
        this.updateIndicators(type);
    }

    nextSlide(type) {
        const speakers = type === 'international' ? this.internationalSpeakers : this.nationalSpeakers;
        const maxSlides = Math.ceil(speakers.length / this.slidesToShow) - 1;
        
        if (speakers.length <= this.slidesToShow) return; // No hay suficientes cards para navegar
        
        this.currentSlides[type] = this.currentSlides[type] >= maxSlides ? 0 : this.currentSlides[type] + 1;
        this.updateCarousel(type);
    }

    prevSlide(type) {
        const speakers = type === 'international' ? this.internationalSpeakers : this.nationalSpeakers;
        const maxSlides = Math.ceil(speakers.length / this.slidesToShow) - 1;
        
        if (speakers.length <= this.slidesToShow) return; // No hay suficientes cards para navegar
        
        this.currentSlides[type] = this.currentSlides[type] <= 0 ? maxSlides : this.currentSlides[type] - 1;
        this.updateCarousel(type);
    }

    goToSlide(type, slideIndex) {
        const speakers = type === 'international' ? this.internationalSpeakers : this.nationalSpeakers;
        const maxSlides = Math.ceil(speakers.length / this.slidesToShow) - 1;
        
        this.currentSlides[type] = Math.max(0, Math.min(slideIndex, maxSlides));
        this.updateCarousel(type);
    }

    updateCarousel(type) {
        const track = this.container.querySelector(`.carousel-track[data-type="${type}"]`);
        if (!track) return;

        const translateX = -(this.currentSlides[type] * 100);
        track.style.transform = `translateX(${translateX}%)`;
        
        this.updateIndicators(type);
        this.updateControls(type);
    }

    updateIndicators(type) {
        const indicators = this.container.querySelectorAll(`.carousel-indicator[data-type="${type}"]`);
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlides[type]);
        });
    }

    updateControls(type) {
        const speakers = type === 'international' ? this.internationalSpeakers : this.nationalSpeakers;
        const maxSlides = Math.ceil(speakers.length / this.slidesToShow) - 1;
        
        const prevBtn = this.container.querySelector(`.carousel-prev[data-type="${type}"]`);
        const nextBtn = this.container.querySelector(`.carousel-next[data-type="${type}"]`);
        
        if (prevBtn && nextBtn) {
            const hasEnoughSlides = speakers.length > this.slidesToShow;
            
            if (!hasEnoughSlides) {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
                prevBtn.disabled = this.currentSlides[type] === 0;
                nextBtn.disabled = this.currentSlides[type] === maxSlides;
            }
        }
    }

    startAutoPlay() {
        if (this.isMobile) return; // No autoplay en móviles para mejor UX
        
        this.pauseAutoPlay(); // Limpiar cualquier intervalo existente
        
        this.autoPlayInterval = setInterval(() => {
            // Alternar entre carruseles
            const types = ['international', 'national'].filter(type => {
                const speakers = type === 'international' ? this.internationalSpeakers : this.nationalSpeakers;
                return speakers.length > this.slidesToShow;
            });
            
            if (types.length === 0) return;
            
            const randomType = types[Math.floor(Math.random() * types.length)];
            this.nextSlide(randomType);
        }, 6000); // Cambiar cada 6 segundos
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    async showSpeakerModal(speakerId) {
        try {
            const speaker = await dataService.getSpeakerById(speakerId);
            const sessions = await dataService.getSessionsBySpeaker(speakerId);
            
            if (!speaker) {
                console.error('Speaker not found:', speakerId);
                return;
            }

            const modal = this.createModal(speaker, sessions);
            document.body.appendChild(modal);
            
            // Prevenir scroll del body
            document.body.style.overflow = 'hidden';
            
            // Animate modal
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);

            this.bindModalEvents(modal);
        } catch (error) {
            console.error('Error showing speaker modal:', error);
        }
    }

    createModal(speaker, sessions) {
        const sessionsHTML = sessions.map(session => `
            <div class="session-item">
                <div class="session-time">${session.time}</div>
                <div class="session-title">${session.title}</div>
                <div class="session-location">${session.location}</div>
            </div>
        `).join('');

        const modal = document.createElement('div');
        modal.className = 'speaker-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="Cerrar modal">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-header">
                    <div class="speaker-avatar-large">
                        ${speaker.photo ? 
                            `<img src="${speaker.photo}" alt="${speaker.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                             <div class="avatar-fallback" style="display:none;"><i class="fas fa-user-tie"></i></div>` :
                            `<div class="avatar-fallback"><i class="fas fa-user-tie"></i></div>`
                        }
                    </div>
                    <div class="speaker-details">
                        <h2>${speaker.name}</h2>
                        <p class="speaker-title">${speaker.title}</p>
                        <div class="speaker-flag">
                            <span class="flag">${speaker.flag || '🌎'}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-body">
                    ${speaker.bio ? `
                        <div class="speaker-bio-full">
                            <h3>Biografía</h3>
                            <p>${speaker.bio}</p>
                        </div>
                    ` : ''}
                    ${speaker.expertise && speaker.expertise.length ? `
                        <div class="speaker-expertise">
                            <h3>Áreas de Expertise</h3>
                            <div class="expertise-tags">
                                ${speaker.expertise.map(skill => `<span class="expertise-tag">${skill}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${sessions.length > 0 ? `
                        <div class="speaker-sessions">
                            <h3>Participación en el Evento</h3>
                            <div class="sessions-list">
                                ${sessionsHTML}
                            </div>
                        </div>
                    ` : ''}
                    ${speaker.social && Object.keys(speaker.social).length > 0 ? `
                        <div class="speaker-social">
                            <h3>Contacto</h3>
                            <div class="social-links">
                                ${this.createSocialLinks(speaker.social)}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        return modal;
    }

    bindModalEvents(modal) {
        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restaurar scroll del body
            setTimeout(() => {
                if (modal.parentElement) {
                    document.body.removeChild(modal);
                }
            }, 300);
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        
        // Close on Escape
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);

        // Trap focus in modal
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        // Focus en el botón de cerrar
        if (firstFocusable) {
            firstFocusable.focus();
        }

        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    applyAnimations() {
        const sections = this.container.querySelectorAll('.speaker-carousel-section');
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.2}s`;
        });
    }

    renderError() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar ponentes</h3>
                <p>No se pudieron cargar los datos de los ponentes. Por favor, intenta recargar la página.</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-refresh"></i>
                    Recargar
                </button>
            </div>
        `;
    }

    // Cleanup method
    destroy() {
        this.pauseAutoPlay();
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        
        // Limpiar event listeners
        if (this.container) {
            this.container.removeEventListener('click', this.bindEvents);
            this.container.removeEventListener('keydown', this.bindEvents);
        }
    }
}