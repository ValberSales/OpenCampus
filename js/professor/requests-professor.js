import { ProfessorHeaderComponent } from '../components/professor/ProfessorHeader.js';
import { ProfessorSidebarComponent } from '../components/professor/ProfessorSidebar.js';
import { FooterComponent } from '../components/shared/Footer.js';
import { RequestCardComponent } from '../components/professor/RequestCard.js';
import { RequestDetailModal } from '../components/professor/RequestDetailModal.js';
import { DatabaseService } from '../services/DatabaseService.js';

// Estado Local
let allRequests = [];
let activeTab = 'students'; // 'students' ou 'community'

async function init() {
    await DatabaseService.init();

    document.getElementById('app-header').innerHTML = ProfessorHeaderComponent('requests');
    document.getElementById('app-sidebar-mobile').innerHTML = ProfessorSidebarComponent('requests');
    document.getElementById('app-footer').innerHTML = FooterComponent();

    loadRequests();
    setupEventListeners();
    setupTabs();
}

function loadRequests() {
    // Para fins de desenvolvimento/teste, vamos sempre regerar os mocks
    // se não houver dados ou se a estrutura parecer antiga.
    // Em produção, você removeria esse reset forçado.
    const stored = localStorage.getItem('opencampus_requests_combined');
    
    if (stored) {
        allRequests = JSON.parse(stored);
    } 
    
    // Se a lista estiver vazia ou com poucos itens (para garantir o teste do usuário), regera
    if (allRequests.length < 5) {
        allRequests = generateMockData();
        saveRequests();
    }

    updateBadges();
    renderList();
}

function generateMockData() {
    const user = DatabaseService.getCurrentUser();
    const allProjects = DatabaseService.getAllProjects();
    // Pega um projeto do professor ou usa um genérico
    const myProject = allProjects.find(p => p.professor.id === user.id) || { title: "Inclusão Digital", id: 1 };

    // --- 4 Solicitações de ALUNOS (Internos) ---
    const students = [
        {
            id: 101, type: 'student', status: 'pending',
            projectId: myProject.id, projectTitle: myProject.title,
            applicantName: "Lucas Pereira",
            info: "Eng. Software - 5º Período", 
            phone: "(46) 99911-1111", email: "lucas.p@alunos.utfpr.edu.br",
            reason: "Gostaria de validar minhas horas de extensão neste projeto.",
            date: new Date().toISOString()
        },
        {
            id: 102, type: 'student', status: 'pending',
            projectId: myProject.id, projectTitle: myProject.title,
            applicantName: "Fernanda Costa",
            info: "Agronomia - 3º Período",
            phone: "(46) 99922-2222", email: "fer.costa@alunos.utfpr.edu.br",
            reason: "Tenho interesse na área de tecnologia aplicada ao campo.",
            date: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 103, type: 'student', status: 'pending',
            projectId: myProject.id, projectTitle: myProject.title,
            applicantName: "Rafael Santos",
            info: "ADS - 1º Período",
            phone: "(46) 99933-3333", email: "rafa.s@alunos.utfpr.edu.br",
            reason: "Busco minha primeira oportunidade de extensão.",
            date: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: 104, type: 'student', status: 'pending',
            projectId: myProject.id, projectTitle: myProject.title,
            applicantName: "Amanda Oliveira",
            info: "Eng. Elétrica - 7º Período",
            phone: "(46) 99944-4444", email: "amanda.o@alunos.utfpr.edu.br",
            reason: "Preciso de horas complementares para formar este ano.",
            date: new Date(Date.now() - 200000000).toISOString()
        }
    ];

    // --- 4 Solicitações da COMUNIDADE (Externos) ---
    const community = [
        {
            id: 201, type: 'community', status: 'pending',
            projectId: myProject.id, projectTitle: myProject.title,
            applicantName: "Maria da Silva",
            info: "", // Sem info extra para externos
            phone: "(46) 98888-9999", email: "maria.silva@gmail.com",
            reason: "Me disseram que ensinam a usar celular. Preciso aprender a usar o banco.",
            date: new Date().toISOString()
        },
        {
            id: 202, type: 'community', status: 'pending',
            projectId: myProject.id, projectTitle: myProject.title,
            applicantName: "José Santos",
            info: "",
            phone: "(46) 97777-8888", email: "jose.santos@outlook.com",
            reason: "Sou aposentado e gostaria de participar das oficinas.",
            date: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 203, type: 'community', status: 'pending',
            projectId: myProject.id, projectTitle: myProject.title,
            applicantName: "Carlos Empreendimentos",
            info: "",
            phone: "(46) 3222-0000", email: "contato@empresa.com",
            reason: "Temos interesse em apoiar o projeto com equipamentos.",
            date: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: 204, type: 'community', status: 'pending',
            projectId: myProject.id, projectTitle: myProject.title,
            applicantName: "ONG Viver Bem",
            info: "",
            phone: "(46) 99111-2222", email: "ong@viverbem.org",
            reason: "Gostaríamos de levar essa iniciativa para nossos assistidos.",
            date: new Date(Date.now() - 250000000).toISOString()
        }
    ];

    return [...students, ...community];
}

