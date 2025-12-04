// js/aluno/messages-aluno.js
import { HeaderComponent } from '../components/shared/Header.js';
import { SidebarComponent } from '../components/shared/Sidebar.js';
import { FooterComponent } from '../components/shared/Footer.js';
import { ConversationCardComponent } from '../components/shared/ConversationCard.js'; // Atenção: Movi para shared na suposição
import { ChatModalComponent, ChatBubbleComponent } from '../components/aluno/ChatModal.js'; // Verifique se ChatModal está em shared ou aluno

import { ProfileCardComponent } from '../components/aluno/ProfileCard.js';
import { BadgeModalComponent } from '../components/aluno/BadgeModal.js';

let conversations = [];
let currentChatId = null;

async function init() {
    document.getElementById('app-header').innerHTML = HeaderComponent('messages');
    document.getElementById('app-sidebar-mobile').innerHTML = SidebarComponent('messages');
    document.getElementById('profile-container').innerHTML = ProfileCardComponent();
    document.getElementById('app-footer').innerHTML = FooterComponent();

    loadConversations();
    setupEventListeners();
    setupProfileEvents(); // Perfil Mobile
    setupBadgeEvents();
    loadTheme();
}

function loadConversations() {
    const storageKey = 'opencampus_conversations';
    conversations = JSON.parse(localStorage.getItem(storageKey)) || [];
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
    
    document.querySelectorAll('.conversation-card').forEach(card => {
        card.addEventListener('click', () => {
            const projectId = parseInt(card.dataset.projectId);
            openChat(projectId);
        });
    });
}

function openChat(projectId) {
    const conversation = conversations.find(c => c.projectId === projectId);
    if (!conversation) return;

    currentChatId = projectId;
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = ChatModalComponent(conversation);
    requestAnimationFrame(() => overlay.classList.add('active'));

    const msgContainer = document.getElementById('chat-messages-container');
    msgContainer.innerHTML = conversation.messages.map(msg => ChatBubbleComponent(msg)).join('');
    scrollToBottom();

    document.getElementById('btn-close-chat').addEventListener('click', closeModal);
    
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
    const convIndex = conversations.findIndex(c => c.projectId === projectId);
    const newMessage = {
        id: Date.now(),
        sender: 'student',
        text: text,
        timestamp: new Date().toISOString()
    };

    conversations[convIndex].messages.push(newMessage);
    conversations[convIndex].lastUpdated = new Date().toISOString();

    localStorage.setItem('opencampus_conversations', JSON.stringify(conversations));

    const msgContainer = document.getElementById('chat-messages-container');
    msgContainer.insertAdjacentHTML('beforeend', ChatBubbleComponent(newMessage));
    scrollToBottom();
    renderList(); 
}

function scrollToBottom() {
    const msgContainer = document.getElementById('chat-messages-container');
    if(msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.classList.remove('active');
    setTimeout(() => overlay.innerHTML = '', 300);
    currentChatId = null;
}

// Configurações Comuns
function setupEventListeners() {
    const btnMenu = document.getElementById('btn-menu-toggle');
    const overlay = document.getElementById('overlay');
    if(btnMenu) btnMenu.addEventListener('click', toggleMenu);
    if(overlay) overlay.addEventListener('click', toggleMenu);
    document.getElementById('btn-close-sidebar').addEventListener('click', toggleMenu);

    const btnThemeHeader = document.getElementById('header-theme-btn');
    if(btnThemeHeader) btnThemeHeader.addEventListener('click', toggleTheme);

    const btnThemeSidebar = document.getElementById('sidebar-theme-btn');
    if(btnThemeSidebar) btnThemeSidebar.addEventListener('click', () => {
        toggleTheme();
        toggleMenu();
    });
}

function setupProfileEvents() {
    const profileCard = document.getElementById('profile-card-component');
    if (profileCard) {
        profileCard.addEventListener('click', () => {
            if (window.innerWidth <= 1024) profileCard.classList.toggle('expanded');
        });
    }
}

function setupBadgeEvents() {
    const badges = document.querySelectorAll('.trophy-trigger');
    
    badges.forEach(badge => {
        badge.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita expandir perfil no mobile
            const level = badge.dataset.level;
            openBadgeModal(level);
        });
    });
}

function openBadgeModal(level) {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = BadgeModalComponent(level);
    requestAnimationFrame(() => overlay.classList.add('active'));

    const btnClose = document.getElementById('btn-modal-close');
    const btnAction = document.getElementById('btn-modal-close-action');
    
    if(btnClose) btnClose.addEventListener('click', closeModal);
    if(btnAction) btnAction.addEventListener('click', closeModal);
    
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
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
    const iconHeader = document.getElementById('theme-icon-header');
    if (iconHeader) iconHeader.className = iconClass;
    const iconSidebar = document.getElementById('theme-icon-sidebar');
    if (iconSidebar) iconSidebar.className = iconClass;
}

document.addEventListener('DOMContentLoaded', init);