import { ProfessorHeaderComponent } from '../components/professor/ProfessorHeader.js';
import { ProfessorSidebarComponent } from '../components/professor/ProfessorSidebar.js';
import { FooterComponent } from '../components/shared/Footer.js';
import { CalendarComponent } from '../components/shared/Calendar.js';
import { DatabaseService } from '../services/DatabaseService.js';

async function init() {
    await DatabaseService.init();
    
    // Renderiza Componentes Base
    document.getElementById('app-header').innerHTML = ProfessorHeaderComponent('dashboard');
    document.getElementById('app-sidebar-mobile').innerHTML = ProfessorSidebarComponent('dashboard');
    document.getElementById('app-footer').innerHTML = FooterComponent();
    document.getElementById('calendar-container').innerHTML = CalendarComponent();

    loadDashboardData();
    setupEventListeners();
}

function loadDashboardData() {
    const user = DatabaseService.getCurrentUser();
    
    // Preenche Perfil Lateral
    if (user) {
        document.getElementById('prof-name-display').textContent = user.name;
        document.getElementById('prof-avatar-img').src = user.avatar;
    }

    // Calcula Estatísticas (Simulação)
    // 1. Busca projetos onde o 'professor.name' é igual ao usuário logado (Match simples por string para o protótipo)
    const allProjects = DatabaseService.getAllProjects();
    const myProjects = allProjects.filter(p => p.professor.name === user.name);
    
    // 2. Calcula total de alunos (somando vagas ocupadas dos meus projetos)
    let totalStudents = 0;
    myProjects.forEach(p => {
        const taken = (p.vacancies.students.total - p.vacancies.students.available) + 
                      (p.vacancies.community.total - p.vacancies.community.available);
        totalStudents += taken;
    });

    // 3. Busca solicitações pendentes (se implementado no service)
    // Por enquanto, mockamos ou lemos do localStorage se existir
    const requests = JSON.parse(localStorage.getItem('opencampus_community_requests')) || [];
    // Filtra solicitações apenas dos MEUS projetos
    const myProjectIds = myProjects.map(p => p.id);
    const pendingRequests = requests.filter(r => myProjectIds.includes(r.projectId) && r.status === 'pending');

    // Atualiza a UI
    document.getElementById('stat-active-projects').textContent = myProjects.length;
    document.getElementById('stat-total-students').textContent = totalStudents;
    document.getElementById('stat-pending-requests').textContent = pendingRequests.length;
}

// Utilitários de Tema e Menu (Mesmo padrão do Aluno)
function setupEventListeners() {
    const btnMenu = document.getElementById('btn-menu-toggle');
    const overlay = document.getElementById('overlay');
    
    if(btnMenu) btnMenu.addEventListener('click', toggleMenu);
    if(overlay) overlay.addEventListener('click', toggleMenu);
    
    const closeBtn = document.getElementById('btn-close-sidebar');
    if(closeBtn) closeBtn.addEventListener('click', toggleMenu);

    const btnTheme = document.getElementById('header-theme-btn');
    if(btnTheme) btnTheme.addEventListener('click', toggleTheme);
    
    const btnThemeSide = document.getElementById('sidebar-theme-btn');
    if(btnThemeSide) btnThemeSide.addEventListener('click', () => { toggleTheme(); toggleMenu(); });
    
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

function loadTheme() {
    const saved = localStorage.getItem('opencampus-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
}

document.addEventListener('DOMContentLoaded', init);