function renderList() {
    const container = document.getElementById('requests-container');
    
    // Filtra por ABA ATIVA e STATUS PENDENTE
    const visibleRequests = allRequests.filter(r => r.type === activeTab && r.status === 'pending');

    if (visibleRequests.length === 0) {
        const emptyMsg = activeTab === 'students' ? 'Nenhum aluno aguardando.' : 'Nenhuma solicitação externa.';
        container.innerHTML = `
            <div class="card p-5 text-center" style="border: 1px dashed var(--border-color); background: transparent;">
                <div style="width: 50px; height: 50px; background: var(--bg-ground); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: var(--text-secondary);">
                    <i class="ph ph-check" style="font-size: 1.5rem;"></i>
                </div>
                <p class="text-secondary">${emptyMsg}</p>
            </div>`;
        return;
    }

    // Ordena por data (mais recente primeiro)
    visibleRequests.sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = visibleRequests.map(r => RequestCardComponent(r)).join('');

    // Reattach Events
    document.querySelectorAll('.request-card-trigger').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            const req = allRequests.find(r => r.id === id);
            openModal(req);
        });
    });
}

function updateBadges() {
    const studentCount = allRequests.filter(r => r.type === 'student' && r.status === 'pending').length;
    const communityCount = allRequests.filter(r => r.type === 'community' && r.status === 'pending').length;

    updateBadgeDisplay('badge-student', studentCount);
    updateBadgeDisplay('badge-community', communityCount);
}

function updateBadgeDisplay(id, count) {
    const el = document.getElementById(id);
    if (!el) return;
    
    el.textContent = count;
    // Mostra o badge apenas se houver itens > 0
    if (count === 0) {
        el.style.display = 'none';
    } else {
        el.style.display = 'inline-block';
    }
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn-req');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked
            btn.classList.add('active');
            
            // Update state and render
            activeTab = btn.dataset.tab;
            renderList();
        });
    });
}

function openModal(request) {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = RequestDetailModal(request);
    requestAnimationFrame(() => overlay.classList.add('active'));

    const closeModal = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.innerHTML = '', 300);
    };

    const closeBtns = overlay.querySelectorAll('#btn-close-req, #btn-close-action');
    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
    
    const btnAccept = document.getElementById('btn-accept');
    if(btnAccept) {
        btnAccept.addEventListener('click', () => {
            handleDecision(request.id, 'accepted');
            closeModal();
        });
    }

    const btnReject = document.getElementById('btn-reject');
    if(btnReject) {
        btnReject.addEventListener('click', () => {
            handleDecision(request.id, 'rejected');
            closeModal();
        });
    }

    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

function handleDecision(id, status) {
    const idx = allRequests.findIndex(r => r.id === id);
    if (idx !== -1) {
        allRequests[idx].status = status;
        saveRequests();
        updateBadges();
        renderList();
        
        // Feedback
        const msg = status === 'accepted' ? 'Solicitação Aceita!' : 'Solicitação Rejeitada.';
        alert(msg);
    }
}

function saveRequests() {
    localStorage.setItem('opencampus_requests_combined', JSON.stringify(allRequests));
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