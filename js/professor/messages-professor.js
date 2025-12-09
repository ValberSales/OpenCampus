/* js/professor/messages-professor.js */
import { ProfessorHeaderComponent } from '../components/professor/ProfessorHeader.js';
import { ProfessorSidebarComponent } from '../components/professor/ProfessorSidebar.js';
import { FooterComponent } from '../components/shared/Footer.js';
import { ChatModalComponent, ChatBubbleComponent } from '../components/professor/ChatModal.js';
import { ConversationCardComponent } from '../components/shared/ConversationCard.js'; // IMPORTADO AQUI
import { DatabaseService } from '../services/DatabaseService.js';

let conversations = [];

async function init() {
    await DatabaseService.init();

    document.getElementById('app-header').innerHTML = ProfessorHeaderComponent('messages');
    document.getElementById('app-sidebar-mobile').innerHTML = ProfessorSidebarComponent('messages');
    document.getElementById('app-footer').innerHTML = FooterComponent();

    loadConversations();
    setupEventListeners();
}

function loadConversations() {
    const storageKey = 'opencampus_prof_conversations';
    const stored = localStorage.getItem(storageKey);

    if (stored) {
        conversations = JSON.parse(stored);
    } else {
        conversations = generateMockConversations();
        localStorage.setItem(storageKey, JSON.stringify(conversations));
    }
    
    conversations.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    renderList();
}

function generateMockConversations() {
    return [
        {
            id: 1,
            projectId: 1,
            projectTitle: "Inclusão Digital",
            studentName: "Lucas Pereira",
            studentAvatar: "https://ui-avatars.com/api/?name=Lucas+P&background=random",
            lastUpdated: new Date().toISOString(),
            messages: [
                { sender: 'student', text: 'Professor, quando começam as aulas práticas?', timestamp: new Date(Date.now() - 3600000).toISOString() },
                { sender: 'professor', text: 'Olá Lucas! Começam na próxima terça-feira.', timestamp: new Date(Date.now() - 1800000).toISOString() },
                { sender: 'student', text: 'Perfeito, estarei lá. Obrigado!', timestamp: new Date().toISOString() }
            ]
        },
        {
            id: 2,
            projectId: 2,
            projectTitle: "Robótica nas Escolas",
            studentName: "Fernanda Costa",
            studentAvatar: "https://ui-avatars.com/api/?name=Fernanda+C&background=random",
            lastUpdated: new Date(Date.now() - 86400000).toISOString(),
            messages: [
                { sender: 'student', text: 'Tenho uma dúvida sobre o kit de robótica.', timestamp: new Date(Date.now() - 90000000).toISOString() }
            ]
        }
    ];
}

function renderList() {
    const container = document.getElementById('conversations-container');
    
    if (conversations.length === 0) {
        container.innerHTML = `<div class="card p-3 text-center text-secondary">Nenhuma conversa iniciada.</div>`;
        return;
    }

    // Agora usamos o componente compartilhado, assim como o aluno
    container.innerHTML = conversations.map(c => ConversationCardComponent(c)).join('');

    // Eventos de Clique no CARD (abrir chat)
    document.querySelectorAll('.conversation-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Se clicou na lixeira, ignora
            if (e.target.closest('.btn-delete-conv')) return;

            const id = parseInt(card.dataset.id);
            openChat(id);
        });
    });

    // Eventos de Clique na LIXEIRA (deletar)
    document.querySelectorAll('.btn-delete-conv').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.deleteId);
            openDeleteModal(id);
        });
    });
}

// NOVO: Modal de Deletar (Professor)
function openDeleteModal(convId) {
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
        deleteConversation(convId);
        closeModal();
    });
}

function deleteConversation(convId) {
    conversations = conversations.filter(c => c.id !== convId);
    localStorage.setItem('opencampus_prof_conversations', JSON.stringify(conversations));
    renderList();
}

function openChat(convId) {
    const conversation = conversations.find(c => c.id === convId);
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
            sendMessage(convId, text);
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

function sendMessage(convId, text) {
    const idx = conversations.findIndex(c => c.id === convId);
    if (idx === -1) return;

    const newMessage = {
        sender: 'professor',
        text: text,
        timestamp: new Date().toISOString()
    };

    conversations[idx].messages.push(newMessage);
    conversations[idx].lastUpdated = new Date().toISOString();
    
    localStorage.setItem('opencampus_prof_conversations', JSON.stringify(conversations));

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

function setupEventListeners() {
    const btnMenu = document.getElementById('btn-menu-toggle');
    const overlay = document.getElementById('overlay');
    if (btnMenu) btnMenu.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);
    document.getElementById('btn-close-sidebar')?.addEventListener('click', toggleMenu);
    document.getElementById('header-theme-btn')?.addEventListener('click', toggleTheme);
    document.getElementById('sidebar-theme-btn')?.addEventListener('click', toggleTheme);
    loadTheme();
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
}
function loadTheme() { const saved = localStorage.getItem('opencampus-theme'); if (saved) document.documentElement.setAttribute('data-theme', saved); }

document.addEventListener('DOMContentLoaded', init);