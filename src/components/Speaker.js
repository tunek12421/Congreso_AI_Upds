class SpeakerComponent {
    constructor(container) {
        this.container = container;
        this.speakers = [];
        this.internationalSpeakers = [];
        this.nationalSpeakers = [];
        this.slidesToShow = window.innerWidth <= 768 ? 1 : 2; // RESPONSIVE: 1 en móvil, 2 en desktop
        this.autoPlayInterval = null;
        this.resumeTimeout = null;
        
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
            this.categorizeSpeakers();
            this.render();
            this.bindEvents();
            this.setupResponsive();
        } catch (error) {
            console.error('Error initializing speakers:', error);
            this.renderError();
        }
    }

    categorizeSpeakers() {
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
            this.ensureCarouselsSync(); // Verificar sincronización
            this.startAutoPlay();
        }, 1500);
    }

    createCarouselSection(type, title, speakers) {
        if (!speakers.length) return '';

        //  CREAR SECUENCIA INFINITA - 5 COPIAS PARA MÁXIMA FLUIDEZ (reducido para mejor control)
        const infiniteSequence = [];
        for (let i = 0; i < 5; i++) {
            infiniteSequence.push(...speakers.map((speaker, index) => ({
                ...speaker,
                uniqueId: `${speaker.id}-copy${i}-${index}`,
                originalId: speaker.id
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
                <div class="carousel-card">
                    <button class="carousel-btn carousel-prev" data-type="${type}" aria-label="Anterior">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="carousel-btn carousel-next" data-type="${type}" aria-label="Siguiente">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <div class="carousel-container" data-type="${type}">
                        <div class="carousel-track" data-type="${type}">
                            ${speakersHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createIndicators(totalSlides, type) {
        // Calcular páginas según slidesToShow (responsive)
        const isMobile = window.innerWidth <= 768;
        const slidesToShow = isMobile ? 1 : 2;
        const totalPages = Math.ceil(totalSlides / slidesToShow);
        let indicators = '';
        
        for (let i = 0; i < totalPages; i++) {
            indicators += `<button class="carousel-indicator ${i === 0 ? 'active' : ''}" 
                data-type="${type}" data-slide="${i}" aria-label="Ir a página ${i + 1}"></button>`;
        }
        
        return indicators;
    }

    createTopicHTML(topic) {
        if (!topic) return '';
        
        // Si el topic contiene comas, convertirlo en lista de puntos
        if (topic.includes(',')) {
            const topics = topic.split(',').map(t => t.trim()).filter(t => t.length > 0);
            const topicsList = topics.map(t => `<li>• ${t}</li>`).join('');
            return `<div class="speaker-topic-list"><strong>Temas:</strong><ul style="margin: 0.2rem 0; padding-left: 1rem; list-style: none;">${topicsList}</ul></div>`;
        } else {
            // Si es un solo tema, mostrarlo normal
            return `<p class="speaker-topic"><strong>Tema:</strong> ${topic}</p>`;
        }
    }

    createTopicHTMLForModal(topic) {
        if (!topic) return '';
        
        // Si el topic contiene comas, convertirlo en lista de puntos
        if (topic.includes(',')) {
            const topics = topic.split(',').map(t => t.trim()).filter(t => t.length > 0);
            const topicsList = topics.map(t => `<li>${t}</li>`).join('');
            return `<ul style="list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0;">${topicsList}</ul>`;
        } else {
            // Si es un solo tema, mostrarlo normal
            return `<p>${topic}</p>`;
        }
    }

    createSpeakerCard(speaker) {
        const socialLinks = this.createSocialLinks(speaker.social || {});
        const isMobile = window.innerWidth <= 768;
        const speakerId = speaker.originalId || speaker.id; // Usar originalId si está disponible
        const cardTitle = isMobile ? `title="Toca para ver detalles de ${speaker.name}"` : '';

        return `
            <div class="speaker-card" data-speaker-id="${speakerId}" data-unique-id="${speaker.uniqueId || speaker.id}" ${cardTitle}>
                <div class="speaker-avatar">
                    ${speaker.photo ? 
                        `<img src="${speaker.photo}" alt="${speaker.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="avatar-fallback" style="display:none;"><i class="fas fa-user-tie"></i></div>` :
                        `<div class="avatar-fallback"><i class="fas fa-user-tie"></i></div>`
                    }
                </div>
                <div class="speaker-overlay">
                    <button class="btn-view-details" data-speaker-id="${speakerId}">
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
                    ${speaker.topic ? this.createTopicHTML(speaker.topic) : ''}
                    ${speaker.company ? `<p class="speaker-company"><i class="fas fa-building"></i> ${speaker.company}</p>` : ''}
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

    //  INICIALIZACIÓN DE CARRUSELES INFINITOS - POSICIONAMIENTO CENTRADO CORRECTO
    initializeCarousels() {
        const tracks = this.container.querySelectorAll('.carousel-track');
        
        tracks.forEach(track => {
            const type = track.dataset.type;
            const cards = track.querySelectorAll('.speaker-card');
            const originalCount = this.originalSpeakersCount[type];
            
            if (originalCount === 0 || cards.length === 0) {
                console.warn(`⚠️ No hay cards para ${type}`);
                return;
            }
            // Determinar cuántas cards mostrar según el ancho de pantalla
            this.slidesToShow = Math.ceil((window.innerWidth-200)/500);
            if(this.slidesToShow<1)this.slidesToShow=1;
            if(this.slidesToShow>originalCount)this.slidesToShow=originalCount;
            console.log(`🚀 Inicializando carrusel ${type}: ${originalCount} speakers, mostrando ${this.slidesToShow} cards`);
            
            // Obtener dimensiones del contenedor
            const container = track.parentElement;
            const containerRect = container.getBoundingClientRect();
            const containerWidth = containerRect.width;
            
            // Obtener estilos del track
            const trackStyles = window.getComputedStyle(track);
            const gap = parseFloat(trackStyles.gap) || 16;
            
            const mrl = gap; //Margen de los extremos
            // Ya no hay padding horizontal en el CSS, así que calculamos el ancho completo
            const availableWidth = containerWidth;
            const totalGaps = (this.slidesToShow - 1) * gap;
            const cardWidth = (availableWidth - totalGaps) / this.slidesToShow - (mrl*2/this.slidesToShow);//<- Se agrego este gap para el margen
            
            console.log(`📐 ${type}: container=${containerWidth}px, available=${availableWidth}px, cardWidth=${cardWidth}px, gap=${gap}px`);
            
            // Aplicar anchos a todas las cards
            cards.forEach(card => {
                card.style.width = `${cardWidth}px`;
                card.style.flexShrink = '0';
                card.style.boxSizing = 'border-box';
                setTimeout(() => {
                    card.style.height = `${track.offsetHeight-gap*2}px`;
                }, 500);
            });
            
            // Calcular step de movimiento
            const cardStep = cardWidth + gap;
            
            // Posición inicial: Empezar en la copia del centro Y centrar en viewport
            const centerCopy = 2; // Copia 2 de 5 (centro del array infinito)
            this.currentPosition[type] = centerCopy * originalCount;
            
            // Para centrar: calcular cuánto espacio sobra y dividir por 2
            const totalVisibleWidth = (this.slidesToShow * cardWidth) + ((this.slidesToShow - 1) * gap);
            const centerOffset = (containerWidth - totalVisibleWidth) / 2 - mrl; //<- Se agrego este gap para el margen
            
            // Posición base del track
            const baseTranslateX = -(this.currentPosition[type] * cardStep);
            
            // Ajustar para centrar
            const centeredTranslateX = baseTranslateX + centerOffset;
            
            console.log(`🎯 ${type}: pos=${this.currentPosition[type]}, baseX=${baseTranslateX}px, centerOffset=${centerOffset}px, finalX=${centeredTranslateX}px`);
            
            // Aplicar posición inicial
            track.style.transition = 'none';
            track.style.transform = `translate3d(${centeredTranslateX}px, 0, 0)`;
            
            // Guardar datos para el sistema
            track.dataset.cardStep = cardStep;
            track.dataset.originalCount = originalCount;
            track.dataset.slidesToShow = this.slidesToShow;
            track.dataset.cardWidth = cardWidth;
            track.dataset.centerOffset = centerOffset;
            
            // Restaurar transición
            requestAnimationFrame(() => {
                track.style.transition = `transform ${this.DURATION_BASE.AUTO}ms ${this.EASING_CURVES.AUTO}`;
                console.log(`✅ Carrusel ${type} inicializado y centrado`);
            });
        });
        
        this.updateAllIndicators();
    }

    bindEvents() {
        // Detectar si es un dispositivo táctil
        const isTouchDevice = ('ontouchstart' in window) || 
                            (navigator.maxTouchPoints > 0) || 
                            (navigator.msMaxTouchPoints > 0);
        
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
        
        // Mejorar respuesta táctil en cards de speakers
        const isTouchDevice = ('ontouchstart' in window) || 
                            (navigator.maxTouchPoints > 0) || 
                            (navigator.msMaxTouchPoints > 0);
                            
        if (isTouchDevice) {
            // Añadir evento táctil directo para mejor respuesta
            this.container.addEventListener('touchend', (e) => {
                const card = e.target.closest('.speaker-card');
                const button = e.target.closest('.btn-view-details');
                const socialLink = e.target.closest('.social-link');
                
                // Si se tocó el botón, manejarlo
                if (button) {
                    e.preventDefault();
                    const speakerId = parseInt(button.dataset.speakerId);
                    if (speakerId) {
                        this.showSpeakerModal(speakerId);
                    }
                }
                // Si se tocó la card pero no el botón ni social links
                else if (card && !socialLink && window.innerWidth <= 768) {
                    e.preventDefault();
                    const speakerId = parseInt(card.dataset.speakerId);
                    if (speakerId) {
                        this.showSpeakerModal(speakerId);
                    }
                }
            }, { passive: false });
        }
    }

    manualSlide(type, direction) {
        if (this.isTransitioning) return;
        
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
        console.log(`➡️ Next slide ${type}`);
        this.currentPosition[type]++;
        this.updateCarousel(type);
    }

    prevSlide(type) {
        console.log(`⬅️ Prev slide ${type}`);
        this.currentPosition[type]--;
        this.updateCarousel(type);
    }

    //  ACTUALIZACIÓN DEL CARRUSEL - CON CENTRADO CORRECTO
    updateCarousel(type) {
        const track = this.container.querySelector(`.carousel-track[data-type="${type}"]`);
        if (!track) return;

        const cardStep = parseFloat(track.dataset.cardStep) || 0;
        const centerOffset = parseFloat(track.dataset.centerOffset) || 0;
        const currentPos = this.currentPosition[type];
        
        // Calcular posición base
        const baseTranslateX = -(currentPos * cardStep);
        
        // Aplicar centrado
        const centeredTranslateX = baseTranslateX + centerOffset;
        
        // Aplicar transición
        const duration = this.getDuration(this.lastInteractionType);
        const easing = this.EASING_CURVES[this.lastInteractionType];
        
        track.style.transition = `transform ${duration}ms ${easing}`;
        track.style.transform = `translate3d(${centeredTranslateX}px, 0, 0)`;
        
        // Verificar reposicionamiento después de la transición
        setTimeout(() => {
            this.checkInfinitePosition(type, track);
        }, duration + 50);
        
        this.updateIndicators(type);
    }

    //  VERIFICAR Y REPOSICIONAR PARA INFINITO - CON CENTRADO CORRECTO
    checkInfinitePosition(type, track) {
        const currentPos = this.currentPosition[type];
        const originalCount = parseInt(track.dataset.originalCount);
        const cardStep = parseFloat(track.dataset.cardStep);
        const centerOffset = parseFloat(track.dataset.centerOffset) || 0;
        
        let newPosition = currentPos;
        
        // Si llegamos al inicio (copia 0), saltar a copia 2
        if (currentPos < originalCount) {
            newPosition = currentPos + (2 * originalCount);
        }
        // Si llegamos al final (copia 4), saltar a copia 2
        else if (currentPos >= 4 * originalCount) {
            newPosition = currentPos - (2 * originalCount);
        }
        
        // Reposicionar si es necesario
        if (newPosition !== currentPos) {
            this.currentPosition[type] = newPosition;
            
            // Calcular nueva posición con centrado
            const baseTranslateX = -(newPosition * cardStep);
            const centeredTranslateX = baseTranslateX + centerOffset;
            
            track.style.transition = 'none';
            track.style.transform = `translate3d(${centeredTranslateX}px, 0, 0)`;
            
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
        
        const track = this.container.querySelector(`.carousel-track[data-type="${type}"]`);
        const originalCount = this.originalSpeakersCount[type];
        const slidesToShow = parseInt(track?.dataset?.slidesToShow) || 2;
        const currentRealPos = this.currentPosition[type] % originalCount;
        const targetPos = slideIndex * slidesToShow;
        
        // Calcular ruta más corta
        let diff = targetPos - currentRealPos;
        if (diff > originalCount / 2) diff -= originalCount;
        if (diff < -originalCount / 2) diff += originalCount;
        
        this.currentPosition[type] += diff;
        this.updateCarousel(type);
    }

    updateIndicators(type) {
        const indicators = this.container.querySelectorAll(`.carousel-indicator[data-type="${type}"]`);
        const track = this.container.querySelector(`.carousel-track[data-type="${type}"]`);
        const originalCount = this.originalSpeakersCount[type];
        const slidesToShow = parseInt(track?.dataset?.slidesToShow) || 2;
        
        const realPosition = this.currentPosition[type] % originalCount;
        const currentPage = Math.floor(realPosition / slidesToShow);
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentPage);
        });
    }

    updateAllIndicators() {
        this.updateIndicators('international');
        this.updateIndicators('national');
    }

    setupResponsive() {
        let resizeTimeout;
        const updateSlidesToShow = () => {
            // Detectar si cambió el número de slides a mostrar
            const isMobile = window.innerWidth <= 768;
            const newSlidesToShow = isMobile ? 1 : 2;
            
            // Solo reinicializar si cambió el número de slides O si hay inconsistencias
            if (newSlidesToShow !== this.slidesToShow || this.needsConsistencyCheck()) {
                console.log(`📱 Cambiando de ${this.slidesToShow} a ${newSlidesToShow} cards visibles`);
                this.slidesToShow = newSlidesToShow;
                this.pauseAutoPlay();
                this.initializeCarousels();
                this.scheduleAutoPlayResume(1000);
            }
        };

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateSlidesToShow, 250);
        });
    }

    // Verificar si ambos carruseles necesitan sincronización
    needsConsistencyCheck() {
        const tracks = this.container.querySelectorAll('.carousel-track');
        if (tracks.length !== 2) return false;
        
        const track1 = tracks[0];
        const track2 = tracks[1];
        
        // Verificar que ambos tengan los mismos parámetros guardados
        const slidesToShow1 = track1.dataset.slidesToShow;
        const slidesToShow2 = track2.dataset.slidesToShow;
        const cardStep1 = track1.dataset.cardStep;
        const cardStep2 = track2.dataset.cardStep;
        
        // Si hay diferencias, necesitamos reinicializar
        const needsSync = slidesToShow1 !== slidesToShow2 || 
                         Math.abs(parseFloat(cardStep1) - parseFloat(cardStep2)) > 1;
        
        if (needsSync) {
            console.log('🔄 Detectadas inconsistencias entre carruseles, sincronizando...');
        }
        
        return needsSync;
    }

    //  AUTOPLAY SINCRONIZADO E INFINITO
    startAutoPlay() {
        this.pauseAutoPlay();
        
        const hasInternational = this.internationalSpeakers.length > 0;
        const hasNational = this.nationalSpeakers.length > 0;
        
        if (!hasInternational && !hasNational) return;
        
        console.log(`🎵 Iniciando autoplay infinito - Internacional: ${hasInternational}, Nacional: ${hasNational}`);
        
        const autoInterval = this.getDuration('AUTO') + 4000; // Pausa larga
        
        this.autoPlayInterval = setInterval(() => {
            if (this.isTransitioning) {
                console.log('⏳ Saltando autoplay - transición en curso');
                return;
            }
            
            this.lastInteractionType = 'AUTO';
            this.executeSynchronizedMovement();
        }, autoInterval);
    }

    executeSynchronizedMovement() {
        const hasInternational = this.internationalSpeakers.length > 0;
        const hasNational = this.nationalSpeakers.length > 0;
        
        console.log(`🎭 Ejecutando movimiento automático`);
        this.isTransitioning = true;
        
        if (hasInternational && hasNational) {
            // Movimiento sincronizado en direcciones opuestas
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
                        ${speaker.company ? `<p class="speaker-company"><strong>Empresa:</strong> ${speaker.company}</p>` : ''}
                    </div>
                </div>
                <div class="modal-body">
                    ${speaker.topic ? `
                        <div class="speaker-topic">
                            <h3>Tema${speaker.topic.includes(',') ? 's' : ''}</h3>
                            ${this.createTopicHTMLForModal(speaker.topic)}
                        </div>
                    ` : ''}
                    <div class="speaker-bio-full">
                        <h3>Biografía</h3>
                        <p>${speaker.bio}</p>
                    </div>
                    ${speaker.expertise.length?
                    `<div class="speaker-expertise">
                        <h3>Áreas de Expertise</h3>
                        <div class="expertise-tags">
                            ${speaker.expertise.map(skill => `<span class="expertise-tag">${skill}</span>`).join('')}
                        </div>
                    </div>`:""}
                    ${sessions.length > 0 ? `
                        <div class="speaker-sessions">
                            <h3>Participación en el Evento</h3>
                            <div class="sessions-list">
                                ${sessionsHTML}
                            </div>
                        </div>
                    ` : ''}
                    ${Object.keys(speaker.social).length?
                    `<div class="speaker-social">
                        <h3>Contacto</h3>
                        <div class="social-links">
                            ${this.createSocialLinks(speaker.social || {})}
                        </div>
                    </div>`:""}
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

    // Asegurar que ambos carruseles estén perfectamente sincronizados y centrados
    ensureCarouselsSync() {
        const tracks = this.container.querySelectorAll('.carousel-track');
        
        if (tracks.length !== 2) return;
        
        const international = tracks[0].dataset.type === 'international' ? tracks[0] : tracks[1];
        const national = tracks[0].dataset.type === 'national' ? tracks[0] : tracks[1];
        
        // Verificar que ambos tengan los mismos parámetros
        const intlCardStep = parseFloat(international.dataset.cardStep);
        const natlCardStep = parseFloat(national.dataset.cardStep);
        const intlSlidesToShow = parseInt(international.dataset.slidesToShow);
        const natlSlidesToShow = parseInt(national.dataset.slidesToShow);
        const intlCenterOffset = parseFloat(international.dataset.centerOffset);
        const natlCenterOffset = parseFloat(national.dataset.centerOffset);
        
        // Si hay diferencias significativas, reinicializar
        if (Math.abs(intlCardStep - natlCardStep) > 5 || 
            intlSlidesToShow !== natlSlidesToShow ||
            Math.abs(intlCenterOffset - natlCenterOffset) > 5) {
            console.log('🔄 Corrigiendo inconsistencias de centrado entre carruseles');
            this.initializeCarousels();
            return;
        }
        
        // Verificar posicionamiento visual de las cards dentro del viewport
        const intlCards = international.querySelectorAll('.speaker-card');
        const natlCards = national.querySelectorAll('.speaker-card');
        
        if (intlCards.length > 0 && natlCards.length > 0) {
            const intlFirstCard = intlCards[this.currentPosition.international];
            const natlFirstCard = natlCards[this.currentPosition.national];
            
            if (intlFirstCard && natlFirstCard) {
                const intlRect = intlFirstCard.getBoundingClientRect();
                const natlRect = natlFirstCard.getBoundingClientRect();
                
                console.log('✅ Carruseles centrados correctamente:', {
                    international: { 
                        cardStep: intlCardStep, 
                        slides: intlSlidesToShow, 
                        centerOffset: intlCenterOffset,
                        cardX: intlRect.x 
                    },
                    national: { 
                        cardStep: natlCardStep, 
                        slides: natlSlidesToShow, 
                        centerOffset: natlCenterOffset,
                        cardX: natlRect.x 
                    }
                });
            }
        }
    }

    destroy() {
        this.pauseAutoPlay();
        
        if (this.resumeTimeout) {
            clearTimeout(this.resumeTimeout);
            this.resumeTimeout = null;
        }
        
        window.removeEventListener('resize', this.setupResponsive);
    }
}