import { HeaderComponent } from './components/Header.js';
import { SidebarComponent } from './components/Sidebar.js';
import { ProfileCardComponent } from './components/ProfileCard.js';
import { FooterComponent } from './components/Footer.js';
import { ConversationCardComponent } from './components/ConversationCard.js';
import { ChatModalComponent, ChatBubbleComponent } from './components/ChatModal.js';

// Estado Local
let conversations = [];
let currentChatId = null; // ID do projeto da conversa aberta

async function init() {
    document.getElementById('app-header').innerHTML = HeaderComponent('messages'); // Ativa aba mensagens
    document.getElementById('app-sidebar-mobile').innerHTML = SidebarComponent('messages');
    document.getElementById('profile-container').innerHTML = ProfileCardComponent();
    document.getElementById('app-footer').innerHTML = FooterComponent();

    loadConversations();
    setupEventListeners();
    loadTheme();
}

function loadConversations() {
    const storageKey = 'opencampus_conversations';
    conversations = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    // Ordena por última mensagem (mais recente primeiro)
    conversations.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

    renderList();
}

function renderList() {
    const container = document.getElementById('conversations-container');
    
    if (conversations.length === 0) {
        container.innerHTML = `
            <div class="card p-3 text-center">
                <p class="text-secondary mb-2">Você ainda não iniciou nenhuma conversa.</p>
                <a href="index.html" class="btn btn-primary">Ir para Projetos</a>
            </div>
        `;
        return;
    }

    container.innerHTML = conversations.map(c => ConversationCardComponent(c)).join('');
    
    // Click Event para abrir o chat
    document.querySelectorAll('.conversation-card').forEach(card => {
        card.addEventListener('click', () => {
            const projectId = parseInt(card.dataset.projectId);
            openChat(projectId);
        });
    });
}

// --- LÓGICA DO CHAT ---
function openChat(projectId) {
    const conversation = conversations.find(c => c.projectId === projectId);
    if (!conversation) return;

    currentChatId = projectId; // Marca qual chat está aberto

    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = ChatModalComponent(conversation);
    requestAnimationFrame(() => overlay.classList.add('active'));

    // Renderiza mensagens antigas
    const msgContainer = document.getElementById('chat-messages-container');
    msgContainer.innerHTML = conversation.messages.map(msg => ChatBubbleComponent(msg)).join('');
    scrollToBottom();

    // Eventos do Chat
    document.getElementById('btn-close-chat').addEventListener('click', closeModal);
    
    // Enviar mensagem
    const btnSend = document.getElementById('btn-send-chat');
    const input = document.getElementById('chat-input');

    const handleSend = () => {
        const text = input.value.trim();
        if (text) {
            sendMessage(projectId, text);
            input.value = '';
            input.focus();
        }
    };

    btnSend.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

function sendMessage(projectId, text) {
    // 1. Atualiza dados na memória
    const convIndex = conversations.findIndex(c => c.projectId === projectId);
    const newMessage = {
        id: Date.now(),
        sender: 'student',
        text: text,
        timestamp: new Date().toISOString()
    };

    conversations[convIndex].messages.push(newMessage);
    conversations[convIndex].lastUpdated = new Date().toISOString();

    // 2. Salva no Storage
    localStorage.setItem('opencampus_conversations', JSON.stringify(conversations));

    // 3. Atualiza a UI do Chat (Adiciona bolha)
    const msgContainer = document.getElementById('chat-messages-container');
    msgContainer.insertAdjacentHTML('beforeend', ChatBubbleComponent(newMessage));
    scrollToBottom();

    // 4. Atualiza a lista de conversas atrás (para mostrar o snippet novo)
    renderList(); 
}

function scrollToBottom() {
    const msgContainer = document.getElementById('chat-messages-container');
    msgContainer.scrollTop = msgContainer.scrollHeight;
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.classList.remove('active');
    setTimeout(() => overlay.innerHTML = '', 300);
    currentChatId = null;
}

// Utils (Copiados para manter consistência)
function setupEventListeners() {
    // Menu
    const btnMenu = document.getElementById('btn-menu-toggle');
    const overlay = document.getElementById('overlay');
    if(btnMenu) btnMenu.addEventListener('click', toggleMenu);
    if(overlay) overlay.addEventListener('click', toggleMenu);
    document.getElementById('btn-close-sidebar').addEventListener('click', toggleMenu);

    // Tema (Header Desktop)
    const btnThemeHeader = document.getElementById('header-theme-btn');
    if(btnThemeHeader) btnThemeHeader.addEventListener('click', toggleTheme);

    // Tema (Sidebar Mobile)
    const btnThemeSidebar = document.getElementById('sidebar-theme-btn');
    if(btnThemeSidebar) btnThemeSidebar.addEventListener('click', () => {
        toggleTheme();
        toggleMenu(); // Fecha o menu após trocar o tema
    });

    // ... (Mantenha os listeners de Filtro se houver no arquivo específico) ...
    // Exemplo para main.js: Mantenha a lógica do filtro aqui.
}

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if(sidebar) sidebar.classList.toggle('active');
    if(overlay) overlay.classList.toggle('active');
}

function toggleTheme() {
    const html = document.documentElement;
    const newTheme = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('opencampus-theme', newTheme);
    updateThemeIcon(newTheme);
}

function loadTheme() {
    const saved = localStorage.getItem('opencampus-theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
        updateThemeIcon(saved);
    }
}

function updateThemeIcon(theme) {
    const iconClass = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
    
    // Atualiza ícone do Header
    const iconHeader = document.getElementById('theme-icon-header');
    if (iconHeader) iconHeader.className = iconClass;

    // Atualiza ícone da Sidebar
    const iconSidebar = document.getElementById('theme-icon-sidebar');
    if (iconSidebar) iconSidebar.className = iconClass;
}

function setupProfileEvents() {
    const profileCard = document.getElementById('profile-card-component');
    
    if (profileCard) {
        profileCard.addEventListener('click', () => {
            // Verifica se está no mobile (opcional, pois o CSS já trata, 
            // mas bom para evitar cliques desnecessários no desktop)
            if (window.innerWidth <= 1024) {
                profileCard.classList.toggle('expanded');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', init);