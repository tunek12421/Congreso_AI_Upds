// Chatbot IA Congreso
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

const chatbotState = {
  availableQuestions: [...chatbotQuestions],
  chatHistory: []
};

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
  if (chatbotState.availableQuestions.length === 0) {
    questionsDiv.innerHTML = '<span style="color:#888">No hay más preguntas disponibles.</span>';
  }
}

function renderChatbotMessages() {
  const messagesDiv = document.getElementById('chatbot-messages');
  const wasAtBottom = Math.abs(messagesDiv.scrollTop + messagesDiv.clientHeight - messagesDiv.scrollHeight) < 2;
  messagesDiv.innerHTML = '';
  chatbotState.chatHistory.forEach((msg, i) => {
    const div = document.createElement('div');
    div.className = 'chatbot-message ' + msg.sender;
    div.innerHTML = msg.text;
    div.style.animationDelay = (i * 0.08) + 's';
    messagesDiv.appendChild(div);
  });
  // Solo hacer scroll automático si el usuario estaba abajo
  if (wasAtBottom) {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}

function handleQuestion(id) {
  const q = chatbotQuestions.find(q => q.id === id);
  if (!q) return;
  // Animación de pregunta
  chatbotState.chatHistory.push({ sender: 'user', text: q.question });
  renderChatbotMessages();
  setTimeout(() => {
    chatbotState.chatHistory.push({ sender: 'bot', text: q.answer });
    chatbotState.availableQuestions = chatbotState.availableQuestions.filter(qq => qq.id !== id);
    renderChatbotMessages();
    renderChatbotQuestions();
  }, 500); // Espera para mostrar la respuesta
}

// Permitir cargar avatar del bot posteriormente
function setChatbotAvatar(url) {
  const avatar = document.getElementById('chatbot-avatar');
  if (avatar) {
    avatar.src = url;
    avatar.style.display = 'block';
  }
}

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
  }, 200); // Espera a la transición para mostrar el botón
}

document.addEventListener('DOMContentLoaded', () => {
  // Chatbot events
  document.getElementById('chatbot-toggle').onclick = openChatbot;
  document.getElementById('chatbot-close').onclick = closeChatbot;
  renderChatbotQuestions();
  renderChatbotMessages();
});
