class TicketSectionComponent {
    constructor(container) {
        this.container = container;
        this.ticketTypes = [];
        this.selectedTicket = null;
        this.quantity = 1;
    }

    async init() {
        try {
            this.ticketTypes = ticketService.getTicketTypes();
            this.render();
            this.bindEvents();
            this.updateTicketStatus();
        } catch (error) {
            console.error('Error initializing tickets:', error);
            this.renderError();
        }
    }

    render() {
        if (!this.container) return;

        const ticketsHTML = `
            <!--div class="tickets-header">
                <div class="social-impact-banner">
                    <div class="impact-icon">
                        <i class="fas fa-heart"></i>
                    </div>
                    <div class="impact-text">
                        <h3>100% Solidario</h3>
                        <p>Todas las entradas apoyan a la Casa de Acogida Mujer Águila</p>
                    </div>
                </div>
            </div-->
            <div class="tickets-grid">
                ${this.ticketTypes.map(ticket => this.createTicketCard(ticket)).join('')}
            </div>
            <!--div class="payment-providers">
                <h3>Métodos de Pago Disponibles</h3>
                <div class="providers-list">
                    ${this.createProvidersButtons()}
                </div>
            </div>
            <div class="purchase-summary" id="purchase-summary" style="display: none;">
                ${this.createPurchaseSummary()}
            </div-->
        `;

        this.container.innerHTML = ticketsHTML;
        this.applyAnimations();
    }

    createTicketCard(ticket) {
        const benefitsHTML = ticket.ticketList.map(benefit => 
            `<li><i class="fas fa-check"></i> ${benefit}</li>`
        ).join('');

        const isPopular = ticket.id === 'general';
        const isLimited = ticket.limited;

        return `
            <div class="ticket-card ${isPopular ? 'popular' : ''} ${isLimited ? 'limited' : ''}" data-ticket-id="${ticket.id}">
                ${isPopular ? '<div class="popular-badge">Más Popular</div>' : ''}
                ${isLimited ? '<div class="limited-badge">Limitado</div>' : ''}
                
                <div class="ticket-header">
                    <h3 class="ticket-name">${ticket.name}</h3>
                    <div class="ticket-group">
                        <div class="ticket-price">
                            <h4>Precio:</h4>
                            <span class="currency">${ticket.currency}</span>
                            <span class="amount">${ticket.price}</span>
                        </div>
                    </div>
                    <!--div class="ticket-price">
                        <span class="currency">Bs</span>
                        <span class="amount">${ticket.price}</span>
                    </div-->
                    <p class="ticket-description">${ticket.description}</p>
                </div>

                <div class="ticket-benefits">
                    <h4>${ticket.ticketListTitle}:</h4>
                    <ul>
                        ${benefitsHTML}
                    </ul>
                </div>

                ${ticket.requirements ? `
                    <div class="ticket-requirements">
                        <p><i class="fas fa-info-circle"></i> ${ticket.requirements}</p>
                    </div>
                ` : ''}

                <!--div class="ticket-quantity">
                    <label>Cantidad:</label>
                    <div class="quantity-selector">
                        <button class="qty-btn minus" data-ticket-id="${ticket.id}">-</button>
                        <input type="number" class="quantity-input" 
                               value="1" min="1" max="${ticket.maxQuantity}" 
                               data-ticket-id="${ticket.id}">
                        <button class="qty-btn plus" data-ticket-id="${ticket.id}">+</button>
                    </div>
                    <span class="max-qty">Máx: ${ticket.maxQuantity}</span>
                </div>

                <div class="ticket-total">
                    <span class="total-label">Total:</span>
                    <span class="total-amount" data-ticket-id="${ticket.id}">Bs ${ticket.price}</span>
                </div-->

                <button class="btn-select-ticket ${ticket.available ? '' : 'disabled'}" 
                        data-ticket-id="${ticket.id}"
                        ${!ticket.available ? 'disabled' : ''}>
                    ${ticket.available ? 
                        '<i class="fas fa-ticket-alt"></i> Comprar aquí' : 
                        '<i class="fas fa-times"></i> No Disponible'
                    }
                </button>

                ${isLimited && ticket.quantity ? `
                    <!--div class="availability-indicator">
                        <div class="availability-bar">
                            <div class="availability-fill" style="width: ${(ticket.quantity / 50) * 100}%"></div>
                        </div>
                        <span class="availability-text">Quedan ${ticket.quantity} entradas</span>
                    </div-->
                ` : ''}
            </div>
        `;
    }

