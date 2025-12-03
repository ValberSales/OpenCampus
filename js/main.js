// Importando os componentes
import { HeaderComponent } from './components/Header.js';
import { SidebarComponent } from './components/Sidebar.js';
import { ProfileCardComponent } from './components/ProfileCard.js';
import { ProjectCardComponent } from './components/ProjectCard.js';
import { CalendarComponent } from './components/Calendar.js';
import { FooterComponent } from './components/Footer.js';

// Dados (Mock)
const projectsData = [
    {
        title: "Inclusão Digital para Idosos",
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        description: "Projeto focado em ensinar o básico de smartphones e computadores para a terceira idade.",
        tags: [{ label: "Tecnologia", class: "badge-tech" }, { label: "Social", class: "badge-env" }]
    },
    {
        title: "Robótica nas Escolas",
        image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        description: "Oficinas semanais de robótica e lógica de programação com Arduino.",
        tags: [{ label: "Educação", class: "badge-tech" }]
    }
];

// Funções de Inicialização
function init() {
    renderComponents();
    setupEventListeners();
    loadTheme();
}

function renderComponents() {
    document.getElementById('app-header').innerHTML = HeaderComponent();
    document.getElementById('app-sidebar-mobile').innerHTML = SidebarComponent();
    document.getElementById('profile-container').innerHTML = ProfileCardComponent();
    document.getElementById('calendar-container').innerHTML = CalendarComponent();
    document.getElementById('app-footer').innerHTML = FooterComponent();

    // Renderiza Projetos (Loop)
    const projectsContainer = document.getElementById('projects-container');
    projectsContainer.innerHTML = projectsData.map(p => ProjectCardComponent(p)).join('');
}

function setupEventListeners() {
    // Menu Mobile
    const btnMenu = document.getElementById('btn-menu-toggle');
    const btnClose = document.getElementById('btn-close-sidebar');
    const overlay = document.getElementById('overlay');
    
    // Como os elementos foram criados via JS, precisamos usar delegate ou checar existência
    if(btnMenu) btnMenu.addEventListener('click', toggleMenu);
    if(btnClose) btnClose.addEventListener('click', toggleMenu);
    if(overlay) overlay.addEventListener('click', toggleMenu);

    // Tema
    const btnTheme = document.getElementById('btn-theme-toggle');
    if(btnTheme) btnTheme.addEventListener('click', toggleTheme);
}

// Lógica de UI (Auxiliares)
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
    if (icon) {
        icon.className = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
    }
}

// Inicia a aplicação
document.addEventListener('DOMContentLoaded', init);