// assets/js/chatbot/chatbot.js

/**
 * Configuración del Chatbot para el Congreso de IA UPDS
 * Ubicación: /assets/js/chatbot/chatbot.js
 */

const ChatbotConfig = {
  // Colores principales
  primaryColor: '#1a237e',
  secondaryColor: '#283593',
  
  // Preguntas frecuentes
  questions: [
    {
      id: 1,
      question: "¿Cuándo y dónde se llevará a cabo el congreso?",
      answer: "El congreso será el 31 de julio de 2025 en el Hotel Avanti, Cochabamba, Bolivia."
    },
    {
      id: 2,
      question: "¿Quiénes pueden participar en el evento?",
      answer: "Estudiantes, docentes, investigadores y profesionales del área tecnológica."
    },
    {
      id: 3,
      question: "¿El evento contará con conferencistas invitados?",
      answer: "Sí, contaremos con expertos nacionales e internacionales en IA."
    }
  ],

  // Mensajes iniciales
  initialMessages: [
    {
      sender: 'bot',
      text: '¡Hola! Bienvenido al Congreso de IA UPDS 2025. ¿En qué puedo ayudarte?'
    }
  ]
};

class Chatbot {
  constructor(config) {
    this.config = config;
    this.state = {
      availableQuestions: [...config.questions],
      chatHistory: [...config.initialMessages]
    };
    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.render();
  }

  cacheElements() {
    this.elements = {
      toggle: document.getElementById('chatbot-toggler'),
      window: document.getElementById('chatbot-window'),
      closeBtn: document.getElementById('chatbot-close'),
      messagesContainer: document.getElementById('chatbot-messages'),
      messageList: document.getElementById('chatbot-message-list'),
      questionsContainer: document.getElementById('chatbot-questions')
    };
  }

  bindEvents() {
    this.elements.toggle.addEventListener('click', () => this.toggleChat());
    this.elements.closeBtn.addEventListener('click', () => this.closeChat());
  }

  render() {
    this.renderMessages();
    this.renderQuestions();
  }

  renderMessages() {
    this.elements.messageList.innerHTML = this.state.chatHistory.map((msg, i) => `
      <div class="chatbot-message ${msg.sender}" style="animation-delay: ${i * 0.1}s">
        ${msg.text}
      </div>
    `).join('');
    
    this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
  }

  renderQuestions() {
    this.elements.questionsContainer.innerHTML = this.state.availableQuestions.map(q => `
      <button class="chatbot-question-btn" data-id="${q.id}">
        ${q.question}
      </button>
    `).join('');
    
    document.querySelectorAll('.chatbot-question-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const questionId = parseInt(e.target.dataset.id);
        this.handleQuestion(questionId);
      });
    });
  }

  handleQuestion(id) {
    const question = this.config.questions.find(q => q.id === id);
    if (!question) return;

    this.addMessage('user', question.question);
    
    setTimeout(() => {
      this.addMessage('bot', question.answer);
      this.state.availableQuestions = this.state.availableQuestions.filter(q => q.id !== id);
      this.renderQuestions();
    }, 800);
  }

  addMessage(sender, text) {
    this.state.chatHistory.push({ sender, text });
    this.renderMessages();
  }

  toggleChat() {
    this.elements.window.classList.toggle('open');
    this.elements.toggle.classList.toggle('hide');
  }

  closeChat() {
    this.elements.window.classList.remove('open');
    setTimeout(() => {
      this.elements.toggle.classList.remove('hide');
    }, 300);
  }
}

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new Chatbot(ChatbotConfig);
});
