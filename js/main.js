import { HeaderComponent } from './components/Header.js';
import { SidebarComponent } from './components/Sidebar.js';
import { ProfileCardComponent } from './components/ProfileCard.js';
import { ProjectCardComponent } from './components/ProjectCard.js';
import { CalendarComponent } from './components/Calendar.js';
import { FooterComponent } from './components/Footer.js';
import { PaginationComponent } from './components/Pagination.js';
import { ProjectModalComponent } from './components/ProjectModal.js';
import { FilterDrawerComponent } from './components/FilterDrawer.js';
import { MessageModalComponent } from './components/MessageModal.js';

// --- ESTADO DA APLICAÇÃO ---
const state = {
    allProjects: [],      
    filteredProjects: [], 
    currentPage: 1,
    itemsPerPage: 4,
    filters: {            
        maxHours: 200,
        startDate: null,
        shifts: [],
        tag: ""
    }
};

// --- INIT ---
async function init() {
    renderStaticComponents();
    
    try {
        await fetchProjects();
    } catch (error) {
        console.error("Erro ao carregar projetos:", error);
        document.getElementById('projects-container').innerHTML = 
            `<p class="text-center text-secondary p-3">Erro ao carregar dados. Verifique se o Live Server está rodando.</p>`;
    }
    
    setupEventListeners();
    loadTheme();
}

async function fetchProjects() {
    const response = await fetch('./data/projects.json');
    if (!response.ok) throw new Error('Falha na rede');
    const data = await response.json();
    
    state.allProjects = data;
    state.filteredProjects = data; 
    
    renderFeed();
}

// Renderiza estrutura fixa
function renderStaticComponents() {
    document.getElementById('app-header').innerHTML = HeaderComponent();
    document.getElementById('app-sidebar-mobile').innerHTML = SidebarComponent();
    document.getElementById('profile-container').innerHTML = ProfileCardComponent();
    document.getElementById('calendar-container').innerHTML = CalendarComponent();
    document.getElementById('app-footer').innerHTML = FooterComponent();
    document.getElementById('filter-drawer-container').innerHTML = FilterDrawerComponent();
}

// Renderiza Feed (Cards + Paginação)
function renderFeed() {
    const projectsContainer = document.getElementById('projects-container');
    
    if (state.filteredProjects.length === 0) {
        projectsContainer.innerHTML = `<div class="text-center p-3 text-secondary">Nenhum projeto encontrado com esses filtros.</div>`;
        return;
    }

    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    const paginatedItems = state.filteredProjects.slice(start, end);
    const totalPages = Math.ceil(state.filteredProjects.length / state.itemsPerPage);

    const cardsHtml = paginatedItems.map(p => ProjectCardComponent(p)).join('');
    const paginationHtml = PaginationComponent(state.currentPage, totalPages);

    projectsContainer.innerHTML = cardsHtml + paginationHtml;

    setupPaginationEvents(totalPages);
    setupModalEvents(); // Agora a função existe abaixo!
}

// --- LÓGICA DE FILTRAGEM ---
function applyFilters() {
    state.filteredProjects = state.allProjects.filter(project => {
        // Horas
        if (project.hours > state.filters.maxHours) return false;
        // Tags
        if (state.filters.tag && !project.tags.some(t => t.label === state.filters.tag)) return false;
        // Turnos
        if (state.filters.shifts.length > 0) {
            const hasShift = project.shifts && project.shifts.some(s => state.filters.shifts.includes(s));
            if (!hasShift) return false;
        }
        // Data
        if (state.filters.startDate) {
            const projDateParts = project.date.start.split('/'); 
            const projectDate = new Date(projDateParts[2], projDateParts[1] - 1, projDateParts[0]);
            const filterDate = new Date(state.filters.startDate);
            if (projectDate < filterDate) return false;
        }
        return true;
    });

    state.currentPage = 1; 
    renderFeed();
    closeFilterDrawer();
}

// --- GERENCIAMENTO DE MODAIS (DETALHES E MENSAGEM) ---
function setupModalEvents() {
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const projectId = parseInt(e.currentTarget.dataset.id);
            const project = state.allProjects.find(p => p.id === projectId);

            if (e.target.closest('.btn-message')) {
                e.stopPropagation(); 
                if (project) openMessageModal(project);
                return;
            }

            if (project) {
                openProjectModal(project);
            }
        });
    });
}

