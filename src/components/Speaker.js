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
            <div class="speaker-card" data-speaker-id="${speaker.id}">
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
                    <div class="speaker-country">
                        ${speaker.country}
                    </div>
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

    truncateBio(bio, maxLength = 120) {
        if (!bio || bio.length <= maxLength) return bio || '';
        return bio.substring(0, maxLength).trim() + '...';
    }

    bindEvents() {
        // Event delegation para botones de detalles
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.btn-view-details')) {
                const speakerId = parseInt(e.target.closest('.btn-view-details').dataset.speakerId);
                this.showSpeakerModal(speakerId);
            }

            // Controles del carrusel
            if (e.target.closest('.carousel-prev')) {
                const type = e.target.closest('.carousel-prev').dataset.type;
                this.prevSlide(type);
            }

            if (e.target.closest('.carousel-next')) {
                const type = e.target.closest('.carousel-next').dataset.type;
                this.nextSlide(type);
            }

            // Indicadores del carrusel
            if (e.target.closest('.carousel-indicator')) {
                const indicator = e.target.closest('.carousel-indicator');
                const type = indicator.dataset.type;
                const slideIndex = parseInt(indicator.dataset.slide);
                this.goToSlide(type, slideIndex);
            }
        });

        // Touch/swipe support
        this.setupTouchEvents();

        // Hover effects para pausar autoplay
        this.container.addEventListener('mouseenter', () => {
            this.pauseAutoPlay();
        });

        this.container.addEventListener('mouseleave', () => {
            this.startAutoPlay();
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
            });

            carousel.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                currentX = e.touches[0].clientX;
            });

            carousel.addEventListener('touchend', () => {
                if (!isDragging) return;
                isDragging = false;
                
                const diffX = startX - currentX;
                const threshold = 50;
                
                if (Math.abs(diffX) > threshold) {
                    if (diffX > 0) {
                        this.nextSlide(type);
                    } else {
                        this.prevSlide(type);
                    }
                }
                
                this.startAutoPlay();
            });
        });
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
            
            this.updateCarouselDisplay();
        };

        window.addEventListener('resize', updateSlidesToShow);
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
            });
            
            // Actualizar posición actual
            this.goToSlide(type, this.currentSlides[type]);
            
            // Actualizar indicadores
            this.updateIndicators(type);
        });
    }

    nextSlide(type) {
        const speakers = type === 'international' ? this.internationalSpeakers : this.nationalSpeakers;
        const maxSlides = Math.ceil(speakers.length / this.slidesToShow) - 1;
        
        this.currentSlides[type] = this.currentSlides[type] >= maxSlides ? 0 : this.currentSlides[type] + 1;
        this.updateCarousel(type);
    }

    prevSlide(type) {
        const speakers = type === 'international' ? this.internationalSpeakers : this.nationalSpeakers;
        const maxSlides = Math.ceil(speakers.length / this.slidesToShow) - 1;
        
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

        const translateX = -(this.currentSlides[type] * (100 / this.slidesToShow) * this.slidesToShow);
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
            prevBtn.disabled = this.currentSlides[type] === 0;
            nextBtn.disabled = this.currentSlides[type] === maxSlides;
        }
    }

    startAutoPlay() {
        this.pauseAutoPlay(); // Limpiar cualquier intervalo existente
        
        this.autoPlayInterval = setInterval(() => {
            // Alternar entre carruseles
            const types = ['international', 'national'];
            const randomType = types[Math.floor(Math.random() * types.length)];
            
            // Solo avanzar si hay suficientes speakers
            const speakers = randomType === 'international' ? this.internationalSpeakers : this.nationalSpeakers;
            if (speakers.length > this.slidesToShow) {
                this.nextSlide(randomType);
            }
        }, 5000); // Cambiar cada 5 segundos
    }

    pauseAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    async showSpeakerModal(speakerId) {
        const speaker = await dataService.getSpeakerById(speakerId);
        const sessions = await dataService.getSessionsBySpeaker(speakerId);
        
        if (!speaker) return;

        const modal = this.createModal(speaker, sessions);
        document.body.appendChild(modal);
        
        // Animate modal
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
        window.removeEventListener('resize', this.setupResponsive);
    }
}