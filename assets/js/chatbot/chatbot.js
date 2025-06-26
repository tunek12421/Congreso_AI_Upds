// assets/js/chatbot/chatbot.js

/**
 * CHATBOT PARA CONGRESO DE INTELIGENCIA ARTIFICIAL UPDS
 * Versión: 2.0
 * Fecha: 15/07/2024
 * 
 * Características:
 * - Preguntas y respuestas predeterminadas
 * - Interfaz intuitiva con animaciones
 * - Diseño responsive
 * - Fácil mantenimiento y extensión
 */

// Configuración principal del chatbot
const CHATBOT_CONFIG = {
  // Apariencia
  colors: {
    primary: '#1a237e',
    secondary: '#283593',
    userMessage: '#e3e7fd',
    botMessage: '#ffffff'
  },
  
  // Comportamiento
  animationSpeed: 300, // ms
  typingDelay: 800, // ms
  
  // Contenido
  welcomeMessage: '¡Hola! Bienvenido al Congreso de IA UPDS 2025. ¿En qué puedo ayudarte?',
  
  // Preguntas frecuentes
  questions: [
    {
      id: 1,
      question: "¿Cuándo y dónde se llevará a cabo el congreso?",
      answer: `El Segundo Congreso de Inteligencia Artificial se realizará los días <strong>15-17 de octubre de 2025</strong> en el <strong>Campus UPDS Cochabamba</strong>, ubicado en Av. Irigoyen #1555, Zona Sarco.<br><br>
              El horario será de <strong>8:30 a 18:30</strong> los tres días.`
    },
    {
      id: 2,
      question: "¿Quiénes pueden participar en el evento?",
      answer: `El congreso está abierto a:<br>
              • Estudiantes universitarios<br>
              • Docentes e investigadores<br>
              • Profesionales del sector tecnológico<br>
              • Público general interesado en IA<br><br>
              No se requieren conocimientos previos.`
    },
    {
      id: 3,
      question: "¿El evento contará con conferencistas invitados?",
      answer: `Sí, contaremos con destacados expertos:<br><br>
              <strong>Conferencistas internacionales:</strong><br>
              • Dr. Carlos Pérez (España) - IA aplicada a salud<br>
              • Dra. Laura Méndez (México) - Ética en IA<br><br>
              <strong>Expositores nacionales:</strong><br>
              • Ing. Marco Fernández - Machine Learning<br>
              • Dra. Ana Rodríguez - Visión por computadora`
    },
    {
      id: 4,
      question: "¿Cómo puedo registrarme?",
      answer: `Puedes registrarte de dos formas:<br><br>
              1. <strong>En línea:</strong> Visita <a href="#tickets" style="color:#1a237e;font-weight:bold;">la sección de tickets</a> en nuestro sitio web<br>
              2. <strong>Presencial:</strong> En las oficinas de UPDS Cochabamba<br><br>
              Costos:<br>
              • Estudiantes: Bs. 150<br>
              • Profesionales: Bs. 300`
    }
  ]
};

class CongresoChatbot {
  constructor(config) {
    this.config = config;
    this.state = {
      isOpen: false,
      availableQuestions: [...config.questions],
      chatHistory: [
        {
          sender: 'bot',
          text: config.welcomeMessage,
          timestamp: new Date()
        }
      ]
    };
    
    // Inicialización
    this.cacheDOM();
    this.bindEvents();
    this.render();
  }

  // Cachear elementos del DOM
  cacheDOM() {
    this.dom = {
      container: document.getElementById('chatbot-container'),
      toggleBtn: document.getElementById('chatbot-toggler'),
      window: document.getElementById('chatbot-window'),
      closeBtn: document.getElementById('chatbot-close'),
      messagesContainer: document.getElementById('chatbot-messages'),
      messageList: document.getElementById('chatbot-message-list'),
      questionsContainer: document.getElementById('chatbot-questions')
    };
  }

  // Vincular eventos
  bindEvents() {
    this.dom.toggleBtn.addEventListener('click', () => this.toggleChat());
    this.dom.closeBtn.addEventListener('click', () => this.closeChat());
    
    // Delegación de eventos para preguntas rápidas
    this.dom.questionsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('chatbot-question-btn')) {
        const questionId = parseInt(e.target.dataset.id);
        this.handleQuestion(questionId);
      }
    });
  }

  // Renderizar la interfaz
  render() {
    this.renderMessages();
    this.renderQuestions();
  }

  // Renderizar mensajes
  renderMessages() {
    this.dom.messageList.innerHTML = this.state.chatHistory
      .map((msg, index) => this.createMessageElement(msg, index))
      .join('');
    
    this.scrollToBottom();
  }

  // Crear elemento de mensaje
  createMessageElement(message, index) {
    return `
      <div class="chatbot-message ${message.sender}" 
           style="animation-delay: ${index * 0.1}s">
        ${message.text}
        <div class="message-time">${this.formatTime(message.timestamp)}</div>
      </div>
    `;
  }

  // Renderizar preguntas disponibles
  renderQuestions() {
    this.dom.questionsContainer.innerHTML = this.state.availableQuestions
      .map(q => `
        <button class="chatbot-question-btn" 
                data-id="${q.id}"
                style="animation-delay: ${q.id * 0.1}s">
          ${q.question}
        </button>
      `)
      .join('');
  }

  // Manejar pregunta seleccionada
  handleQuestion(questionId) {
    const question = this.config.questions.find(q => q.id === questionId);
    if (!question) return;

    // Agregar pregunta del usuario
    this.addMessage('user', question.question);
    
    // Simular "escribiendo..."
    this.showTypingIndicator();
    
    // Responder después de un delay
    setTimeout(() => {
      this.removeTypingIndicator();
      this.addMessage('bot', question.answer);
      
      // Eliminar pregunta de las disponibles
      this.state.availableQuestions = this.state.availableQuestions
        .filter(q => q.id !== questionId);
      
      this.renderQuestions();
    }, this.config.typingDelay);
  }

  // Mostrar indicador de "escribiendo"
  showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.className = 'chatbot-message bot typing';
    typingElement.innerHTML = '...';
    this.dom.messageList.appendChild(typingElement);
    this.scrollToBottom();
  }

  // Eliminar indicador de "escribiendo"
  removeTypingIndicator() {
    const typingElements = this.dom.messageList.querySelectorAll('.typing');
    typingElements.forEach(el => el.remove());
  }

  // Agregar nuevo mensaje
  addMessage(sender, text) {
    this.state.chatHistory.push({
      sender,
      text,
      timestamp: new Date()
    });
    
    this.renderMessages();
  }

  // Formatear hora del mensaje
  formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  // Auto-scroll al final
  scrollToBottom() {
    this.dom.messagesContainer.scrollTop = this.dom.messagesContainer.scrollHeight;
  }

  // Alternar visibilidad del chat
  toggleChat() {
    this.state.isOpen = !this.state.isOpen;
    
    if (this.state.isOpen) {
      this.dom.window.classList.add('open');
      this.dom.toggleBtn.classList.add('hide');
      this.dom.messagesContainer.focus();
    } else {
      this.closeChat();
    }
  }

  // Cerrar el chat
  closeChat() {
    this.dom.window.classList.remove('open');
    
    setTimeout(() => {
      this.dom.toggleBtn.classList.remove('hide');
    }, this.config.animationSpeed);
  }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const chatbot = new CongresoChatbot(CHATBOT_CONFIG);
  
  // Opcional: Hacer el chatbot accesible globalmente
  window.CongresoChatbot = chatbot;
});
