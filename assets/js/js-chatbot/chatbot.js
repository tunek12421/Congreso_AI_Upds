// Base de conocimiento del chatbot
const chatbotQuestions = [
  {
    id: 1,
    question: "¿Cuándo y dónde se llevará a cabo el congreso?",
    answer: `El Segundo Congreso de Inteligencia Artificial se llevará a cabo el 31 de julio de 2025, en el Hotel Avanti, ubicado en la calle Luís Mostajo N.º 100, zona Temporal de Cala-Cala, en la ciudad de Cochabamba, Bolivia.<br><br>Además, se dispondrá de transmisión en línea para los participantes que se registren previamente en modalidad virtual.`
  },
  {
    id: 2,
    question: "¿Quiénes pueden participar en el evento?",
    answer: `El congreso está dirigido a estudiantes universitarios, docentes, investigadores, y profesionales del ámbito tecnológico y científico. Asimismo, está abierto a toda persona interesada en el estudio, desarrollo o aplicación de la inteligencia artificial y sus diversas áreas de impacto.`
  },
  {
    id: 3,
    question: "¿El evento contará con conferencistas invitados?",
    answer: `Sí. El congreso contará con la participación de reconocidos especialistas nacionales e internacionales en inteligencia artificial, provenientes tanto del ámbito académico como del sector tecnológico empresarial.`
  }
];

// Estado del chatbot
const chatbotState = {
  availableQuestions: [...chatbotQuestions],
  chatHistory: [
    {
      sender: 'bot',
      text: '¡Hola! Bienvenido al Congreso de IA UPDS 2025. ¿En qué puedo ayudarte?'
    }
  ]
};

// Renderizar preguntas disponibles
function renderChatbotQuestions() {
  const questionsDiv = document.getElementById('chatbot-questions');
  questionsDiv.innerHTML = '';
  
  chatbotState.availableQuestions.forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'chatbot-question-btn';
    btn.textContent = q.question;
    btn.onclick = () => handleQuestion(q.id);
    questionsDiv.appendChild(btn);
  });
}

// Renderizar mensajes del chat
function renderChatbotMessages() {
  const messagesDiv = document.getElementById('chatbot-message-list');
  messagesDiv.innerHTML = '';
  
  chatbotState.chatHistory.forEach((msg, i) => {
    const div = document.createElement('div');
    div.className = `chatbot-message ${msg.sender}`;
    div.innerHTML = msg.text;
    div.style.animationDelay = `${i * 0.1}s`;
    messagesDiv.appendChild(div);
  });
  
  // Auto-scroll al final
  const container = document.getElementById('chatbot-messages');
  container.scrollTop = container.scrollHeight;
}

// Manejar selección de pregunta
function handleQuestion(id) {
  const question = chatbotQuestions.find(q => q.id === id);
  if (!question) return;

  // Agregar pregunta del usuario
  chatbotState.chatHistory.push({
    sender: 'user',
    text: question.question
  });
  
  renderChatbotMessages();
  
  // Simular tiempo de respuesta
  setTimeout(() => {
    // Agregar respuesta del bot
    chatbotState.chatHistory.push({
      sender: 'bot',
      text: question.answer
    });
    
    // Eliminar pregunta de las disponibles
    chatbotState.availableQuestions = chatbotState.availableQuestions.filter(q => q.id !== id);
    
    renderChatbotMessages();
    renderChatbotQuestions();
  }, 800);
}

// Control de apertura/cierre
function openChatbot() {
  const chatWindow = document.getElementById('chatbot-window');
  chatWindow.classList.remove('hidden');
  chatWindow.classList.add('open');
  document.getElementById('chatbot-toggle').classList.add('hide');
}

function closeChatbot() {
  const chatWindow = document.getElementById('chatbot-window');
  chatWindow.classList.remove('open');
  
  setTimeout(() => {
    chatWindow.classList.add('hidden');
    document.getElementById('chatbot-toggle').classList.remove('hide');
  }, 300);
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  // Configurar event listeners
  document.getElementById('chatbot-toggle').addEventListener('click', openChatbot);
  document.getElementById('chatbot-close').addEventListener('click', closeChatbot);
  
  // Renderizar contenido inicial
  renderChatbotQuestions();
  renderChatbotMessages();
});
