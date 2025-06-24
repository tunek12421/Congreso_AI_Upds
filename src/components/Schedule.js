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

        return `
            <div class="filter-buttons">
                <button class="filter-btn active" data-filter="all">
                    <i class="fas fa-list"></i>
                    Todos
                </button>
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
        const categoryBadge = '';//item.category ? `<span class="category-badge category-${item.category.toLowerCase().replace(/\s+/g, '-')}">${item.category}</span>` : '';

        return `
            <div class="timeline-item ${item.type}" data-type="${item.type}" data-category="${item.category || ''}">
                <div class="timeline-time">
                    <div class="time-indicator">
                        <i class="${typeIcon}"></i>
                    </div>
                    <span class="time-text">${item.time}</span>
                </div>
                <div class="timeline-content">
                    <div>
                        <div class="session-header">
                            <h3 class="session-title">${item.title}</h3>
                            ${categoryBadge}
                        </div>
                        <p class="session-description">${item.description}</p>
                        <div class="session-meta">
                            <div class="session-location">
                                <i class="fas fa-map-marker-alt"></i>
                                ${item.location}
                            </div>
                            ${speakers.length > 0 ? `
                                <div class="session-speakers">
                                    <i class="fas fa-user-tie"></i>
                                    <span>Ponentes:</span>
                                </div>
                            ` : ''}
                        </div>
                        ${speakers.length > 0 ? `
                            <div class="speakers-list">
                                ${speakersHTML}
                            </div>
                        ` : ''}
                        <div class="session-actions">
                            ${this.createSessionActions(item)}
                        </div>
                    </div>
                    <img src="assets/images/webinars/1.gif">
                </div>
            </div>
        `;

        return `
            <div class="timeline-item ${item.type}" data-type="${item.type}" data-category="${item.category || ''}">
                <div class="timeline-time">
                    <div class="time-indicator">
                        <i class="${typeIcon}"></i>
                    </div>
                    <span class="time-text">${item.time}</span>
                </div>
                <div class="timeline-content">
                    <div class="session-header">
                        <h3 class="session-title">${item.title}</h3>
                        ${categoryBadge}
                    </div>
                    <p class="session-description">${item.description}</p>
                    <div class="session-meta">
                        <div class="session-location">
                            <i class="fas fa-map-marker-alt"></i>
                            ${item.location}
                        </div>
                        ${speakers.length > 0 ? `
                            <div class="session-speakers">
                                <i class="fas fa-user-tie"></i>
                                <span>Ponentes:</span>
                            </div>
                        ` : ''}
                    </div>
                    ${speakers.length > 0 ? `
                        <div class="speakers-list">
                            ${speakersHTML}
                        </div>
                    ` : ''}
                    <div class="session-actions">
                        ${this.createSessionActions(item)}
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
            'networking': 'fas fa-handshake'
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
                    icon: 'assets/images/logo.png'
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
                        <span class="location"><i class="fas fa-map-marker-alt"></i> ${session.location}</span>
                    </div>
                </div>
                <div class="modal-body">
                    <p class="session-description">${session.description}</p>
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