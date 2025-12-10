/* js/aluno/messages-aluno.js */
import { HeaderComponent } from '../components/shared/Header.js';
import { SidebarComponent } from '../components/shared/Sidebar.js';
import { FooterComponent } from '../components/shared/Footer.js';
import { ConversationCardComponent } from '../components/shared/ConversationCard.js';
import { ChatModalComponent, ChatBubbleComponent } from '../components/aluno/ChatModal.js';
import { ProfileCardComponent } from '../components/aluno/ProfileCard.js';
import { BadgeModalComponent } from '../components/aluno/BadgeModal.js';
import { DatabaseService } from '../services/DatabaseService.js'; // Importando o serviço

let conversations = [];

async function init() {
    await DatabaseService.init(); // Garante inicialização

    document.getElementById('app-header').innerHTML = HeaderComponent('messages');
    document.getElementById('app-sidebar-mobile').innerHTML = SidebarComponent('messages');
    document.getElementById('profile-container').innerHTML = ProfileCardComponent();
    document.getElementById('app-footer').innerHTML = FooterComponent();

    loadConversations();
    setupEventListeners();
    setupProfileEvents(); 
    setupBadgeEvents();
    loadTheme();
}

function loadConversations() {
    // CORREÇÃO: Usando o serviço
    conversations = DatabaseService.getStudentConversations();
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
    
    // Configura cliques nos Cards
    document.querySelectorAll('.conversation-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Se clicou na lixeira, não abre o chat
            if (e.target.closest('.btn-delete-conv')) return;

            const projectId = parseInt(card.dataset.id);
            openChat(projectId);
        });
    });

    // Configura cliques nas Lixeiras
    document.querySelectorAll('.btn-delete-conv').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede abrir o chat
            const id = parseInt(btn.dataset.deleteId);
            openDeleteModal(id);
        });
    });
}

// Modal de Confirmação de Exclusão
function openDeleteModal(projectId) {
    const overlay = document.getElementById('modal-overlay-container');
    
    overlay.innerHTML = `
    <div class="modal-content" style="max-width: 400px;">
        <div class="modal-header p-3 border-bottom">
            <h3 class="font-bold text-lg text-danger">Excluir Conversa</h3>
        </div>
        <div class="modal-body p-4 text-center">
            <div style="width: 60px; height: 60px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: var(--danger);">
                <i class="ph ph-trash" style="font-size: 2rem;"></i>
            </div>
            <p class="text-main font-bold mb-2">Tem certeza?</p>
            <p class="text-sm text-secondary">
                Essa ação apagará todo o histórico dessa conversa e não poderá ser desfeita.
            </p>
        </div>
        <div class="modal-footer p-3 bg-ground border-top flex justify-between gap-2">
            <button class="btn btn-outline w-full justify-center" id="btn-cancel-del">Cancelar</button>
            <button class="btn btn-primary w-full justify-center" id="btn-confirm-del" style="background-color: var(--danger); border-color: var(--danger);">
                Excluir
            </button>
        </div>
    </div>
    `;
    
    requestAnimationFrame(() => overlay.classList.add('active'));

    document.getElementById('btn-cancel-del').addEventListener('click', closeModal);
    
    document.getElementById('btn-confirm-del').addEventListener('click', () => {
        deleteConversation(projectId);
        closeModal();
    });
}

function deleteConversation(projectId) {
    // CORREÇÃO: Usando o serviço para deletar
    conversations = DatabaseService.deleteStudentConversation(projectId);
    renderList();
}

function openChat(projectId) {
    const conversation = conversations.find(c => c.projectId === projectId);
    if (!conversation) return;

    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = ChatModalComponent(conversation);
    requestAnimationFrame(() => overlay.classList.add('active'));

    const msgContainer = document.getElementById('chat-messages-container');
    msgContainer.innerHTML = conversation.messages.map(msg => ChatBubbleComponent(msg)).join('');
    msgContainer.scrollTop = msgContainer.scrollHeight;

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

    // Nota: Em um app real, o serviço teria um método `saveMessage`. 
    // Por enquanto, salvamos tudo via localStorage, mas o ideal seria evoluir o DatabaseService.
    localStorage.setItem('opencampus_conversations', JSON.stringify(conversations));

    const msgContainer = document.getElementById('chat-messages-container');
    msgContainer.insertAdjacentHTML('beforeend', ChatBubbleComponent(newMessage));
    msgContainer.scrollTop = msgContainer.scrollHeight;
    renderList(); 
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.classList.remove('active');
    setTimeout(() => overlay.innerHTML = '', 300);
}

// Configurações Comuns (Menus, Temas)
function setupEventListeners() {
    const btnMenu = document.getElementById('btn-menu-toggle');
    const overlay = document.getElementById('overlay');
    if(btnMenu) btnMenu.addEventListener('click', toggleMenu);
    if(overlay) overlay.addEventListener('click', toggleMenu);
    document.getElementById('btn-close-sidebar')?.addEventListener('click', toggleMenu);
    document.getElementById('header-theme-btn')?.addEventListener('click', toggleTheme);
    document.getElementById('sidebar-theme-btn')?.addEventListener('click', toggleTheme);
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
            e.stopPropagation();
            const level = badge.dataset.level;
            openBadgeModal(level);
        });
    });
}
function openBadgeModal(level) {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = BadgeModalComponent(level);
    requestAnimationFrame(() => overlay.classList.add('active'));
    document.getElementById('btn-modal-close').addEventListener('click', closeModal);
    document.getElementById('btn-modal-close-action').addEventListener('click', closeModal);
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
function loadTheme() { const saved = localStorage.getItem('opencampus-theme'); if (saved) document.documentElement.setAttribute('data-theme', saved); }

function updateThemeIcon(theme) {
    const iconClass = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
    const iconHeader = document.getElementById('theme-icon-header');
    if (iconHeader) iconHeader.className = iconClass;
    const iconSidebar = document.getElementById('theme-icon-sidebar');
    if (iconSidebar) iconSidebar.className = iconClass;
}

document.addEventListener('DOMContentLoaded', init);