class SpeakerComponent {
    constructor(container) {
        this.container = container;
        this.speakers = [];
    }

    async init() {
        try {
            this.speakers = await dataService.getSpeakers();
            this.render();
            this.bindEvents();
        } catch (error) {
            console.error('Error initializing speakers:', error);
            this.renderError();
        }
    }

    render() {
        if (!this.container) return;

        const speakersHTML = this.speakers.map(speaker => this.createSpeakerCard(speaker)).join('');
        this.container.innerHTML = speakersHTML;
        
        // Aplicar animaciones
        this.applyAnimations();
    }

    createSpeakerCard(speaker) {
        const socialLinks = this.createSocialLinks(speaker.social || {});
        const expertiseTagsHTML = speaker.expertise.map(skill => 
            `<span class="expertise-tag">${skill}</span>`
        ).join('');

        return `
            <div class="speaker-card fade-in" data-speaker-id="${speaker.id}">
                <div class="speaker-avatar">
                    ${speaker.photo ? 
                        `<img src="${speaker.photo}" alt="${speaker.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         <div class="avatar-fallback" style="display:none;"><i class="fas fa-user-tie"></i></div>` :
                        `<div class="avatar-fallback"><i class="fas fa-user-tie"></i></div>`
                    }
                    <div class="speaker-overlay">
                        <button class="btn-view-details" data-speaker-id="${speaker.id}">
                            <i class="fas fa-info-circle"></i>
                            Ver Detalles
                        </button>
                    </div>
                </div>
                <div class="speaker-info">
                    <h3 class="speaker-name">${speaker.name}</h3>
                    <p class="speaker-title">${speaker.title}</p>
                    <div class="speaker-country">
                        <span class="flag">${speaker.flag || '🌎'}</span>
                        ${speaker.country}
                    </div>
                    <div class="expertise-tags">
                        ${expertiseTagsHTML}
                    </div>
                    <p class="speaker-bio">${this.truncateBio(speaker.bio)}</p>
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
            links.push(`<a href="${social.linkedin}" target="_blank" class="social-link"><i class="fab fa-linkedin"></i></a>`);
        }
        if (social.twitter) {
            links.push(`<a href="https://twitter.com/${social.twitter.replace('@', '')}" target="_blank" class="social-link"><i class="fab fa-twitter"></i></a>`);
        }
        if (social.email) {
            links.push(`<a href="mailto:${social.email}" class="social-link"><i class="fas fa-envelope"></i></a>`);
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
        });

        // Hover effects
        this.container.addEventListener('mouseenter', (e) => {
            if (e.target.closest('.speaker-card')) {
                const card = e.target.closest('.speaker-card');
                card.style.transform = 'translateY(-10px) scale(1.02)';
            }
        }, true);

        this.container.addEventListener('mouseleave', (e) => {
            if (e.target.closest('.speaker-card')) {
                const card = e.target.closest('.speaker-card');
                card.style.transform = 'translateY(0) scale(1)';
            }
        }, true);
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
                <button class="modal-close">
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
                document.body.removeChild(modal);
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
        const cards = this.container.querySelectorAll('.speaker-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
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

    // Método para filtrar ponentes
    filterSpeakers(criteria) {
        const filteredSpeakers = this.speakers.filter(speaker => {
            if (criteria.country && speaker.country !== criteria.country) return false;
            if (criteria.expertise && !speaker.expertise.some(skill => 
                skill.toLowerCase().includes(criteria.expertise.toLowerCase())
            )) return false;
            if (criteria.search && !speaker.name.toLowerCase().includes(criteria.search.toLowerCase()) &&
                !speaker.title.toLowerCase().includes(criteria.search.toLowerCase())) return false;
            
            return true;
        });

        const filteredHTML = filteredSpeakers.map(speaker => this.createSpeakerCard(speaker)).join('');
        this.container.innerHTML = filteredHTML || '<p class="no-results">No se encontraron ponentes con estos criterios.</p>';
        this.applyAnimations();
    }

    // Método para destacar ponentes principales
    async renderFeatured() {
        try {
            const featuredSpeakers = await dataService.getFeaturedSpeakers();
            const featuredHTML = featuredSpeakers.map(speaker => this.createSpeakerCard(speaker)).join('');
            this.container.innerHTML = featuredHTML;
            this.applyAnimations();
        } catch (error) {
            console.error('Error loading featured speakers:', error);
            this.renderError();
        }
    }
}