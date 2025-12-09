import { ProfessorHeaderComponent } from '../components/professor/ProfessorHeader.js';
import { ProfessorSidebarComponent } from '../components/professor/ProfessorSidebar.js';
import { FooterComponent } from '../components/shared/Footer.js';
import { CalendarComponent } from '../components/shared/Calendar.js';
import { DatabaseService } from '../services/DatabaseService.js';

// Importa os Modais para ação direta
import { RequestDetailModal } from '../components/professor/RequestDetailModal.js';
import { CertificateValidationModal } from '../components/professor/CertificateValidationModal.js';
import { ChatModalComponent, ChatBubbleComponent } from '../components/professor/ChatModal.js';

// Importa funções auxiliares dos outros módulos (Isso simula a reutilização de código)
// Nota: Em um projeto real, essas lógicas de "abrir modal" estariam em um Service ou Controller compartilhado.
// Aqui, vamos recriar a lógica de abrir modal simplificada para o Dashboard.

async function init() {
    await DatabaseService.init();
    
    document.getElementById('app-header').innerHTML = ProfessorHeaderComponent('dashboard');
    document.getElementById('app-sidebar-mobile').innerHTML = ProfessorSidebarComponent('dashboard');
    document.getElementById('app-footer').innerHTML = FooterComponent();
    document.getElementById('calendar-container').innerHTML = CalendarComponent();

    loadProfileStats();
    loadActionFeed();
    loadMiniProjects();
    setupEventListeners();
}

function loadProfileStats() {
    const user = DatabaseService.getCurrentUser();
    if (user) {
        document.getElementById('prof-name-display').textContent = user.name;
        document.getElementById('prof-avatar-img').src = user.avatar;
    }

    const allProjects = DatabaseService.getAllProjects();
    const myProjects = allProjects.filter(p => p.professor.id === user.id);
    
    let totalStudents = 0;
    myProjects.forEach(p => {
        const taken = (p.vacancies.students.total - p.vacancies.students.available);
        totalStudents += taken;
    });

    document.getElementById('stat-active-projects').textContent = myProjects.length;
    document.getElementById('stat-total-students').textContent = totalStudents;
}

