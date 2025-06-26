document.addEventListener('DOMContentLoaded', function() {
  // Configuración inicial
  if (window.chatbotInitialized) return;
  window.chatbotInitialized = true;

  // Base de conocimiento de preguntas y respuestas
  const knowledgeBase = {
    "saludo": {
      patterns: ["hola", "buenos días", "buenas tardes", "hi", "hello"],
      responses: [
        "¡Hola! Bienvenido al Congreso de IA UPDS 2025. ¿En qué puedo ayudarte?",
        "¡Hola! ¿Cómo puedo asistirte hoy?"
      ]
    },
    "agradecimiento": {
      patterns: ["gracias", "muchas gracias", "thanks", "thank you"],
      responses: [
        "¡De nada! Estoy aquí para ayudar.",
        "¡Es un placer ayudarte! ¿Necesitas algo más?"
      ]
    },
    "fecha": {
      patterns: ["cuándo es", "fecha del evento", "día del congreso"],
      responses: [
        "El congreso se realizará los días 15, 16 y 17 de octubre de 2025.",
        "Las fechas son del 15 al 17 de octubre de 2025."
      ]
    },
    "lugar": {
      patterns: ["dónde es", "ubicación", "lugar del evento", "dirección"],
      responses: [
        "El evento será en el Campus UPDS Cochabamba, Av. Irigoyen #1555, Zona Sarco.",
        "En la Universidad Privada Domingo Savio, Cochabamba."
      ]
    },
    "inscripcion": {
      patterns: ["cómo me inscribo", "inscripción", "registro", "participar"],
      responses: [
        "Puedes registrarte en nuestra sección de tickets o visitando upds.edu.bo/ciia",
        "Las inscripciones están disponibles en la pestaña 'Comprar entradas' de este sitio."
      ]
    },
    "default": {
      responses: [
        "Lo siento, no entendí tu pregunta. ¿Podrías reformularla?",
        "Todavía estoy aprendiendo. ¿Te importaría preguntar de otra forma?",
        "Pregunta sobre: fechas, ubicación o inscripciones para ayudarte mejor."
      ]
    }
  };

  // Elementos del DOM
  const elements = {
    toggler: document.getElementById('chatbot-toggler'),
    box: document.getElementById('chatbot-box'),
    closeBtn: document.getElementById('chatbot-close'),
    input: document.getElementById('chatbot-user-input'),
    sendBtn: document.getElementById('chatbot-send'),
    messages: document.getElementById('chatbot-messages')
  };

  // Validación de elementos
  if (Object.values(elements).some(el => !el)) {
    console.error('Error: Elementos del chatbot no encontrados');
    return;
  }

  // Event listeners
  elements.toggler.addEventListener('click', toggleChat);
  elements.closeBtn.addEventListener('click', closeChat);
  elements.input.addEventListener('keypress', (e) => e.key === 'Enter' && sendMessage());
  elements.sendBtn.addEventListener('click', sendMessage);

  // Funciones principales
  function toggleChat() {
    elements.box.classList.toggle('active');
    if (elements.box.classList.contains('active')) {
      elements.input.focus();
    }
  }

  function closeChat() {
    elements.box.classList.remove('active');
  }

  function sendMessage() {
    const message = elements.input.value.trim();
    if (!message) return;

    addMessage('user', message);
    elements.input.value = '';
    processMessage(message);
  }

  function addMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    messageElement.textContent = text;
    elements.messages.appendChild(messageElement);
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }

  function processMessage(message) {
    // Mostrar indicador de que el bot está escribiendo
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('chat-message', 'bot', 'typing');
    typingIndicator.textContent = '...';
    elements.messages.appendChild(typingIndicator);
    elements.messages.scrollTop = elements.messages.scrollHeight;

    // Simular tiempo de procesamiento
    setTimeout(() => {
      elements.messages.removeChild(typingIndicator);
      const response = getResponse(message.toLowerCase());
      addMessage('bot', response);
    }, 800);
  }

  function getResponse(message) {
    // Buscar coincidencia en la base de conocimiento
    for (const [intent, data] of Object.entries(knowledgeBase)) {
      if (intent === 'default') continue;
      
      const hasMatch = data.patterns.some(pattern => 
        message.includes(pattern.toLowerCase())
      );
      
      if (hasMatch) {
        return getRandomResponse(data.responses);
      }
    }
    
    // Respuesta por defecto si no hay coincidencia
    return getRandomResponse(knowledgeBase.default.responses);
  }

  function getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Mensaje inicial de bienvenida
  setTimeout(() => {
    addMessage('bot', getRandomResponse(knowledgeBase.saludo.responses));
  }, 1000);
});
