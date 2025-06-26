class ScheduleComponent {
    constructor(container) {
        this.container = container;
        this.schedule = [];
        this.speakers = [];
        this.currentFilter = 'all';
    }

    async init() {
        try {
            this.schedule = await dataService.getSchedule();
            this.speakers = await dataService.getSpeakers();
            this.render();
            this.bindEvents();
            this.initializeWebinarFeatures();
        } catch (error) {
            console.error('Error initializing schedule:', error);
            this.renderError();
        }
    }

    render() {
        if (!this.container) return;

        const scheduleHTML = `
            <div class="schedule-filters">
                ${this.createFilters()}
            </div>
            <div class="schedule-timeline">
                ${this.createTimeline()}
            </div>
        `;

        this.container.innerHTML = scheduleHTML;
        this.applyAnimations();
    }

    createFilters() {
        const types = [...new Set(this.schedule.map(item => item.type))];
        const categories = [...new Set(this.schedule.map(item => item.category).filter(Boolean))];
        const hasWebinars = this.schedule.some(item => item.type === 'webinar');

        return `
            <div class="filter-buttons">
                <button class="filter-btn active" data-filter="all">
                    <i class="fas fa-list"></i>
                    Todos
                </button>
                ${hasWebinars ? `
                    <button class="filter-btn filter-webinar-live" data-filter="webinar">
                        <i class="fas fa-broadcast-tower"></i>
                        <span class="live-indicator">●</span>
                        Webinars EN VIVO
                        <span class="live-pulse"></span>
                    </button>
                ` : ''}
                <button class="filter-btn" data-filter="keynote">
                    <i class="fas fa-star"></i>
                    Conferencias
                </button>
                <button class="filter-btn" data-filter="panel">
                    <i class="fas fa-users"></i>
                    Paneles
                </button>
                <button class="filter-btn" data-filter="workshop">
                    <i class="fas fa-tools"></i>
                    Talleres
                </button>
                <button class="filter-btn" data-filter="presentation">
                    <i class="fas fa-presentation"></i>
                    Presentaciones
                </button>
            </div>
        `;
    }

    createTimeline() {
        return this.schedule.map(item => this.createTimelineItem(item)).join('');
    }

    createTimelineItem(item) {
        const speakers = this.getSpeakersForSession(item.speakers || []);
        const speakersHTML = speakers.map(speaker => `
            <div class="session-speaker" data-speaker-id="${speaker.id}">
                <img src="${speaker.photo || 'assets/images/default-avatar.jpg'}" 
                     alt="${speaker.name}" 
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM0YTkwZTIiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IndoaXRlIj4KPHN2ZyBmaWxsPSJjdXJyZW50Q29sb3IiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0UzEzLjEgNiAxMiA2IDEwIDUuMSAxMCA0IDEwLjkgMiAxMiAyWk0yMSAxOVYyMUg5VjE5TDEwIDE4VjEzSDhWMTFIMTZWMTNIMTRWMTguM0wyMSAxOVoiLz4KPC9zdmc+Cjwvc3ZnPgo8L3N2Zz4K';">
                <span class="speaker-name">${speaker.name}</span>
            </div>
        `).join('');

        const typeIcon = this.getTypeIcon(item.type);
        const categoryBadge = item.category ? `<span class="category-badge category-${item.category.toLowerCase().replace(/\s+/g, '-')}">${item.category}</span>` : '';

        // Imagen/GIF de la sesión con fallback
        const sessionImage = item.image ? `
            <div class="session-image ${item.type === 'webinar' ? 'webinar-image' : ''}">
                <img src="${item.image}" 
                     alt="${item.title}" 
                     onerror="this.src='assets/images/schedule/default-session.jpg'">
                ${item.isLive ? '<div class="live-overlay"><span class="live-badge">EN VIVO</span></div>' : ''}
            </div>
        ` : '';

        // Información especial para webinars
        const webinarInfo = item.type === 'webinar' ? `
            <div class="webinar-details">
                <div class="webinar-platforms">
                    <span class="platforms-label">Disponible en:</span>
                    ${item.platforms.map(platform => `
                        <span class="platform-badge">${platform}</span>
                    `).join('')}
                </div>
                ${item.interactive ? '<div class="webinar-feature"><i class="fas fa-comments"></i> Sesión Interactiva</div>' : ''}
                ${item.chatEnabled ? '<div class="webinar-feature"><i class="fas fa-comment-dots"></i> Chat en Vivo</div>' : ''}
                ${item.qnaEnabled ? '<div class="webinar-feature"><i class="fas fa-question-circle"></i> Q&A en Tiempo Real</div>' : ''}
                ${item.maxViewers ? `<div class="webinar-feature"><i class="fas fa-users"></i> Hasta ${item.maxViewers} participantes</div>` : ''}
            </div>
        ` : '';

        return `
            <div class="timeline-item ${item.type} ${item.isLive ? 'live-session' : ''}" data-type="${item.type}" data-category="${item.category || ''}">
                <div class="timeline-time">
                    <div class="time-indicator ${item.type === 'webinar' ? 'webinar-indicator' : ''}">
                        <i class="${typeIcon}"></i>
                        ${item.isLive ? '<div class="live-pulse-indicator"></div>' : ''}
                    </div>
                </div>
                <div class="timeline-content">
                    <div class="session-header">
                        <div class="session-info">
                            <h3 class="session-title">
                                ${item.title}
                                ${item.isLive ? '<span class="live-title-badge">🔴 EN VIVO</span>' : ''}
                            </h3>
                            ${categoryBadge}
                            <p class="session-description">${item.description}</p>
                            <div class="session-meta">
                                <div class="session-location">
                                    <i class="fas fa-${item.type === 'webinar' ? 'globe' : 'map-marker-alt'}"></i>
                                    ${item.location}
                                </div>
                                ${speakers.length > 0 ? `
                                    <div class="session-speakers">
                                        <i class="fas fa-user-tie"></i>
                                        <span>Ponentes:</span>
                                    </div>
                                ` : ''}
                            </div>
                            ${webinarInfo}
                            ${speakers.length > 0 ? `
                                <div class="speakers-list">
                                    ${speakersHTML}
                                </div>
                            ` : ''}
                            <div class="session-actions">
                                ${this.createSessionActions(item)}
                            </div>
                        </div>
                        ${sessionImage}
                    </div>
                </div>
            </div>
        `;
    }

    getSpeakersForSession(speakerIds) {
        return speakerIds.map(id => this.speakers.find(speaker => speaker.id === id)).filter(Boolean);
    }

    getTypeIcon(type) {
        const icons = {
            'keynote': 'fas fa-star',
            'panel': 'fas fa-users',
            'presentation': 'fas fa-presentation',
            'workshop': 'fas fa-tools',
            'demo': 'fas fa-robot',
            'break': 'fas fa-coffee',
            'lunch': 'fas fa-utensils',
            'registration': 'fas fa-clipboard-check',
            'opening': 'fas fa-play',
            'closing': 'fas fa-flag-checkered',
            'networking': 'fas fa-handshake',
            'webinar': 'fas fa-broadcast-tower'
        };
        return icons[type] || 'fas fa-calendar';
    }

    createSessionActions(item) {
        const actions = [];

        if (item.type !== 'break' && item.type !== 'lunch' && item.type !== 'registration') {
            actions.push(`
                <button class="btn-action btn-reminder" data-session-id="${item.id}">
                    <i class="fas fa-bell"></i>
                    Recordatorio
                </button>
            `);
        }

        if (item.speakers && item.speakers.length > 0) {
            actions.push(`
                <button class="btn-action btn-speakers" data-session-id="${item.id}">
                    <i class="fas fa-info-circle"></i>
                    Ver Ponentes
                </button>
            `);
        }

        // Acciones especiales para webinars
        if (item.type === 'webinar') {
            if (item.streamUrl) {
                actions.push(`
                    <button class="btn-action btn-join-stream" data-stream-url="${item.streamUrl}">
                        <i class="fas fa-play-circle"></i>
                        ${item.isLive ? 'Unirse al Live' : 'Ver Grabación'}
                    </button>
                `);
            }
            
            if (item.requiresRegistration) {
                actions.push(`
                    <button class="btn-action btn-register-webinar" data-session-id="${item.id}">
                        <i class="fas fa-user-plus"></i>
                        Registrarse
                    </button>
                `);
            }
        }

        return actions.join('');
    }

    bindEvents() {
        // Filter buttons
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.filter-btn')) {
                const filterBtn = e.target.closest('.filter-btn');
                const filter = filterBtn.dataset.filter;
                this.applyFilter(filter);
                
                // Update active button
                this.container.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                filterBtn.classList.add('active');
            }

            // Session actions
            if (e.target.closest('.btn-reminder')) {
                const sessionId = parseInt(e.target.closest('.btn-reminder').dataset.sessionId);
                this.setReminder(sessionId);
            }

            if (e.target.closest('.btn-speakers')) {
                const sessionId = parseInt(e.target.closest('.btn-speakers').dataset.sessionId);
                this.showSessionSpeakers(sessionId);
            }

            // Webinar actions
            if (e.target.closest('.btn-join-stream')) {
                const streamUrl = e.target.closest('.btn-join-stream').dataset.streamUrl;
                this.joinWebinarStream(streamUrl);
            }

            if (e.target.closest('.btn-register-webinar')) {
                const sessionId = parseInt(e.target.closest('.btn-register-webinar').dataset.sessionId);
                this.registerForWebinar(sessionId);
            }

            // Speaker clicks
            if (e.target.closest('.session-speaker')) {
                const speakerId = parseInt(e.target.closest('.session-speaker').dataset.speakerId);
                this.showSpeakerInfo(speakerId);
            }
        });

        // Scroll animations
        this.setupScrollAnimations();
    }

    applyFilter(filter) {
        this.currentFilter = filter;
        const items = this.container.querySelectorAll('.timeline-item');
        
        items.forEach(item => {
            const itemType = item.dataset.type;
            const itemCategory = item.dataset.category;
            
            let shouldShow = false;
            
            if (filter === 'all') {
                shouldShow = true;
            } else if (filter === itemType) {
                shouldShow = true;
            } else if (filter === itemCategory) {
                shouldShow = true;
            }
            
            if (shouldShow) {
                item.style.display = 'flex';
                item.classList.add('fade-in-visible');
            } else {
                item.style.display = 'none';
                item.classList.remove('fade-in-visible');
            }
        });
    }

    setReminder(sessionId) {
        const session = this.schedule.find(s => s.id === sessionId);
        if (!session) return;

        // Verificar si el navegador soporta notificaciones
        if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    this.scheduleNotification(session);
                    this.showToast('Recordatorio configurado exitosamente', 'success');
                } else {
                    this.showToast('No se pudieron configurar las notificaciones', 'warning');
                }
            });
        } else {
            // Fallback: agregar al calendario
            this.addToCalendar(session);
        }
    }

    scheduleNotification(session) {
        // Calcular tiempo hasta la sesión (ejemplo: 10 minutos antes)
        const sessionDate = new Date(); // En un caso real, sería session.datetime
        const reminderTime = sessionDate.getTime() - (10 * 60 * 1000); // 10 minutos antes
        const now = Date.now();
        
        if (reminderTime > now) {
            setTimeout(() => {
                new Notification(`¡Próxima sesión!`, {
                    body: `"${session.title}" comienza en 10 minutos`,
                    icon: 'assets/images/logos/CiiA1.png'
                });
            }, reminderTime - now);
        }
    }

    addToCalendar(session) {
        // Crear enlace de Google Calendar
        const startDate = new Date(); // En un caso real, usar session.datetime
        const endDate = new Date(startDate.getTime() + (60 * 60 * 1000)); // 1 hora después
        
        const formatDate = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };
        
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(session.title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(session.description)}&location=${encodeURIComponent(session.location)}`;
        
        window.open(calendarUrl, '_blank');
    }

    showSessionSpeakers(sessionId) {
        const session = this.schedule.find(s => s.id === sessionId);
        if (!session || !session.speakers) return;

        const speakers = this.getSpeakersForSession(session.speakers);
        this.createSpeakersModal(session, speakers);
    }

    createSpeakersModal(session, speakers) {
        const modal = document.createElement('div');
        modal.className = 'session-modal';
        
        const speakersHTML = speakers.map(speaker => `
            <div class="modal-speaker">
                <div class="speaker-avatar-small">
                    <img src="${speaker.photo || 'assets/images/default-avatar.jpg'}" alt="${speaker.name}">
                </div>
                <div class="speaker-info">
                    <h4>${speaker.name}</h4>
                    <p>${speaker.title}</p>
                    <span class="speaker-country">${speaker.flag || '🌎'} ${speaker.country}</span>
                </div>
                <button class="btn-speaker-details" data-speaker-id="${speaker.id}">
                    Ver Perfil
                </button>
            </div>
        `).join('');

        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-header">
                    <h2>${session.title}</h2>
                    <div class="session-time-location">
                        <span class="time"><i class="fas fa-clock"></i> ${session.time}</span>
                        <span class="location"><i class="fas fa-${session.type === 'webinar' ? 'globe' : 'map-marker-alt'}"></i> ${session.location}</span>
                    </div>
                </div>
                <div class="modal-body">
                    <p class="session-description">${session.description}</p>
                    ${session.type === 'webinar' ? `
                        <div class="webinar-modal-info">
                            <h4>Información del Webinar</h4>
                            <div class="webinar-platforms">
                                <strong>Plataformas:</strong> ${session.platforms ? session.platforms.join(', ') : 'YouTube'}
                            </div>
                            ${session.maxViewers ? `<div><strong>Capacidad:</strong> ${session.maxViewers} participantes</div>` : ''}
                            ${session.interactive ? '<div><i class="fas fa-check"></i> Sesión Interactiva</div>' : ''}
                        </div>
                    ` : ''}
                    <h3>Ponentes</h3>
                    <div class="speakers-grid">
                        ${speakersHTML}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);

        this.bindModalEvents(modal);
    }

    bindModalEvents(modal) {
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => document.body.removeChild(modal), 300);
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        
        // Speaker profile buttons
        modal.addEventListener('click', (e) => {
            if (e.target.closest('.btn-speaker-details')) {
                const speakerId = parseInt(e.target.closest('.btn-speaker-details').dataset.speakerId);
                closeModal();
                this.showSpeakerInfo(speakerId);
            }
        });

        document.addEventListener('keydown', function handleEscape(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        });
    }

    showSpeakerInfo(speakerId) {
        // Integración con SpeakerComponent
        if (window.speakerComponent) {
            window.speakerComponent.showSpeakerModal(speakerId);
        }
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        this.container.querySelectorAll('.timeline-item').forEach(item => {
            observer.observe(item);
        });
    }

    applyAnimations() {
        const items = this.container.querySelectorAll('.timeline-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    renderError() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar el programa</h3>
                <p>No se pudo cargar el programa del evento. Por favor, intenta recargar la página.</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-refresh"></i>
                    Recargar
                </button>
            </div>
        `;
    }

    // MÉTODOS PARA WEBINARS (Sin auto-notificaciones)

    joinWebinarStream(streamUrl) {
        if (!streamUrl) {
            this.showToast('URL de transmisión no disponible', 'warning');
            return;
        }

        // Mostrar modal de confirmación antes de abrir el stream
        const modal = this.createWebinarJoinModal(streamUrl);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    createWebinarJoinModal(streamUrl) {
        const modal = document.createElement('div');
        modal.className = 'webinar-join-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-header">
                    <div class="live-indicator-large">🔴</div>
                    <h2>Unirse a Webinar en Vivo</h2>
                    <p>Estás a punto de unirte a una transmisión en vivo</p>
                </div>
                <div class="modal-body">
                    <div class="webinar-info">
                        <div class="info-item">
                            <i class="fas fa-broadcast-tower"></i>
                            <span>Transmisión en tiempo real</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-comments"></i>
                            <span>Chat interactivo disponible</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-question-circle"></i>
                            <span>Sesión de preguntas y respuestas</span>
                        </div>
                    </div>
                    <div class="join-actions">
                        <button class="btn-cancel">Cancelar</button>
                        <button class="btn-join-now" data-url="${streamUrl}">
                            <i class="fas fa-play-circle"></i>
                            Unirse Ahora
                        </button>
                    </div>
                </div>
            </div>
        `;

        this.bindWebinarModalEvents(modal);
        return modal;
    }

    bindWebinarModalEvents(modal) {
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => document.body.removeChild(modal), 300);
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        modal.querySelector('.btn-cancel').addEventListener('click', closeModal);
        
        modal.querySelector('.btn-join-now').addEventListener('click', (e) => {
            const url = e.target.dataset.url;
            window.open(url, '_blank', 'width=1200,height=800');
            closeModal();
            this.showToast('¡Te has unido al webinar en vivo!', 'success');
        });

        document.addEventListener('keydown', function handleEscape(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        });
    }

    registerForWebinar(sessionId) {
        const session = this.schedule.find(s => s.id === sessionId);
        if (!session) return;

        // Simular registro (en una aplicación real, esto haría una llamada API)
        const registrationModal = this.createRegistrationModal(session);
        document.body.appendChild(registrationModal);
        setTimeout(() => registrationModal.classList.add('active'), 10);
    }

    createRegistrationModal(session) {
        const modal = document.createElement('div');
        modal.className = 'webinar-registration-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-header">
                    <h2>Registro para Webinar</h2>
                    <h3>${session.title}</h3>
                    <p class="session-time">${session.time}</p>
                </div>
                <div class="modal-body">
                    <form class="registration-form">
                        <div class="form-group">
                            <label for="reg-name">Nombre completo *</label>
                            <input type="text" id="reg-name" required>
                        </div>
                        <div class="form-group">
                            <label for="reg-email">Email *</label>
                            <input type="email" id="reg-email" required>
                        </div>
                        <div class="form-group">
                            <label for="reg-organization">Organización</label>
                            <input type="text" id="reg-organization">
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="reg-notifications">
                                Recibir recordatorios por email
                            </label>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-cancel">Cancelar</button>
                            <button type="submit" class="btn-register">
                                <i class="fas fa-user-plus"></i>
                                Registrarse
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        this.bindRegistrationModalEvents(modal, session);
        return modal;
    }

    bindRegistrationModalEvents(modal, session) {
        const closeModal = () => {
            modal.classList.remove('active');
            setTimeout(() => document.body.removeChild(modal), 300);
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        modal.querySelector('.btn-cancel').addEventListener('click', closeModal);
        
        modal.querySelector('.registration-form').addEventListener('submit', (e) => {
            e.preventDefault();
            
            const registrationData = {
                sessionId: session.id,
                name: modal.querySelector('#reg-name').value,
                email: modal.querySelector('#reg-email').value,
                organization: modal.querySelector('#reg-organization').value,
                notifications: modal.querySelector('#reg-notifications').checked
            };

            // Simular envío exitoso
            this.showToast('¡Registro exitoso! Te enviaremos los detalles por email.', 'success');
            closeModal();
            
            // En una aplicación real, aquí harías la llamada API
            console.log('Webinar registration:', registrationData);
        });
    }

    // Método para obtener webinars en vivo
    getLiveWebinars() {
        return this.schedule.filter(session => 
            session.type === 'webinar' && session.isLive
        );
    }

    // Inicializar características específicas de webinars
    initializeWebinarFeatures() {
        // PRIMERA APARICIÓN: 7 segundos
        setTimeout(() => {
            this.checkUpcomingWebinars();
        }, 7000);
        
        // APARICIONES CONTINUAS: cada 25 segundos
        setInterval(() => {
            this.checkUpcomingWebinars();
        }, 25000);
    }

    // Método para verificar webinars próximos
    checkUpcomingWebinars() {
        const liveWebinars = this.getLiveWebinars();
        if (liveWebinars.length > 0) {
            const randomWebinar = liveWebinars[Math.floor(Math.random() * liveWebinars.length)];
            this.showWebinarNotification(randomWebinar);
        }
    }

    showWebinarNotification(webinar) {
        // Evitar mostrar notificación duplicada
        if (document.querySelector('.webinar-notification')) return;

        const notification = document.createElement('div');
        notification.className = 'webinar-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-broadcast-tower"></i>
                    <div class="live-pulse-small"></div>
                </div>
                <div class="notification-text">
                    <h4>Webinar en Vivo</h4>
                    <p>${webinar.title}</p>
                    <span class="notification-time">${webinar.time}</span>
                </div>
                <div class="notification-actions">
                    <button class="btn-join-notification" data-stream-url="${webinar.streamUrl}">
                        Unirse
                    </button>
                    <button class="btn-close-notification">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(notification);
        
        // Animación de entrada más suave y fluida
        requestAnimationFrame(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(120%) scale(0.8)';
            notification.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            
            requestAnimationFrame(() => {
                notification.classList.add('show');
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(0) scale(1)';
            });
        });

        // Auto-remove con animación suave después de 10 segundos
        setTimeout(() => {
            notification.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(120%) scale(0.9)';
            
            setTimeout(() => {
                if (notification.parentElement) {
                    document.body.removeChild(notification);
                }
            }, 600);
        }, 10000);

        // Bind events
        notification.querySelector('.btn-join-notification').addEventListener('click', (e) => {
            const streamUrl = e.target.dataset.streamUrl;
            this.joinWebinarStream(streamUrl);
            
            // Animación de salida suave al hacer click
            notification.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(120%) scale(0.95)';
            
            setTimeout(() => {
                if (notification.parentElement) {
                    document.body.removeChild(notification);
                }
            }, 400);
        });

        notification.querySelector('.btn-close-notification').addEventListener('click', () => {
            // Animación de salida suave al cerrar
            notification.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(120%) scale(0.9)';
            
            setTimeout(() => {
                if (notification.parentElement) {
                    document.body.removeChild(notification);
                }
            }, 500);
        });
    }

    // Método para obtener próximas sesiones
    getUpcomingSessions(count = 3) {
        const now = new Date();
        // En un caso real, compararíamos con session.datetime
        return this.schedule
            .filter(session => session.type !== 'break' && session.type !== 'lunch')
            .slice(0, count);
    }

    // Método para exportar programa
    exportSchedule(format = 'ics') {
        if (format === 'ics') {
            this.exportToICS();
        } else if (format === 'pdf') {
            this.exportToPDF();
        }
    }

    exportToICS() {
        const events = this.schedule
            .filter(session => session.type !== 'break' && session.type !== 'lunch')
            .map(session => {
                const startDate = new Date(); // En caso real: session.datetime
                const endDate = new Date(startDate.getTime() + (60 * 60 * 1000));
                
                return [
                    'BEGIN:VEVENT',
                    `DTSTART:${this.formatICSDate(startDate)}`,
                    `DTEND:${this.formatICSDate(endDate)}`,
                    `SUMMARY:${session.title}`,
                    `DESCRIPTION:${session.description}`,
                    `LOCATION:${session.location}`,
                    `UID:${session.id}@congreso-ia-upds.com`,
                    'END:VEVENT'
                ].join('\r\n');
            });

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//UPDS//Congreso IA//ES',
            ...events,
            'END:VCALENDAR'
        ].join('\r\n');

        this.downloadFile(icsContent, 'congreso-ia-programa.ics', 'text/calendar');
    }

    formatICSDate(date) {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    // Método para buscar en el programa
    searchSchedule(query) {
        const filtered = this.schedule.filter(session => 
            session.title.toLowerCase().includes(query.toLowerCase()) ||
            session.description.toLowerCase().includes(query.toLowerCase()) ||
            session.location.toLowerCase().includes(query.toLowerCase())
        );

        const filteredHTML = filtered.map(item => this.createTimelineItem(item)).join('');
        const timelineContainer = this.container.querySelector('.schedule-timeline');
        timelineContainer.innerHTML = filteredHTML || '<p class="no-results">No se encontraron sesiones.</p>';
    }
}