function openProjectModal(project) { 
    // 1. Checa se o aluno já está inscrito neste projeto
    const subscriptions = JSON.parse(localStorage.getItem('opencampus_subscriptions')) || [];
    const isSubscribed = subscriptions.includes(project.id);

    const overlay = document.getElementById('modal-overlay-container');
    
    // 2. Passa o status para o componente renderizar o botão certo
    overlay.innerHTML = ProjectModalComponent(project, isSubscribed);
    requestAnimationFrame(() => overlay.classList.add('active'));
    
    // Eventos de Fechar
    const btnClose = document.getElementById('btn-modal-close');
    const btnCancel = document.getElementById('btn-modal-cancel');
    if(btnClose) btnClose.addEventListener('click', closeModal);
    if(btnCancel) btnCancel.addEventListener('click', closeModal);

    // Evento de Mensagem (Dentro do Modal de Detalhes)
    const btnMsg = document.getElementById('btn-modal-msg');
    if(btnMsg) {
        btnMsg.addEventListener('click', () => {
            closeModal(); // Fecha o de detalhes
            setTimeout(() => openMessageModal(project), 300); // Abre o de mensagem
        });
    }

    // Evento de Inscrever (Se o botão existir)
    const btnSub = document.getElementById('btn-confirm-sub');
    if(btnSub) {
        btnSub.addEventListener('click', () => {
            // Salva no LocalStorage
            subscriptions.push(project.id);
            localStorage.setItem('opencampus_subscriptions', JSON.stringify(subscriptions));
            
            // Feedback Visual e recarrega modal como "Inscrito"
            alert(`Parabéns! Você se inscreveu em "${project.title}".`);
            openProjectModal(project); // Reabre para atualizar o botão visualmente
        });
    }
    
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

// Modal de Mensagem
function openMessageModal(project) {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = MessageModalComponent(project);
    requestAnimationFrame(() => overlay.classList.add('active'));

    document.getElementById('btn-close-msg-modal').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-msg').addEventListener('click', closeModal);
    
    // Lógica de Enviar
    const btnSend = document.getElementById('btn-send-msg');
    btnSend.addEventListener('click', () => {
        const text = document.getElementById('message-text').value;
        if (!text.trim()) {
            alert("Por favor, escreva uma mensagem.");
            return;
        }
        
        saveMessageToStorage(project, text);
        closeModal();
        alert("Mensagem enviada com sucesso!");
    });

    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

// Salvar no LocalStorage
function saveMessageToStorage(project, text) {
    const storageKey = 'opencampus_conversations';
    let conversations = JSON.parse(localStorage.getItem(storageKey)) || [];

    let conversationIndex = conversations.findIndex(c => c.projectId === project.id);

    const newMessage = {
        id: Date.now(),
        sender: 'student',
        text: text,
        timestamp: new Date().toISOString()
    };

    if (conversationIndex >= 0) {
        conversations[conversationIndex].messages.push(newMessage);
        conversations[conversationIndex].lastUpdated = new Date().toISOString();
    } else {
        const newConversation = {
            projectId: project.id,
            projectTitle: project.title,
            professorName: project.professor.name,
            professorAvatar: project.professor.avatar,
            studentId: 1, 
            lastUpdated: new Date().toISOString(),
            messages: [newMessage]
        };
        conversations.push(newConversation);
    }

    localStorage.setItem(storageKey, JSON.stringify(conversations));
    console.log("Conversa salva no LocalStorage:", conversations);
}

function closeModal() { 
    const overlay = document.getElementById('modal-overlay-container');
    overlay.classList.remove('active');
    setTimeout(() => overlay.innerHTML = '', 300);
}

// --- PAGINAÇÃO ---
function setupPaginationEvents(totalPages) {
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                renderFeed();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (state.currentPage < totalPages) {
                state.currentPage++;
                renderFeed();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
}

// --- EVENTOS GERAIS (Menu, Tema, Filtros) ---
function setupEventListeners() {
    // Menu e Tema
    const btnMenu = document.getElementById('btn-menu-toggle');
    const overlay = document.getElementById('overlay');
    if(btnMenu) btnMenu.addEventListener('click', toggleMenu);
    if(overlay) overlay.addEventListener('click', toggleMenu);
    document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('btn-close-sidebar').addEventListener('click', toggleMenu);

    // Filtros UI
    const btnOpenFilter = document.querySelector('.btn-outline i.ph-funnel')?.parentElement;
    if (btnOpenFilter) {
        btnOpenFilter.addEventListener('click', (e) => {
            e.preventDefault();
            openFilterDrawer();
        });
    }

    document.getElementById('btn-close-filter').addEventListener('click', closeFilterDrawer);
    document.getElementById('filter-overlay').addEventListener('click', closeFilterDrawer);

    const slider = document.getElementById('filter-hours');
    const display = document.getElementById('hours-display');
    if(slider && display) {
        slider.addEventListener('input', (e) => { display.textContent = e.target.value; });
    }

    const form = document.getElementById('filter-form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            state.filters.maxHours = parseInt(document.getElementById('filter-hours').value);
            state.filters.startDate = document.getElementById('filter-date').value;
            state.filters.tag = document.getElementById('filter-tag').value;
            
            const shiftCheckboxes = document.querySelectorAll('input[name="shift"]:checked');
            state.filters.shifts = Array.from(shiftCheckboxes).map(cb => cb.value);

            applyFilters();
        });
    }

    document.getElementById('btn-clear-filters').addEventListener('click', () => {
        if(form) form.reset();
        if(display) display.textContent = "200";
        state.filters = { maxHours: 200, startDate: null, shifts: [], tag: "" };
        applyFilters();
    });
}

// Funções Auxiliares UI
function openFilterDrawer() {
    document.getElementById('filter-drawer-id').classList.add('active');
    document.getElementById('filter-overlay').classList.add('active');
}

function closeFilterDrawer() {
    document.getElementById('filter-drawer-id').classList.remove('active');
    document.getElementById('filter-overlay').classList.remove('active');
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
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
}

document.addEventListener('DOMContentLoaded', init);