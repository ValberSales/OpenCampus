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
    
    // Filtra projetos do professor
    const myProjects = allProjects.filter(p => p.professor.name === user.name);
    
    const container = document.getElementById('professor-projects-grid');
    
    if (myProjects.length === 0) {
        container.innerHTML = `<div class="card p-3 text-center" style="grid-column: 1 / -1;"><p class="text-secondary mb-2">Você ainda não possui projetos.</p></div>`;
        return;
    }

    container.innerHTML = myProjects.map(p => ProfessorProjectCardComponent(p)).join('');
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

    document.getElementById('btn-modal-close').addEventListener('click', () => overlay.classList.remove('active'));

    setupTabs(overlay);
    setupEditForm(overlay, project);
}

function setupTabs(overlay) {
    const tabBtns = overlay.querySelectorAll('.tab-btn');
    const tabContents = overlay.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.style.display = 'none');
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).style.display = 'block';
        });
    });
}

// --- LÓGICA DE EDIÇÃO E UPLOAD ---
function setupEditForm(overlay, project) {
    const form = overlay.querySelector('#edit-project-form');
    const imgInput = overlay.querySelector('#edit-img-input');
    const imgTrigger = overlay.querySelector('#edit-img-trigger');
    const imgPreview = overlay.querySelector('#edit-img-preview');
    
    // Variável para segurar a imagem (começa com a atual)
    let currentImageBase64 = project.image;

    // 1. Click na imagem abre o seletor de arquivo
    imgTrigger.addEventListener('click', () => imgInput.click());

    // 2. Ao selecionar arquivo, converte para Base64 e mostra preview
    imgInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Limite de segurança simples (ex: 2MB) para não travar o LocalStorage
            if (file.size > 2 * 1024 * 1024) {
                alert("A imagem é muito grande! Por favor, use uma imagem menor que 2MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                currentImageBase64 = readerEvent.target.result;
                imgPreview.src = currentImageBase64; // Atualiza visualmente
            };
            reader.readAsDataURL(file);
        }
    });

    // 3. Salvar Alterações
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Atualiza o objeto local
        project.title = document.getElementById('edit-title').value;
        project.description = document.getElementById('edit-desc').value;
        project.date.start = document.getElementById('edit-date').value;
        project.date.schedule = document.getElementById('edit-schedule').value;
        project.vacancies.students.total = parseInt(document.getElementById('edit-v-students').value);
        project.vacancies.community.total = parseInt(document.getElementById('edit-v-community').value);
        
        // Atualiza a imagem
        project.image = currentImageBase64;

        // Salva no Banco de Dados
        updateProjectInDb(project);
        
        alert("Projeto atualizado com sucesso!");
        overlay.classList.remove('active');
        loadProfessorProjects(); // Recarrega a lista
    });
}

function updateProjectInDb(updatedProject) {
    const allProjects = DatabaseService.getAllProjects();
    const index = allProjects.findIndex(p => p.id === updatedProject.id);
    
    if (index !== -1) {
        allProjects[index] = updatedProject;
        localStorage.setItem('opencampus_projects', JSON.stringify(allProjects));
    }
}

function setupEventListeners() {
    // Menu e Tema
    const btnMenu = document.getElementById('btn-menu-toggle');
    if(btnMenu) btnMenu.addEventListener('click', toggleMenu);
    document.getElementById('btn-close-sidebar')?.addEventListener('click', toggleMenu);
    document.getElementById('overlay')?.addEventListener('click', toggleMenu);
    document.getElementById('sidebar-theme-btn')?.addEventListener('click', toggleTheme);
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
}

document.addEventListener('DOMContentLoaded', init);