    createProvidersButtons() {
        const providers = ticketService.getAvailableProviders();
        
        return providers.map(provider => `
            <button class="provider-btn ${provider.primary ? 'primary' : ''}" 
                    data-provider="${provider.id}">
                <div class="provider-info">
                    <i class="fas fa-${this.getProviderIcon(provider.id)}"></i>
                    <span>${provider.name}</span>
                </div>
                ${provider.primary ? '<span class="recommended">Recomendado</span>' : ''}
            </button>
        `).join('');
    }

    getProviderIcon(providerId) {
        const icons = {
            'eventbrite': 'calendar-alt',
            'stripe': 'credit-card',
            'manual': 'envelope'
        };
        return icons[providerId] || 'shopping-cart';
    }

    createPurchaseSummary() {
        return `
            <!--div class="summary-header">
                <h3><i class="fas fa-shopping-cart"></i> Resumen de Compra</h3>
            </div>
            <div class="summary-details" id="summary-details">
            </div>
            <div class="summary-actions">
                <button class="btn btn-secondary" id="btn-clear-selection">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                <button class="btn btn-primary" id="btn-proceed-payment">
                    <i class="fas fa-credit-card"></i> Proceder al Pago
                </button>
            </div-->
        `;
    }

    bindEvents() {
        // Selectores de cantidad
        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('qty-btn')) {
                const ticketId = e.target.dataset.ticketId;
                const isIncrement = e.target.classList.contains('plus');
                this.updateQuantity(ticketId, isIncrement);
            }

            // Selección de ticket
            if (e.target.closest('.btn-select-ticket')) {
                const ticketId = e.target.closest('.btn-select-ticket').dataset.ticketId;
                this.selectTicket(ticketId);
            }

            // Proveedores de pago
            if (e.target.closest('.provider-btn')) {
                const providerId = e.target.closest('.provider-btn').dataset.provider;
                this.selectProvider(providerId);
            }

            // Acciones del resumen
            if (e.target.closest('#btn-clear-selection')) {
                this.clearSelection();
            }

