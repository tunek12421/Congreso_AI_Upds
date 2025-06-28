class SpeakerComponent {
    constructor(container) {
        this.container = container;
        this.speakers = [];
        this.internationalSpeakers = [];
        this.nationalSpeakers = [];
        this.slidesToShow = 3;
        this.autoPlayInterval = null;
        this.resumeTimeout = null; //  PARA CONTROLAR RESUME PENDIENTES
        
        //  SISTEMA INFINITO VERDADERO
        this.currentPosition = {
            international: 0,
            national: 0
        };
        this.originalSpeakersCount = {
            international: 0,
            national: 0
        };
        
        //  CONFIGURACIÓN DE TIMING ULTRA-PAUSADO
        this.DURATION_BASE = {
            AUTO: 2000,     // Muy contemplativo
            MANUAL: 1200,   // Pausado y controlado
            TOUCH: 900,     // Suave y predecible
            SNAP: 700,      // Snap pausado
            PREVIEW: 400    // Preview suave
        };
        
        // 🎯 EASING ULTRA-SUAVE
        this.EASING_CURVES = {
            AUTO: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
            MANUAL: 'cubic-bezier(0.4, 0, 0.2, 1)',
            TOUCH: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            SNAP: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
            PREVIEW: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
        };
        
        //  CONTROL DE MOVIMIENTO
        this.isTransitioning = false;
        this.lastInteractionType = 'AUTO';
        this.lastMoveDistance = 1;
    }

    async init() {
        try {
            this.speakers = await dataService.getSpeakers();
            this.categorizeSpakers();
            this.render();
            this.bindEvents();
            this.setupResponsive();
        } catch (error) {
            console.error('Error initializing speakers:', error);
            this.renderError();
        }
    }

    categorizeSpakers() {
        this.internationalSpeakers = this.speakers.filter(speaker => 
            speaker.country !== 'Bolivia'
        );
        this.nationalSpeakers = this.speakers.filter(speaker => 
            speaker.country === 'Bolivia'
        );
        
        this.originalSpeakersCount.international = this.internationalSpeakers.length;
        this.originalSpeakersCount.national = this.nationalSpeakers.length;
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
        this.initializeCarousels();
        
        setTimeout(() => {
            this.startAutoPlay();
        }, 1500);
    }

    createCarouselSection(type, title, speakers) {
        if (!speakers.length) return '';

        //  CREAR SECUENCIA INFINITA - 7 COPIAS PARA MÁXIMA FLUIDEZ
        const infiniteSequence = [];
        for (let i = 0; i < 7; i++) {
            infiniteSequence.push(...speakers.map((speaker, index) => ({
                ...speaker,
                uniqueId: `${speaker.id}-copy${i}-${index}`
            })));
        }
        
        const speakersHTML = infiniteSequence.map(speaker => this.createSpeakerCard(speaker)).join('');
        
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
            <div class="speaker-card" data-speaker-id="${speaker.id}" data-unique-id="${speaker.uniqueId || speaker.id}">
                <div class="speaker-avatar">
                    ${speaker.photo ? 
                        `<img src="${speaker.photo}" alt="${speaker.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="avatar-fallback" style="display:none;"><i class="fas fa-user-tie"></i></div>` :
                        `<div class="avatar-fallback"><i class="fas fa-user-tie"></i></div>`
                    }
                </div>
                <div class="speaker-overlay">
                    <button class="btn-view-details" data-speaker-id="${speaker.id}">
                        <i class="fas fa-info-circle"></i>
                        Ver Detalles
                    </button>
                </div>
                <div class="speaker-info">
                    <div class="speaker-name-row">
                        <h4 class="speaker-name">${speaker.name}</h4>
                        <span class="speaker-flag">${speaker.flag || '🌎'}</span>
                    </div>
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
            links.push(`<a href="${social.linkedin}" target="_blank" class="social-link" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>`);
        }
        if (social.twitter) {
            links.push(`<a href="https://twitter.com/${social.twitter.replace('@', '')}" target="_blank" class="social-link" aria-label="Twitter"><i class="fab fa-twitter"></i></a>`);
        }
        if (social.email) {
            links.push(`<a href="mailto:${social.email}" class="social-link" aria-label="Email"><i class="fas fa-envelope"></i></a>`);
        }
        
        return links.join('');
    }

    //  INICIALIZACIÓN DE CARRUSELES INFINITOS
    initializeCarousels() {
        const tracks = this.container.querySelectorAll('.carousel-track');
        
        tracks.forEach(track => {
            const type = track.dataset.type;
            const cards = track.querySelectorAll('.speaker-card');
            const originalCount = this.originalSpeakersCount[type];
            
            // Configurar tamaño de cards
            cards.forEach(card => {
                card.style.minWidth = `${100 / this.slidesToShow}%`;
                card.style.flexShrink = '0';
            });
            
            //  POSICIÓN INICIAL EN EL CENTRO (COPIA 3 DE 7)
            const centerCopy = 3;
            this.currentPosition[type] = centerCopy * originalCount;
            
            // Posicionar sin transición
            const initialPosition = -(this.currentPosition[type] * (100 / this.slidesToShow));
            track.style.transition = 'none';
            track.style.transform = `translate3d(${initialPosition}%, 0, 0)`;
            
            // Restaurar transición después de un frame
            requestAnimationFrame(() => {
                track.style.transition = `transform ${this.DURATION_BASE.AUTO}ms ${this.EASING_CURVES.AUTO}`;
            });
        });
        
        this.updateAllIndicators();
    }

    bindEvents() {
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.btn-view-details')) {
                const speakerId = parseInt(e.target.closest('.btn-view-details').dataset.speakerId);
                this.showSpeakerModal(speakerId);
            }

            if (e.target.closest('.carousel-prev')) {
                const type = e.target.closest('.carousel-prev').dataset.type;
                this.manualSlide(type, 'prev');
            }

            if (e.target.closest('.carousel-next')) {
                const type = e.target.closest('.carousel-next').dataset.type;
                this.manualSlide(type, 'next');
            }

            if (e.target.closest('.carousel-indicator')) {
                const indicator = e.target.closest('.carousel-indicator');
                const type = indicator.dataset.type;
                const slideIndex = parseInt(indicator.dataset.slide);
                this.goToSlide(type, slideIndex);
            }
        });

        this.setupTouchEvents();
        this.setupHoverEvents();
    }

    setupHoverEvents() {
        //  HOVER EN CONTENEDOR PRINCIPAL - PAUSAR AUTOPLAY
        this.container.addEventListener('mouseenter', () => {
            this.pauseAutoPlay();
        });

        this.container.addEventListener('mouseleave', () => {
            // VERIFICAR QUE NO HAY MODAL ABIERTO ANTES DE REANUDAR
            if (!document.querySelector('.speaker-modal.active')) {
                setTimeout(() => {
                    this.startAutoPlay();
                }, 500);
            }
        });
    }

    setupTouchEvents() {
        const carousels = this.container.querySelectorAll('.carousel-container');
        
        carousels.forEach(carousel => {
            let startX = 0;
            let currentX = 0;
            let isDragging = false;
            const type = carousel.dataset.type;

            carousel.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
                this.pauseAutoPlay();
                this.lastInteractionType = 'TOUCH';
            });

            carousel.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                currentX = e.touches[0].clientX;
                e.preventDefault();
            });

            carousel.addEventListener('touchend', () => {
                if (!isDragging) return;
                isDragging = false;
                
                const diffX = startX - currentX;
                const threshold = 60;
                
                if (Math.abs(diffX) > threshold) {
                    if (diffX > 0) {
                        this.manualSlide(type, 'next');
                    } else {
                        this.manualSlide(type, 'prev');
                    }
                } else {
                    this.scheduleAutoPlayResume(1000);
                }
            });
        });
    }

    manualSlide(type, direction) {
        this.pauseAutoPlay();
        this.lastInteractionType = 'MANUAL';
        
        if (direction === 'next') {
            this.nextSlide(type);
        } else {
            this.prevSlide(type);
        }
        
        this.scheduleAutoPlayResume(3000);
    }

    nextSlide(type) {
        this.currentPosition[type]++;
        this.updateCarousel(type);
    }

    prevSlide(type) {
        this.currentPosition[type]--;
        this.updateCarousel(type);
    }

    //  ACTUALIZACIÓN DEL CARRUSEL CON REPOSICIONAMIENTO INVISIBLE
    updateCarousel(type) {
        const track = this.container.querySelector(`.carousel-track[data-type="${type}"]`);
        if (!track) return;

        const originalCount = this.originalSpeakersCount[type];
        const translateX = -(this.currentPosition[type] * (100 / this.slidesToShow));
        
        // Aplicar transición
        const duration = this.getDuration(this.lastInteractionType);
        const easing = this.EASING_CURVES[this.lastInteractionType];
        
        track.style.transition = `transform ${duration}ms ${easing}`;
        track.style.transform = `translate3d(${translateX}%, 0, 0)`;
        
        //  REPOSICIONAMIENTO INVISIBLE DESPUÉS DE LA TRANSICIÓN
        setTimeout(() => {
            this.checkInfinitePosition(type, track, originalCount);
        }, duration);
        
        this.updateIndicators(type);
    }

    //  VERIFICAR Y REPOSICIONAR PARA INFINITO VERDADERO
    checkInfinitePosition(type, track, originalCount) {
        const currentPos = this.currentPosition[type];
        const centerCopy = 3; // Copia central de las 7
        const buffer = originalCount; // Una copia completa de buffer
        
        let needsReposition = false;
        let newPosition = currentPos;
        
        // Si se acerca al inicio (copia 1), saltar a copia 5
        if (currentPos <= originalCount) {
            newPosition = (centerCopy + 2) * originalCount + (currentPos % originalCount);
            needsReposition = true;
        }
        // Si se acerca al final (copia 6), saltar a copia 2  
        else if (currentPos >= 6 * originalCount) {
            newPosition = (centerCopy - 2) * originalCount + (currentPos % originalCount);
            needsReposition = true;
        }
        
        if (needsReposition) {
            this.currentPosition[type] = newPosition;
            const newTranslateX = -(newPosition * (100 / this.slidesToShow));
            
            // Reposicionamiento instantáneo e invisible
            track.style.transition = 'none';
            track.style.transform = `translate3d(${newTranslateX}%, 0, 0)`;
            
            // Restaurar transición en el siguiente frame
            requestAnimationFrame(() => {
                track.style.transition = `transform ${this.DURATION_BASE.AUTO}ms ${this.EASING_CURVES.AUTO}`;
            });
        }
    }

    getDuration(interactionType) {
        const baseDuration = this.DURATION_BASE[interactionType];
        const responsiveFactor = window.innerWidth <= 768 ? 0.8 : 1;
        return Math.round(baseDuration * responsiveFactor);
    }

    goToSlide(type, slideIndex) {
        this.lastInteractionType = 'MANUAL';
        
        const originalCount = this.originalSpeakersCount[type];
        const currentRealPos = this.currentPosition[type] % originalCount;
        const targetPos = slideIndex * this.slidesToShow;
        
        // Calcular ruta más corta
        let diff = targetPos - currentRealPos;
        if (diff > originalCount / 2) diff -= originalCount;
        if (diff < -originalCount / 2) diff += originalCount;
        
        this.currentPosition[type] += diff;
        this.updateCarousel(type);
    }

    updateIndicators(type) {
        const indicators = this.container.querySelectorAll(`.carousel-indicator[data-type="${type}"]`);
        const originalCount = this.originalSpeakersCount[type];
        const realPosition = this.currentPosition[type] % originalCount;
        const currentPage = Math.floor(realPosition / this.slidesToShow);
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentPage);
        });
    }

    updateAllIndicators() {
        this.updateIndicators('international');
        this.updateIndicators('national');
    }

    setupResponsive() {
        const updateSlidesToShow = () => {
            const width = window.innerWidth;
            
            if (width <= 768) {
                this.slidesToShow = 1;
            } else if (width <= 1024) {
                this.slidesToShow = 2;
            } else {
                this.slidesToShow = 3;
            }
            
            this.initializeCarousels();
        };

        window.addEventListener('resize', updateSlidesToShow);
        updateSlidesToShow();
    }

    //  AUTOPLAY SINCRONIZADO
    startAutoPlay() {
        this.pauseAutoPlay();
        
        const hasInternational = this.internationalSpeakers.length > 0;
        const hasNational = this.nationalSpeakers.length > 0;
        
        if (!hasInternational && !hasNational) return;
        
        const autoInterval = this.getDuration('AUTO') + 4000; // Pausa larga
        
        this.autoPlayInterval = setInterval(() => {
            if (this.isTransitioning) return;
            
            this.lastInteractionType = 'AUTO';
            this.executeSynchronizedMovement();
        }, autoInterval);
    }

    executeSynchronizedMovement() {
        const hasInternational = this.internationalSpeakers.length > 0;
        const hasNational = this.nationalSpeakers.length > 0;
        
        this.isTransitioning = true;
        
        if (hasInternational && hasNational) {
            this.nextSlide('international');
            this.prevSlide('national');
        } else if (hasInternational) {
            this.nextSlide('international');
        } else if (hasNational) {
            this.nextSlide('national');
        }
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, this.getDuration('AUTO') + 100);
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
        
        //  TAMBIÉN CANCELAR CUALQUIER RESUME PENDIENTE
        if (this.resumeTimeout) {
            clearTimeout(this.resumeTimeout);
            this.resumeTimeout = null;
        }
        
        this.isTransitioning = false;
    }

    scheduleAutoPlayResume(delay = 3000) {
        //  LIMPIAR CUALQUIER RESUME PENDIENTE
        if (this.resumeTimeout) {
            clearTimeout(this.resumeTimeout);
        }
        
        this.resumeTimeout = setTimeout(() => {
            //  VERIFICAR QUE NO HAY MODAL ABIERTO ANTES DE REANUDAR
            if (!document.querySelector('.speaker-modal.active')) {
                this.startAutoPlay();
            }
            this.resumeTimeout = null;
        }, delay);
    }

    async showSpeakerModal(speakerId) {
        //  PAUSAR AUTOPLAY TEMPORALMENTE AL ABRIR MODAL
        this.pauseAutoPlay();
        
        const speaker = await dataService.getSpeakerById(speakerId);
        const sessions = await dataService.getSessionsBySpeaker(speakerId);
        
        if (!speaker) {
            // Si hay error, reanudar autoplay
            this.scheduleAutoPlayResume(1000);
            return;
        }

        const modal = this.createModal(speaker, sessions);
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        this.bindModalEvents(modal);
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
                            `<img src="${speaker.photo}" alt="${speaker.name}">` :
                            `<i class="fas fa-user-tie"></i>`
                        }
                    </div>
                    <div class="speaker-details">
                        <h2>${speaker.name}</h2>
                        <p class="speaker-title">${speaker.title}</p>
                        <div class="speaker-country">
                            <span class="flag">${speaker.flag || '🌎'}</span>
                            ${speaker.country}
                        </div>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="speaker-bio-full">
                        <h3>Biografía</h3>
                        <p>${speaker.bio}</p>
                    </div>
                    <div class="speaker-expertise">
                        <h3>Áreas de Expertise</h3>
                        <div class="expertise-tags">
                            ${speaker.expertise.map(skill => `<span class="expertise-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                    ${sessions.length > 0 ? `
                        <div class="speaker-sessions">
                            <h3>Participación en el Evento</h3>
                            <div class="sessions-list">
                                ${sessionsHTML}
                            </div>
                        </div>
                    ` : ''}
                    <div class="speaker-social">
                        <h3>Contacto</h3>
                        <div class="social-links">
                            ${this.createSocialLinks(speaker.social || {})}
                        </div>
                    </div>
                </div>
            </div>
        `;

        return modal;
    }

    bindModalEvents(modal) {
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => {
                if (modal.parentElement) {
                    document.body.removeChild(modal);
                }
                //  REANUDAR AUTOPLAY DESPUÉS DE CERRAR MODAL
                this.scheduleAutoPlayResume(1000); // 1 segundo de gracia antes de reanudar
            }, 300);
        };

        // Cerrar con botón X
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        
        // Cerrar con click en overlay
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        
        // Cerrar con tecla Escape
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);
        
        //  LIMPIAR EVENT LISTENER SI EL MODAL SE ELIMINA DE OTRA FORMA
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && !document.body.contains(modal)) {
                    document.removeEventListener('keydown', handleKeydown);
                    observer.disconnect();
                    // Reanudar autoplay por seguridad
                    this.scheduleAutoPlayResume(500);
                }
            });
        });
        observer.observe(document.body, { childList: true });
    }

    applyAnimations() {
        const sections = this.container.querySelectorAll('.speaker-carousel-section');
        sections.forEach((section, index) => {
            section.style.animationDelay = `${index * 0.2}s`;
            setTimeout(() => {
                section.classList.add('visible');
            }, index * 200 + 100);
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

    destroy() {
        this.pauseAutoPlay();
        
        //  LIMPIAR TODOS LOS TIMEOUTS
        if (this.resumeTimeout) {
            clearTimeout(this.resumeTimeout);
            this.resumeTimeout = null;
        }
        
        window.removeEventListener('resize', this.setupResponsive);
    }
}