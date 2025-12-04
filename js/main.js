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
import { CertificateDetailsModal } from './components/CertificateModal.js';
import { BadgeModalComponent } from './components/BadgeModal.js'; // Import único agora

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
    setupProfileEvents();
    setupProfileCertClicks();
    setupBadgeEvents();
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

function renderStaticComponents() {
    document.getElementById('app-header').innerHTML = HeaderComponent('dashboard');
    document.getElementById('app-sidebar-mobile').innerHTML = SidebarComponent('dashboard');
    document.getElementById('profile-container').innerHTML = ProfileCardComponent();
    document.getElementById('calendar-container').innerHTML = CalendarComponent();
    document.getElementById('app-footer').innerHTML = FooterComponent();
    document.getElementById('filter-drawer-container').innerHTML = FilterDrawerComponent();
}

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

function applyFilters() {
    state.filteredProjects = state.allProjects.filter(project => {
        if (project.hours > state.filters.maxHours) return false;
        if (state.filters.tag && !project.tags.some(t => t.label === state.filters.tag)) return false;
        if (state.filters.shifts.length > 0) {
            const hasShift = project.shifts && project.shifts.some(s => state.filters.shifts.includes(s));
            if (!hasShift) return false;
        }
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

// --- MODAIS ---
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
    const subscriptions = JSON.parse(localStorage.getItem('opencampus_subscriptions')) || [];
    const isSubscribed = subscriptions.includes(project.id);

    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = ProjectModalComponent(project, isSubscribed);
    requestAnimationFrame(() => overlay.classList.add('active'));
    
    document.getElementById('btn-modal-close').addEventListener('click', closeModal);
    document.getElementById('btn-modal-cancel').addEventListener('click', closeModal);

    const btnMsg = document.getElementById('btn-modal-msg');
    if(btnMsg) {
        btnMsg.addEventListener('click', () => {
            closeModal(); 
            setTimeout(() => openMessageModal(project), 300); 
        });
    }

    const btnSub = document.getElementById('btn-confirm-sub');
    if(btnSub) {
        btnSub.addEventListener('click', () => {
            subscriptions.push(project.id);
            localStorage.setItem('opencampus_subscriptions', JSON.stringify(subscriptions));
            alert(`Parabéns! Você se inscreveu em "${project.title}".`);
            openProjectModal(project);
        });
    }
    
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

function openMessageModal(project) {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = MessageModalComponent(project);
    requestAnimationFrame(() => overlay.classList.add('active'));

    document.getElementById('btn-close-msg-modal').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-msg').addEventListener('click', closeModal);
    
    document.getElementById('btn-send-msg').addEventListener('click', () => {
        const text = document.getElementById('message-text').value;
        if (!text.trim()) {
            alert("Escreva uma mensagem.");
            return;
        }
        saveMessageToStorage(project, text);
        closeModal();
        alert("Mensagem enviada!");
    });

    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

// --- CLIQUE NOS CERTIFICADOS E TROFÉUS (PROFILE) ---
function setupProfileCertClicks() {
    const certItems = document.querySelectorAll('.profile-card .cert-item');
    certItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(item.dataset.id);
            const savedCerts = JSON.parse(localStorage.getItem('opencampus_certificates')) || [];
            const cert = savedCerts.find(c => c.id === id);
            if (cert) openCertificateDetailsModal(cert);
        });
    });
}

function openCertificateDetailsModal(cert) {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = CertificateDetailsModal(cert);
    requestAnimationFrame(() => overlay.classList.add('active'));

    const btnClose = document.getElementById('btn-modal-close');
    const btnAction = document.getElementById('btn-modal-close-action');
    if(btnClose) btnClose.addEventListener('click', closeModal);
    if(btnAction) btnAction.addEventListener('click', closeModal);
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
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

    const btnClose = document.getElementById('btn-modal-close');
    const btnAction = document.getElementById('btn-modal-close-action');
    if(btnClose) btnClose.addEventListener('click', closeModal);
    if(btnAction) btnAction.addEventListener('click', closeModal);
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

// --- HELPERS ---
function saveMessageToStorage(project, text) {
    const storageKey = 'opencampus_conversations';
    let conversations = JSON.parse(localStorage.getItem(storageKey)) || [];
    let idx = conversations.findIndex(c => c.projectId === project.id);
    
    const msg = { id: Date.now(), sender: 'student', text: text, timestamp: new Date().toISOString() };

    if (idx >= 0) {
        conversations[idx].messages.push(msg);
        conversations[idx].lastUpdated = new Date().toISOString();
    } else {
        conversations.push({
            projectId: project.id, projectTitle: project.title,
            professorName: project.professor.name, professorAvatar: project.professor.avatar,
            lastUpdated: new Date().toISOString(), messages: [msg]
        });
    }
    localStorage.setItem(storageKey, JSON.stringify(conversations));
}

function closeModal() { 
    const overlay = document.getElementById('modal-overlay-container');
    overlay.classList.remove('active');
    setTimeout(() => overlay.innerHTML = '', 300);
}

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
    if(slider && display) slider.addEventListener('input', (e) => { display.textContent = e.target.value; });

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

function setupProfileEvents() {
    const profileCard = document.getElementById('profile-card-component');
    if (profileCard) {
        profileCard.addEventListener('click', () => {
            if (window.innerWidth <= 1024) profileCard.classList.toggle('expanded');
        });
    }
}

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
    const iconClass = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
    const iconHeader = document.getElementById('theme-icon-header');
    if (iconHeader) iconHeader.className = iconClass;
    const iconSidebar = document.getElementById('theme-icon-sidebar');
    if (iconSidebar) iconSidebar.className = iconClass;
}

document.addEventListener('DOMContentLoaded', init);