document.addEventListener('DOMContentLoaded', function() {
  // Verificar si el chatbot ya está inicializado
  if (window.chatbotInitialized) return;
  window.chatbotInitialized = true;

  // Elementos del DOM
  const elements = {
    toggler: document.getElementById('chatbot-toggler'),
    box: document.getElementById('chatbot-box'),
    closeBtn: document.getElementById('chatbot-close'),
    input: document.getElementById('chatbot-user-input'),
    sendBtn: document.getElementById('chatbot-send'),
    messages: document.getElementById('chatbot-messages')
  };

  // Validar que todos los elementos existan
  if (Object.values(elements).some(el => !el)) {
    console.error('Error: Elementos del chatbot no encontrados');
    return;
  }

  // Control de visibilidad con animación
  let isAnimating = false;

  elements.toggler.addEventListener('click', function() {
    if (isAnimating) return;
    
    isAnimating = true;
    elements.box.classList.toggle('active');
    
    setTimeout(() => {
      isAnimating = false;
    }, 300);
  });

  elements.closeBtn.addEventListener('click', function() {
    if (isAnimating) return;
    
    isAnimating = true;
    elements.box.classList.remove('active');
    
    setTimeout(() => {
      isAnimating = false;
    }, 300);
  });

  // Manejo del input y envío de mensajes
  elements.input.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  elements.sendBtn.addEventListener('click', sendMessage);

  function sendMessage() {
    const message = elements.input.value.trim();
    if (message) {
      addMessage('user', message);
      elements.input.value = '';
      // Aquí iría la lógica para procesar la respuesta
      simulateResponse(message);
    }
  }

  function addMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender);
    messageElement.textContent = text;
    elements.messages.appendChild(messageElement);
    elements.messages.scrollTop = elements.messages.scrollHeight;
  }

  function simulateResponse(userMessage) {
    // Simular tiempo de respuesta
    setTimeout(() => {
      addMessage('bot', `Recibí: "${userMessage}". Esto es una simulación.`);
    }, 800);
  }
});