            if (e.target.closest('#btn-proceed-payment')) {
                this.proceedToPayment();
            }
        });

        // Input de cantidad
        this.container.addEventListener('input', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const ticketId = e.target.dataset.ticketId;
                const quantity = parseInt(e.target.value) || 1;
                this.setQuantity(ticketId, quantity);
            }
        });

        // Actualizar totales en tiempo real
        this.container.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                this.updateTotals();
            }
        });
    }

    updateQuantity(ticketId, increment) {
        const input = this.container.querySelector(`input[data-ticket-id="${ticketId}"]`);
        const ticket = ticketService.getTicketById(ticketId);
        
        let newValue = parseInt(input.value) + (increment ? 1 : -1);
        newValue = Math.max(1, Math.min(newValue, ticket.maxQuantity));
        
        input.value = newValue;
        this.updateTicketTotal(ticketId, newValue);
    }

    setQuantity(ticketId, quantity) {
        const ticket = ticketService.getTicketById(ticketId);
        const validQuantity = Math.max(1, Math.min(quantity, ticket.maxQuantity));
        
        const input = this.container.querySelector(`input[data-ticket-id="${ticketId}"]`);
        input.value = validQuantity;
        
        this.updateTicketTotal(ticketId, validQuantity);
    }

    updateTicketTotal(ticketId, quantity) {
        const ticket = ticketService.getTicketById(ticketId);
        const total = ticket.price * quantity;
        
        const totalElement = this.container.querySelector(`[data-ticket-id="${ticketId}"].total-amount`);
        if (totalElement) {
            totalElement.textContent = `Bs ${total}`;
        }
    }
    selectTicket(id){
        if(!window.open("https://clicket.bo/"))
            window.location.href = "https://clicket.bo";
    }
    /*selectTicket(ticketId) {
        // Remover selección previa
        this.container.querySelectorAll('.ticket-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Seleccionar nuevo ticket
        const ticketCard = this.container.querySelector(`[data-ticket-id="${ticketId}"].ticket-card`);
        ticketCard.classList.add('selected');

        this.selectedTicket = ticketId;
        this.showPurchaseSummary();
    }*/

    showPurchaseSummary() {
        if (!this.selectedTicket) return;

        const ticket = ticketService.getTicketById(this.selectedTicket);
        const input = this.container.querySelector(`input[data-ticket-id="${this.selectedTicket}"]`);
        const quantity = parseInt(input.value);
        const calculation = ticketService.calculateTotal(this.selectedTicket, quantity);

        const summaryElement = this.container.querySelector('#purchase-summary');
        const detailsElement = this.container.querySelector('#summary-details');

        detailsElement.innerHTML = `
            <div class="summary-item">
                <span class="item-name">${ticket.name}</span>
                <span class="item-quantity">x${quantity}</span>
                <span class="item-price">Bs ${ticket.price * quantity}</span>
            </div>
            <div class="summary-subtotal">
                <span>Subtotal:</span>
                <span>Bs ${calculation.subtotal}</span>
            </div>
            <div class="summary-tax">
                <span>Impuestos:</span>
                <span>Bs ${calculation.tax}</span>
            </div>
            <div class="summary-total">
                <span>Total:</span>
                <span>Bs ${calculation.total}</span>
            </div>
            <div class="social-impact-reminder">
                <i class="fas fa-heart"></i>
                <span>Tu compra apoya directamente a la Casa de Acogida Mujer Águila</span>
            </div>
        `;

        summaryElement.style.display = 'block';
        summaryElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    selectProvider(providerId) {
        // Actualizar UI de proveedores
        this.container.querySelectorAll('.provider-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        const selectedBtn = this.container.querySelector(`[data-provider="${providerId}"]`);
        selectedBtn.classList.add('selected');

        this.selectedProvider = providerId;
    }

    async proceedToPayment() {
        if (!this.selectedTicket) {
            this.showToast('Por favor selecciona un tipo de entrada', 'warning');
            return;
        }

        if (!this.selectedProvider) {
            // Usar proveedor primario por defecto
            this.selectedProvider = ticketService.getPrimaryProvider().id;
        }

        const input = this.container.querySelector(`input[data-ticket-id="${this.selectedTicket}"]`);
        const quantity = parseInt(input.value);

        // Validar compra
        const validation = ticketService.validatePurchase(this.selectedTicket, quantity);
        if (!validation.valid) {
            this.showToast(validation.errors.join(', '), 'error');
            return;
        }

        // Mostrar loading
        const proceedBtn = this.container.querySelector('#btn-proceed-payment');
        const originalText = proceedBtn.innerHTML;
        proceedBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        proceedBtn.disabled = true;

        try {
            const result = await ticketService.processTicketPurchase(
                this.selectedProvider,
                this.selectedTicket,
                quantity
            );

            if (result.success) {
                this.showToast('Redirigiendo al pago...', 'success');
                
                // Analytics/tracking aquí si es necesario
                this.trackPurchaseAttempt(this.selectedTicket, quantity, this.selectedProvider);
            } else {
                this.showToast(result.error || 'Error procesando la compra', 'error');
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            this.showToast('Error al procesar el pago', 'error');
        } finally {
            // Restaurar botón
            proceedBtn.innerHTML = originalText;
            proceedBtn.disabled = false;
        }
    }

    clearSelection() {
        this.container.querySelectorAll('.ticket-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        this.container.querySelectorAll('.provider-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        const summaryElement = this.container.querySelector('#purchase-summary');
        summaryElement.style.display = 'none';

        this.selectedTicket = null;
        this.selectedProvider = null;
    }

    async updateTicketStatus() {
        try {
            const status = await ticketService.getTicketStatus();
            
            // Actualizar indicadores de disponibilidad
            Object.entries(status).forEach(([ticketId, data]) => {
                const availabilityElement = this.container.querySelector(`[data-ticket-id="${ticketId}"] .availability-text`);
                if (availabilityElement) {
                    availabilityElement.textContent = `Quedan ${data.available} entradas`;
                }

                const fillElement = this.container.querySelector(`[data-ticket-id="${ticketId}"] .availability-fill`);
                if (fillElement && ticketId === 'vip') {
                    const percentage = (data.available / 50) * 100;
                    fillElement.style.width = `${percentage}%`;
                }
            });
        } catch (error) {
            console.error('Error updating ticket status:', error);
        }
    }

    trackPurchaseAttempt(ticketType, quantity, provider) {
        // Placeholder para analytics
        console.log('Purchase attempt:', {
            ticketType,
            quantity,
            provider,
            timestamp: new Date().toISOString()
        });
    }

    applyAnimations() {
        const cards = this.container.querySelectorAll('.ticket-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.2}s`;
            card.classList.add('fade-in');
        });
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 4000);
    }

    renderError() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar información de tickets</h3>
                <p>No se pudo cargar la información de las entradas. Por favor, contacta directamente:</p>
                <a href="mailto:congreso@upds.edu.bo" class="btn btn-primary">
                    <i class="fas fa-envelope"></i>
                    Contactar por Email
                </a>
            </div>
        `;
    }

    // Método para promociones especiales
    applyPromoCode(code) {
        // Placeholder para códigos promocionales
        const validCodes = {
            'ESTUDIANTE10': { discount: 0.1, type: 'percentage' },
            'UPDS2024': { discount: 15, type: 'fixed' }
        };

        if (validCodes[code.toUpperCase()]) {
            this.showToast('Código promocional aplicado', 'success');
            return validCodes[code.toUpperCase()];
        } else {
            this.showToast('Código promocional no válido', 'error');
            return null;
        }
    }
}