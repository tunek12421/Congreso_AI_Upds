class DataService {
    constructor() {
        this.cache = {};
        this.baseUrl = './data';
    }

    async loadJSON(fileName) {
        if (this.cache[fileName]) {
            return this.cache[fileName];
        }

        try {
            const response = await fetch(`${this.baseUrl}/${fileName}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.cache[fileName] = data;
            return data;
        } catch (error) {
            console.error(`Error loading ${fileName}:`, error);
            return this.getFallbackData(fileName);
        }
    }

    getFallbackData(fileName) {
        const fallbacks = {
            speakers: {
                speakers: [
                    {
                        id: 1,
                        name: "Expertos Internacionales",
                        title: "Especialistas en IA Aplicada",
                        country: "Brasil & Estados Unidos",
                        flag: "🌎",
                        expertise: ["IA", "Innovación", "Tecnología"],
                        bio: "Líderes mundiales en inteligencia artificial.",
                        sessions: []
                    }
                ]
            },
            schedule: {
                event: {
                    date: "2024-12-15",
                    location: "Cochabamba, Bolivia"
                },
                schedule: [],
                topics: ["IA en Educación", "Ciudades Inteligentes", "Ética en IA"]
            },
            config: {
                event: {
                    name: "1er Congreso de IA",
                    date: "2024-12-15",
                    location: { city: "Cochabamba", country: "Bolivia" }
                },
                statistics: { speakers: 11, hours: 12, countries: 3, social_support: 100 }
            }
        };
        return fallbacks[fileName] || {};
    }

    async getSpeakers() {
        const data = await this.loadJSON('speakers');
        return data.speakers || [];
    }

    async getFeaturedSpeakers() {
        const data = await this.loadJSON('speakers');
        const speakers = data.speakers || [];
        const featuredIds = data.featured_speakers || [];
        return speakers.filter(speaker => featuredIds.includes(speaker.id));
    }

    async getSchedule() {
        const data = await this.loadJSON('schedule');
        return data.schedule || [];
    }

    async getEventInfo() {
        const data = await this.loadJSON('config');
        return data.event || {};
    }

    async getStatistics() {
        const data = await this.loadJSON('config');
        return data.statistics || {};
    }

    async getTopics() {
        const data = await this.loadJSON('schedule');
        return data.topics || [];
    }

    async getScheduleByType(type) {
        const schedule = await this.getSchedule();
        return schedule.filter(item => item.type === type);
    }

    async getSpeakerById(id) {
        const speakers = await this.getSpeakers();
        return speakers.find(speaker => speaker.id === parseInt(id));
    }

    async getSessionsBySpeaker(speakerId) {
        const schedule = await this.getSchedule();
        return schedule.filter(session => 
            session.speakers && session.speakers.includes(speakerId)
        );
    }

    // Métodos para manejar datos dinámicos (futuro)
    async updateSpeaker(speakerId, data) {
        // Placeholder para futuras actualizaciones
        console.log('Update speaker:', speakerId, data);
        return true;
    }

    async addRegistration(registrationData) {
        // Placeholder para registros
        console.log('Add registration:', registrationData);
        return { success: true, id: Date.now() };
    }

    // Método para validar integridad de datos
    async validateData() {
        try {
            const [speakers, schedule, config] = await Promise.all([
                this.getSpeakers(),
                this.getSchedule(),
                this.getEventInfo()
            ]);
            const issues = [];

            // Validar que todos los speakers referenciados existen
            schedule.forEach(session => {
                if (session.speakers) {
                    session.speakers.forEach(speakerId => {
                        if (!speakers.find(s => s.id === speakerId)) {
                            issues.push(`Speaker ${speakerId} referenciado en sesión ${session.id} no existe`);
                        }
                    });
                }
            });

            if (issues.length > 0) {
                console.warn('Problemas de integridad de datos:', issues);
            }

            return { valid: issues.length === 0, issues };
        } catch (error) {
            console.error('Error validating data:', error);
            return { valid: false, issues: ['Error de validación'] };
        }
    }
}

// Instancia global del servicio
const dataService = new DataService();