// --- LÓGICA DO FEED DE AÇÃO (CENTRO DE COMANDO) ---
function loadActionFeed() {
    const container = document.getElementById('action-feed-container');
    const feedItems = [];

    // 1. Buscar Solicitações Pendentes (Requests)
    const requests = JSON.parse(localStorage.getItem('opencampus_requests_combined')) || [];
    const pendingRequests = requests.filter(r => r.status === 'pending');
    pendingRequests.forEach(req => {
        feedItems.push({
            type: 'request',
            date: new Date(req.date),
            data: req,
            title: `Nova solicitação: ${req.applicantName}`,
            subtitle: `Interessado em ${req.projectTitle}`,
            icon: 'ph-user-plus'
        });
    });

    // 2. Buscar Certificados Pendentes
    const certs = JSON.parse(localStorage.getItem('opencampus_pending_validations')) || [];
    const pendingCerts = certs.filter(c => c.status === 'pending');
    pendingCerts.forEach(cert => {
        feedItems.push({
            type: 'certificate',
            date: new Date(cert.date), // Assumindo data de envio
            data: cert,
            title: `Validar Certificado: ${cert.studentName}`,
            subtitle: `${cert.hours} horas - ${cert.title}`,
            icon: 'ph-stamp'
        });
    });

    // 3. Buscar Últimas Mensagens (Mock para exemplo)
    const chats = JSON.parse(localStorage.getItem('opencampus_prof_conversations')) || [];
    chats.forEach(chat => {
        const lastMsg = chat.messages[chat.messages.length - 1];
        // Só mostra se a última mensagem for do aluno (não lida/respondida)
        if (lastMsg.sender === 'student') {
            feedItems.push({
                type: 'message',
                date: new Date(lastMsg.timestamp),
                data: chat,
                title: `Mensagem de ${chat.studentName}`,
                subtitle: lastMsg.text,
                icon: 'ph-chat-circle-text'
            });
        }
    });

    // Ordenar por Data (Mais recente primeiro)
    feedItems.sort((a, b) => b.date - a.date);

    // Renderizar
    if (feedItems.length === 0) {
        container.innerHTML = `
            <div class="card p-4 text-center border-dashed">
                <div style="width: 50px; height: 50px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: var(--text-secondary);">
                    <i class="ph ph-check" style="font-size: 1.5rem;"></i>
                </div>
                <h4 class="font-bold text-main">Tudo em dia!</h4>
                <p class="text-sm text-secondary">Você não tem pendências no momento.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = feedItems.slice(0, 5).map(item => `
        <div class="action-card type-${item.type}" data-type="${item.type}" data-id="${item.data.id || item.data.projectId}">
            <div class="action-icon-box">
                <i class="ph ${item.icon}"></i>
            </div>
            <div class="action-content">
                <div class="action-title">${item.title}</div>
                <div class="action-meta text-truncate">${item.subtitle}</div>
            </div>
            <div class="text-secondary text-xs">
                ${new Date(item.date).toLocaleDateString('pt-BR')}
            </div>
            <i class="ph ph-caret-right text-secondary ml-2"></i>
        </div>
    `).join('');

    // Adicionar Event Listeners para abrir os Modais correspondentes
    const actionCards = container.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('click', () => {
            const type = card.dataset.type;
            const item = feedItems.find(i => 
                i.type === type && (i.data.id == card.dataset.id || i.data.projectId == card.dataset.id)
            );
            
            if(item) handleActionClick(item);
        });
    });
}

function handleActionClick(item) {
    if (item.type === 'request') {
        openRequestModal(item.data);
    } else if (item.type === 'certificate') {
        openCertModal(item.data);
    } else if (item.type === 'message') {
        openChatModal(item.data);
    }
}

// --- MINI PROJETOS ---
function loadMiniProjects() {
    const user = DatabaseService.getCurrentUser();
    const allProjects = DatabaseService.getAllProjects();
    const myProjects = allProjects.filter(p => p.professor.id === user.id).slice(0, 4); // Max 4

    const container = document.getElementById('mini-projects-container');
    
    if (myProjects.length === 0) {
        container.innerHTML = `<p class="text-secondary text-sm col-span-full">Nenhum projeto ativo.</p>`;
        return;
    }

    container.innerHTML = myProjects.map(p => `
        <div class="mini-project-card cursor-pointer" onclick="window.location.href='meus-projetos.html'">
            <div class="mini-proj-header">
                <img src="${p.image}" class="mini-proj-thumb">
                <div style="overflow: hidden;">
                    <div class="font-bold text-sm text-truncate">${p.title}</div>
                    <div class="text-xs text-secondary">${p.date.schedule}</div>
                </div>
            </div>
            <div class="flex justify-between align-center mt-2 border-top pt-2">
                <span class="text-xs text-secondary"><i class="ph ph-users"></i> ${p.vacancies.students.total - p.vacancies.students.available} Alunos</span>
                <span class="text-xs font-bold text-primary">Gerenciar</span>
            </div>
        </div>
    `).join('');
}

// --- FUNÇÕES DE ABERTURA DE MODAL (SIMPLIFICADAS PARA DASHBOARD) ---
// Em um app real, isso seria importado, mas aqui duplicamos a lógica de abertura para funcionar no contexto

function openRequestModal(request) {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = RequestDetailModal(request);
    requestAnimationFrame(() => overlay.classList.add('active'));
    
    // Lógica básica de fechar (sem a complexidade de aprovar real no dashboard por enquanto, apenas visualização)
    setupModalClose(overlay);
    
    // Reattach basic buttons if needed (Reject/Accept just alert for prototype)
    const btnAccept = document.getElementById('btn-accept');
    if(btnAccept) btnAccept.onclick = () => { alert('Ação realizada! (Vá para a página de Solicitações para gerenciar)'); closeModal(); };
}

function openCertModal(cert) {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = CertificateValidationModal(cert);
    requestAnimationFrame(() => overlay.classList.add('active'));
    setupModalClose(overlay);
}

function openChatModal(conversation) {
    const overlay = document.getElementById('modal-overlay-container');
    // Precisamos da função ChatModalComponent que foi importada
    // Nota: O ChatModal espera 'studentName' na struct do professor
    overlay.innerHTML = ChatModalComponent(conversation);
    requestAnimationFrame(() => overlay.classList.add('active'));
    
    // Renderiza mensagens
    const msgContainer = document.getElementById('chat-messages-container');
    msgContainer.innerHTML = conversation.messages.map(msg => ChatBubbleComponent(msg)).join('');
    msgContainer.scrollTop = msgContainer.scrollHeight;

    setupModalClose(overlay);
}

function setupModalClose(overlay) {
    const closeBtns = overlay.querySelectorAll('.btn-close-modal, #btn-close-req, #btn-close-val, #btn-close-chat, #btn-close-action, #btn-cancel-val, #btn-modal-cancel');
    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.classList.remove('active');
    setTimeout(() => overlay.innerHTML = '', 300);
    loadActionFeed(); // Recarrega para atualizar caso algo tenha mudado (simulado)
}

function setupEventListeners() {
    const btnMenu = document.getElementById('btn-menu-toggle');
    const overlay = document.getElementById('overlay');
    if (btnMenu) btnMenu.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);
    document.getElementById('btn-close-sidebar')?.addEventListener('click', toggleMenu);
    document.getElementById('sidebar-theme-btn')?.addEventListener('click', toggleTheme);
    document.getElementById('header-theme-btn')?.addEventListener('click', toggleTheme);
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