import { ProfessorHeaderComponent } from '../components/professor/ProfessorHeader.js';
import { ProfessorSidebarComponent } from '../components/professor/ProfessorSidebar.js';
import { FooterComponent } from '../components/shared/Footer.js';
import { ProfessorProjectCardComponent } from '../components/professor/ProfessorProjectCard.js';
import { ProjectManagementModal } from '../components/professor/ProjectManagementModal.js';
import { DatabaseService } from '../services/DatabaseService.js';

async function init() {
    await DatabaseService.init();
    
    document.getElementById('app-header').innerHTML = ProfessorHeaderComponent('projects');
    document.getElementById('app-sidebar-mobile').innerHTML = ProfessorSidebarComponent('projects');
    document.getElementById('app-footer').innerHTML = FooterComponent();

    loadProfessorProjects();
    setupEventListeners();
}

function loadProfessorProjects() {
    const user = DatabaseService.getCurrentUser();
    const allProjects = DatabaseService.getAllProjects();
    
    // Filtra projetos onde o professor é o dono (Match por nome)
    const myProjects = allProjects.filter(p => p.professor.name === user.name);
    
    const container = document.getElementById('professor-projects-grid');
    
    if (myProjects.length === 0) {
        container.innerHTML = `
            <div class="card p-3 text-center" style="grid-column: 1 / -1;">
                <p class="text-secondary mb-2">Você ainda não possui projetos cadastrados.</p>
            </div>`;
        return;
    }

    container.innerHTML = myProjects.map(p => ProfessorProjectCardComponent(p)).join('');
    
    // Conecta eventos aos cards
    setupCardActions(myProjects);
}

function setupCardActions(projects) {
    document.querySelectorAll('.btn-manage').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.project-card');
            const id = parseInt(card.dataset.id);
            const project = projects.find(p => p.id === id);
            openManagementModal(project);
        });
    });
}

function openManagementModal(project) {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = ProjectManagementModal(project);
    requestAnimationFrame(() => overlay.classList.add('active'));

    // Fechar
    document.getElementById('btn-modal-close').addEventListener('click', () => {
        overlay.classList.remove('active');
    });

    // Lógica de Troca de Abas (Tabs)
    const tabBtns = overlay.querySelectorAll('.tab-btn');
    const tabContents = overlay.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active de todos
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.style.display = 'none');

            // Ativa o clicado
            btn.classList.add('active');
            const targetId = `tab-${btn.dataset.tab}`;
            document.getElementById(targetId).style.display = 'block';
        });
    });
}

function setupEventListeners() {
    // Menu Mobile e Tema (Padrão)
    // ... (Copie a lógica padrão de toggleMenu e toggleTheme aqui se necessário, 
    // ou importe de um helper compartilhado se criarmos um 'utils.js' no futuro)
}

document.addEventListener('DOMContentLoaded', init);