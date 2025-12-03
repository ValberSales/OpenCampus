import { HeaderComponent } from './components/Header.js';
import { SidebarComponent } from './components/Sidebar.js';
import { ProfileCardComponent } from './components/ProfileCard.js';
import { ProjectCardComponent } from './components/ProjectCard.js';
import { CalendarComponent } from './components/Calendar.js';
import { FooterComponent } from './components/Footer.js';
import { PaginationComponent } from './components/Pagination.js';
import { ProjectModalComponent } from './components/ProjectModal.js';
import { FilterDrawerComponent } from './components/FilterDrawer.js'; // Novo Import

// --- ESTADO DA APLICAÇÃO ---
const state = {
    allProjects: [],      // Todos os projetos carregados da API
    filteredProjects: [], // Projetos exibidos após filtro
    currentPage: 1,
    itemsPerPage: 4,
    filters: {            // Guarda os filtros ativos
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
            `<p class="text-center text-secondary p-3">Erro ao carregar dados. Verifique o console.</p>`;
    }
    
    setupEventListeners();
    loadTheme();
}

async function fetchProjects() {
    const response = await fetch('./data/projects.json');
    if (!response.ok) throw new Error('Falha na rede');
    const data = await response.json();
    
    state.allProjects = data;
    state.filteredProjects = data; // Inicialmente, todos são mostrados
    
    renderFeed();
}

// Renderiza estáticos + Gaveta de Filtro
function renderStaticComponents() {
    document.getElementById('app-header').innerHTML = HeaderComponent();
    document.getElementById('app-sidebar-mobile').innerHTML = SidebarComponent();
    document.getElementById('profile-container').innerHTML = ProfileCardComponent();
    document.getElementById('calendar-container').innerHTML = CalendarComponent();
    document.getElementById('app-footer').innerHTML = FooterComponent();
    
    // Injeta a Gaveta de Filtros
    document.getElementById('filter-drawer-container').innerHTML = FilterDrawerComponent();
}

// Renderiza Feed baseado em filteredProjects
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
    setupModalEvents();
}

// --- LÓGICA DE FILTRAGEM ---
function applyFilters() {
    state.filteredProjects = state.allProjects.filter(project => {
        // 1. Filtro de Horas
        if (project.hours > state.filters.maxHours) return false;

        // 2. Filtro de Tema/Tag
        if (state.filters.tag && !project.tags.some(t => t.label === state.filters.tag)) return false;

        // 3. Filtro de Turno (Se algum turno selecionado bater com os do projeto)
        if (state.filters.shifts.length > 0) {
            const hasShift = project.shifts && project.shifts.some(s => state.filters.shifts.includes(s));
            if (!hasShift) return false;
        }

        // 4. Filtro de Data (A partir de...)
        if (state.filters.startDate) {
            const projDateParts = project.date.start.split('/'); // dd/mm/yyyy
            // Cria data JS (ano, mês-1, dia)
            const projectDate = new Date(projDateParts[2], projDateParts[1] - 1, projDateParts[0]);
            const filterDate = new Date(state.filters.startDate);
            
            // Se a data do projeto for anterior à data do filtro, esconde
            if (projectDate < filterDate) return false;
        }

        return true;
    });

    state.currentPage = 1; // Volta pra pag 1 ao filtrar
    renderFeed();
    closeFilterDrawer();
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    // Menu e Tema (Existentes)
    const btnMenu = document.getElementById('btn-menu-toggle');
    const overlay = document.getElementById('overlay');
    if(btnMenu) btnMenu.addEventListener('click', toggleMenu);
    if(overlay) overlay.addEventListener('click', toggleMenu);
    document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('btn-close-sidebar').addEventListener('click', toggleMenu);

    // --- NOVOS EVENTOS DE FILTRO ---
    
    // Abrir Gaveta (Botão na UI principal)
    // Precisamos garantir que esse botão exista no index.html ou seja injetado
    // No código original, era um botão estático. Vamos adicionar o ID nele no index.html.
    const btnOpenFilter = document.querySelector('.btn-outline i.ph-funnel')?.parentElement;
    if (btnOpenFilter) {
        btnOpenFilter.addEventListener('click', (e) => {
            e.preventDefault(); // Evita refresh se for link
            openFilterDrawer();
        });
    }

    // Fechar Gaveta
    document.getElementById('btn-close-filter').addEventListener('click', closeFilterDrawer);
    document.getElementById('filter-overlay').addEventListener('click', closeFilterDrawer);

    // Slider de Horas (Atualizar numero visualmente)
    const slider = document.getElementById('filter-hours');
    const display = document.getElementById('hours-display');
    slider.addEventListener('input', (e) => {
        display.textContent = e.target.value;
    });

    // Submeter Formulário
    const form = document.getElementById('filter-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Captura valores
        state.filters.maxHours = parseInt(document.getElementById('filter-hours').value);
        state.filters.startDate = document.getElementById('filter-date').value;
        state.filters.tag = document.getElementById('filter-tag').value;
        
        // Checkboxes de Turno
        const shiftCheckboxes = document.querySelectorAll('input[name="shift"]:checked');
        state.filters.shifts = Array.from(shiftCheckboxes).map(cb => cb.value);

        applyFilters();
    });

    // Limpar Filtros
    document.getElementById('btn-clear-filters').addEventListener('click', () => {
        form.reset();
        document.getElementById('hours-display').textContent = "200";
        state.filters = { maxHours: 200, startDate: null, shifts: [], tag: "" };
        applyFilters();
    });
}

// --- FUNÇÕES DE UI AUXILIARES ---
function openFilterDrawer() {
    document.getElementById('filter-drawer-id').classList.add('active');
    document.getElementById('filter-overlay').classList.add('active');
}

function closeFilterDrawer() {
    document.getElementById('filter-drawer-id').classList.remove('active');
    document.getElementById('filter-overlay').classList.remove('active');
}

// --- (Restante das funções: Modal, Paginação, Tema iguais ao anterior) ---
// Copie aqui as funções setupPaginationEvents, setupModalEvents, openModal, closeModal, toggleMenu, toggleTheme etc...
// Para brevidade, estou omitindo a repetição, mas mantenha-as no arquivo final.
function setupPaginationEvents(totalPages) { /* ... */ }
function setupModalEvents() { 
    const btnsOpen = document.querySelectorAll('.btn-open-modal');
    btnsOpen.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const projectId = parseInt(e.target.dataset.id);
            const project = state.allProjects.find(p => p.id === projectId); // Muda de state.projects para allProjects
            if (project) openModal(project);
        });
    });
}
function openModal(project) { 
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = ProjectModalComponent(project);
    requestAnimationFrame(() => overlay.classList.add('active'));
    document.getElementById('btn-modal-close').addEventListener('click', closeModal);
    document.getElementById('btn-modal-cancel').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
}
function closeModal() { 
    const overlay = document.getElementById('modal-overlay-container');
    overlay.classList.remove('active');
    setTimeout(() => overlay.innerHTML = '', 300);
}
function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
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