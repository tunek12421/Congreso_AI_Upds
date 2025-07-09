const fields = [1, 60, 60, 24, 365];

class Countdown {
    constructor(date, target, liveTarget) {
        this.date = date.getTime();
        this.target = target;
        this.counterNodes = target.querySelectorAll("li");
        this.liveTarget = liveTarget;
        this.previousValues = [-1, -1, -1, -1]; // Para detectar cambios
        this.isInitialized = false;
        this.digitElements = []; // Almacenar referencias a los elementos
    }
    
    // Crear estructura HTML para dígito flip
    createFlipDigit(value) {
        return `<span class="flip-clock-wrapper">
            <span class="flip-clock-digit">
                <span class="digit">${value}</span>
            </span>
        </span>`;
    }
    
    // Convertir número a dígitos flip
    formatNumberWithFlip(number) {
        const strNum = number.toString().padStart(2, '0');
        return strNum.split('').map(digit => this.createFlipDigit(digit)).join('');
    }
    
    // Animar cambio de dígito de forma segura
    animateDigitChange(element, newValue) {
        if (!element || !element.querySelector) return;
        
        const digit = element.querySelector('.digit');
        if (!digit) return;
        
        // Asegurar que el elemento existe antes de añadir clase
        if (element.classList) {
            element.classList.add('flip');
        }
        
        // Cambiar el valor a mitad de la animación
        setTimeout(() => {
            if (digit && digit.textContent !== undefined) {
                digit.textContent = newValue;
            }
        }, 300);
        
        // Remover clase de animación
        setTimeout(() => {
            if (element && element.classList) {
                element.classList.remove('flip');
            }
        }, 600);
    }
    
    // Inicializar estructura de dígitos
    initializeDigits() {
        this.counterNodes.forEach((node, index) => {
            const counterNumber = node.querySelector('.counter-number');
            if (counterNumber) {
                // Guardar referencia al elemento
                this.digitElements[index] = counterNumber;
                
                // Inicializar con valor 0
                const initialValue = 0;
                counterNumber.innerHTML = this.formatNumberWithFlip(initialValue);
                
                // Asegurar que el elemento es visible
                counterNumber.style.opacity = '1';
                counterNumber.style.visibility = 'visible';
            }
        });
        this.isInitialized = true;
    }
    
    // Actualizar display con animación y verificación
    updateDisplay(index, value) {
        // Verificar que el índice es válido
        if (index < 0 || index >= this.digitElements.length) return;
        
        const counterNumber = this.digitElements[index];
        if (!counterNumber) return;
        
        // Asegurar que el valor es un número válido
        const numValue = parseInt(value) || 0;
        const newValueStr = numValue.toString().padStart(2, '0');
        
        if (!this.isInitialized) {
            // Primera vez: crear estructura sin animación
            counterNumber.innerHTML = this.formatNumberWithFlip(numValue);
            return;
        }
        
        // Obtener dígitos actuales
        const currentDigits = counterNumber.querySelectorAll('.flip-clock-digit');
        
        // Si no hay dígitos o la cantidad cambió, recrear
        if (!currentDigits || currentDigits.length === 0 || currentDigits.length !== newValueStr.length) {
            counterNumber.innerHTML = this.formatNumberWithFlip(numValue);
            return;
        }
        
        // Animar solo los dígitos que cambiaron
        newValueStr.split('').forEach((newDigit, digitIndex) => {
            if (digitIndex < currentDigits.length) {
                const currentDigitElement = currentDigits[digitIndex];
                const digitSpan = currentDigitElement?.querySelector('.digit');
                
                if (digitSpan && digitSpan.textContent !== newDigit) {
                    this.animateDigitChange(currentDigitElement, newDigit);
                }
            }
        });
    }
    
    countDown() {
        let div = 1;
        let time = Math.floor((this.date - Date.now()) / 1000);
        
        if (time < 0) {
            time = 0;
            this.createLive();
            clearInterval(this.ID);
            return;
        }
        
        // Array para almacenar los valores calculados
        const values = [];
        
        for (let i = 0; i < fields.length - 1; i++) {
            const value = Math.floor(time / div) % fields[i + 1];
            values.push(value);
            div *= fields[i + 1];
        }
        
        // Actualizar displays en orden inverso (días, horas, minutos, segundos)
        for (let i = 0; i < values.length; i++) {
            const nodeIndex = fields.length - 2 - i;
            const value = values[i];
            
            // Solo actualizar si el valor cambió
            if (value !== this.previousValues[nodeIndex]) {
                this.updateDisplay(nodeIndex, value);
                this.previousValues[nodeIndex] = value;
            }
        }
        
        // Marcar como inicializado después de la primera ejecución
        if (!this.isInitialized) {
            this.isInitialized = true;
        }
    }
    
    async createLive() {
        // Añadir efecto de transición dramático
        const counterCard = this.target.querySelector(".counter-card");
        if (counterCard) {
            counterCard.style.transform = "scale(0.8)";
            counterCard.style.opacity = "0";
            
            setTimeout(() => {
                counterCard.classList.add("counter-hide");
                this.liveTarget.classList.add("counter-live");
                this.liveTarget.innerHTML = `
                    <a href="www.facebook.com" target="_blank">
                        <i class="fa-brands fa-facebook"></i> Ver transmisión <span class="live-icon"></span>
                    </a>`;
            }, 300);
        }
    }
    
    display() {
        // Inicializar estructura de dígitos primero
        this.initializeDigits();
        
        // Ejecutar inmediatamente para mostrar valores iniciales
        this.countDown();
        
        // Luego ejecutar cada segundo
        this.ID = setInterval(() => {
            this.countDown();
        }, 1000);
    }
}

// Configuración e inicialización
const date = "Jul 31, 2025 12:00:00";
const counter = document.getElementById("counter");

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio === 1) {
                // Añadir pequeño delay para efecto dramático
                setTimeout(() => {
                    const counterElement = document.getElementById("counter");
                    const liveElement = document.getElementById("counter-live");
                    
                    if (counterElement && liveElement) {
                        let countDown = new Countdown(new Date(date), counterElement, liveElement);
                        countDown.display();
                    }
                }, 300);
                observer.unobserve(counter);
            }
        });
    }, 
    { threshold: 1.0 }
);

// Función de inicialización con efecto de entrada
async function init() {
    const counterElement = document.getElementById("counter");
    if (!counterElement) return;
    
    // Preparar el contador con opacidad 0
    const counterCard = counterElement.querySelector('.counter-card');
    if (counterCard) {
        counterCard.style.opacity = '0';
        counterCard.style.transform = 'scale(0.9)';
        
        // Animar entrada cuando sea visible
        setTimeout(() => {
            counterCard.style.transition = 'all 0.8s cubic-bezier(0.23, 1, 0.320, 1)';
            counterCard.style.opacity = '1';
            counterCard.style.transform = 'scale(1)';
        }, 100);
    }
    
    // Asegurar que todos los elementos necesarios existen
    const counterNumbers = counterElement.querySelectorAll('.counter-number');
    counterNumbers.forEach(num => {
        num.style.opacity = '1';
        num.style.visibility = 'visible';
        // Inicializar con guiones si está vacío
        if (!num.innerHTML.trim()) {
            num.innerHTML = '--';
        }
    });
    
    observer.observe(counterElement);
}

export { init };