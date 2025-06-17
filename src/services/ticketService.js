class TicketService {
    constructor() {
        this.providers = {
            eventbrite: {
                name: 'Eventbrite',
                url: 'https://www.eventbrite.com/e/congreso-ia-upds-tickets',
                available: true,
                maxQuantity: 5
            },
        };
        this.ticketTypes=[{
                id: 'student',
                name: 'Externos',
                description: 'Personas o instituciones ajenas a la UPDS',
                //price: 25,
                price_profesional: 120,
                price_student: 80,
                currency: 'Bs',
                ticketListTitle: 'Ejemplos',
                ticketList: [
                    'Proveedores, contratistas o colaboradores externos',
                    'Padres de familia',
                    'Empresas o organizaciones que solicitan servicios o información',
                ],
                available: true,
                maxQuantity: 3,
            },
            {
                id: 'upds',
                name: 'Comunidad UPDS',
                description: 'Miembros activos de la universidad con acceso a beneficios o servicios internos.',
                //price: 100,
                price_profesional: 80,
                price_student: 50,
                currency: 'Bs',
                ticketListTitle: 'Incluye',
                ticketList: [
                    'Estudiantes',
                    'Docentes y personal administrativo',
                    'Egresados',
                    'Investigadores o becarios asociados',
                ],
                
                available: true,
                maxQuantity: 2,
                //limited: true,
                quantity: 50,
                requirements: 'Presentar carnet estudiantil vigente'
            },
            {
                id: 'extranjeros',
                name: 'Extranjeros',
                description: 'Usuarios internacionales que interactúan con la UPDS',
                price: 100,
                price_profesional: 20,
                price_student: 10,
                currency: 'USD',
                ticketListTitle: 'Casos de uso',
                ticketList: [
                    'Estudiantes de intercambio',
                    'Profesores visitantes o investigadores foráneos',
                    'Postulantes a matrícula desde el exterior',
                    'Trámites de visa o documentación para extranjeros',
                ],
                available: true,
                maxQuantity: 2,
                //limited: true,
                quantity: 50
            }
        ];
    }

    getAvailableProviders() {
        return Object.entries(this.providers)
            .filter(([key, provider]) => provider.available)
            .map(([key, provider]) => ({ id: key, ...provider }));
    }

    getPrimaryProvider() {
        const providers = this.getAvailableProviders();
        return providers.find(p => p.primary) || providers[0];
    }

    getTicketTypes() {
        return this.ticketTypes.filter(ticket => ticket.available);
    }

    getTicketById(id) {
        return this.ticketTypes.find(ticket => ticket.id === id);
    }

    generateEventbriteUrl(ticketType = 'general') {
        const baseUrl = this.providers.eventbrite.url;
        if (!baseUrl) return null;
        
        // En una implementación real, aquí se agregarían parámetros específicos
        return `${baseUrl}?ticket_type=${ticketType}`;
    }

    async initializeStripe(ticketType) {
        // Placeholder para integración con Stripe
        console.log('Initializing Stripe for ticket:', ticketType);
        
        // En una implementación real:
        // const stripe = Stripe('pk_test_...');
        // return stripe.redirectToCheckout({ sessionId: sessionId });
        
        return {
            success: false,
            message: 'Stripe no configurado aún'
        };
    }

    generateManualRegistrationEmail(ticketData) {
        const subject = encodeURIComponent('Registro Congreso IA - UPDS');
        const body = encodeURIComponent(`
Estimado equipo organizador,

Deseo registrarme para el 1er Congreso de Inteligencia Artificial.

Datos del solicitante:
- Nombre completo: [Completar]
- Email: [Completar]
- Teléfono: [Completar]
- Institución: [Completar]
- Tipo de entrada: ${ticketData.name}
- Cantidad: [Completar]

Adjunto comprobante de pago si corresponde.

Saludos cordiales,
[Su nombre]
        `);
        
        return `mailto:congreso@upds.edu.bo?subject=${subject}&body=${body}`;
    }

    async processTicketPurchase(provider, ticketType, quantity = 1, userData = {}) {
        try {
            switch (provider) {
                case 'eventbrite':
                    return this.processEventbrite(ticketType, quantity);
                    
                case 'stripe':
                    return await this.processStripe(ticketType, quantity, userData);
                    
                case 'manual':
                    return this.processManual(ticketType, quantity);
                    
                default:
                    throw new Error('Proveedor no soportado');
            }
        } catch (error) {
            console.error('Error processing ticket purchase:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    processEventbrite(ticketType, quantity) {
        const url = this.generateEventbriteUrl(ticketType);
        if (url) {
            window.open(url, '_blank');
            return { success: true, provider: 'eventbrite' };
        }
        return { success: false, error: 'URL de Eventbrite no disponible' };
    }

    async processStripe(ticketType, quantity, userData) {
        // Placeholder para Stripe
        const result = await this.initializeStripe(ticketType);
        return result;
    }

    processManual(ticketType, quantity) {
        const ticket = this.getTicketById(ticketType);
        const url = this.generateManualRegistrationEmail(ticket);
        window.location.href = url;
        return { success: true, provider: 'manual' };
    }

    calculateTotal(ticketType, quantity) {
        const ticket = this.getTicketById(ticketType);
        if (!ticket) return 0;
        
        return {
            subtotal: ticket.price * quantity,
            tax: 0, // Sin impuestos por ser evento benéfico
            total: ticket.price * quantity,
            currency: ticket.currency
        };
    }

    validatePurchase(ticketType, quantity, userData = {}) {
        const errors = [];
        
        const ticket = this.getTicketById(ticketType);
        if (!ticket) {
            errors.push('Tipo de entrada no válido');
            return { valid: false, errors };
        }
        
        if (!ticket.available) {
            errors.push('Este tipo de entrada no está disponible');
        }
        
        if (quantity < 1) {
            errors.push('La cantidad debe ser mayor a 0');
        }
        
        if (quantity > ticket.maxQuantity) {
            errors.push(`Máximo ${ticket.maxQuantity} entradas por compra`);
        }
        
        if (ticket.limited && ticket.quantity <= 0) {
            errors.push('Entradas agotadas para este tipo');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    async getTicketStatus() {
        // Placeholder para obtener status en tiempo real
        return {
            general: { available: 450, sold: 50 },
            student: { available: 200, sold: 25 },
            vip: { available: 45, sold: 5 }
        };
    }

    // Método para webhooks (futuro)
    async handleWebhook(provider, data) {
        console.log(`Webhook from ${provider}:`, data);
        // Procesar confirmaciones de pago, actualizaciones, etc.
        return { processed: true };
    }
}

// Instancia global del servicio
const ticketService = new TicketService();/* true,
                primary: true
            },
            stripe: {
                name: 'Stripe',
                url: null, // Se configurará después
                available: false,
                primary: false
            },
            manual: {
                name: 'Registro Manual',
                url: 'mailto:congreso@upds.edu.bo',
                available: true,
                primary: false
            }
        };

        this.ticketTypes = [
            {
                id: 'general',
                name: 'Entrada General',
                description: 'Acceso completo al congreso',
                price: 50,
                currency: 'BOB',
                benefits: [
                    'Acceso a todas las conferencias',
                    'Material del evento',
                    'Certificado de participación',
                    'Coffee breaks incluidos',
                    'Almuerzo incluido'
                ],
                available:*/