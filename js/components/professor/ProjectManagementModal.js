import { ProfessorHeaderComponent } from '../components/professor/ProfessorHeader.js';
import { ProfessorSidebarComponent } from '../components/professor/ProfessorSidebar.js';
import { FooterComponent } from '../components/shared/Footer.js';
import { ProfessorProjectCardComponent } from '../components/professor/ProfessorProjectCard.js';
import { ProjectManagementModal } from '../components/professor/ProjectManagementModal.js';
// IMPORTAÇÃO NOVA: Modais de Chamada/Diário
import { ClassLogModal, AttendanceFormModal } from '../components/professor/AttendanceModal.js';
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

// --- SUPER MODAL DE GESTÃO ---
function openManagementModal(project) {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = ProjectManagementModal(project);
    requestAnimationFrame(() => overlay.classList.add('active'));

    // Fechar Modal Principal
    document.getElementById('btn-modal-close').addEventListener('click', () => {
        overlay.classList.remove('active');
        // Recarrega a lista ao fechar para refletir edições (ex: imagem nova)
        loadProfessorProjects();
    });

    setupTabs(overlay);
    setupEditForm(overlay, project);

    // Conecta o Botão "Abrir Diário / Frequência" (Aba Alunos)
    const btnOpenDiary = overlay.querySelector('#btn-open-diary');
    if (btnOpenDiary) {
        btnOpenDiary.addEventListener('click', () => {
            openClassLogModal(project);
        });
    }
}

function setupTabs(overlay) {
    const tabBtns = overlay.querySelectorAll('.tab-btn');
    const tabContents = overlay.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.style.display = 'none');
            
            btn.classList.add('active');
            const targetId = `tab-${btn.dataset.tab}`;
            document.getElementById(targetId).style.display = 'block';
        });
    });
}

// --- LÓGICA DE EDIÇÃO E UPLOAD (ABA 1) ---
function setupEditForm(overlay, project) {
    const form = overlay.querySelector('#edit-project-form');
    const imgInput = overlay.querySelector('#edit-img-input');
    const imgTrigger = overlay.querySelector('#edit-img-trigger');
    const imgPreview = overlay.querySelector('#edit-img-preview');
    
    let currentImageBase64 = project.image;

    // Upload de Imagem
    if(imgTrigger && imgInput) {
        imgTrigger.addEventListener('click', () => imgInput.click());
        
        imgInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    alert("A imagem é muito grande! Use uma imagem menor que 2MB.");
                    return;
                }
                const reader = new FileReader();
                reader.onload = (readerEvent) => {
                    currentImageBase64 = readerEvent.target.result;
                    imgPreview.src = currentImageBase64;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Salvar
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            project.title = document.getElementById('edit-title').value;
            project.description = document.getElementById('edit-desc').value;
            project.date.start = document.getElementById('edit-date').value;
            project.date.schedule = document.getElementById('edit-schedule').value;
            project.vacancies.students.total = parseInt(document.getElementById('edit-v-students').value);
            project.vacancies.community.total = parseInt(document.getElementById('edit-v-community').value);
            project.image = currentImageBase64;

            updateProjectInDb(project);
            alert("Projeto atualizado com sucesso!");
        });
    }
}

function updateProjectInDb(updatedProject) {
    const allProjects = DatabaseService.getAllProjects();
    const index = allProjects.findIndex(p => p.id === updatedProject.id);
    
    if (index !== -1) {
        allProjects[index] = updatedProject;
        localStorage.setItem('opencampus_projects', JSON.stringify(allProjects));
    }
}

// --- NOVO: LÓGICA DE DIÁRIO DE CLASSE (MODAL SECUNDÁRIO) ---

function openClassLogModal(project) {
    // Cria um overlay secundário para ficar por cima do principal
    const diaryOverlay = document.createElement('div');
    diaryOverlay.className = 'modal-overlay';
    diaryOverlay.style.zIndex = '3500'; // Maior que o padrão
    diaryOverlay.innerHTML = ClassLogModal(project);
    document.body.appendChild(diaryOverlay);
    
    requestAnimationFrame(() => diaryOverlay.classList.add('active'));

    const close = () => {
        diaryOverlay.classList.remove('active');
        setTimeout(() => diaryOverlay.remove(), 300);
    };

    diaryOverlay.querySelector('.btn-close-secondary').addEventListener('click', close);
    diaryOverlay.addEventListener('click', (e) => { if(e.target === diaryOverlay) close(); });

    // Botão "Registrar Aula"
    const btnNewClass = diaryOverlay.querySelector('#btn-new-class');
    if(btnNewClass) {
        btnNewClass.addEventListener('click', () => {
            openAttendanceForm(project, null, diaryOverlay); // null = nova aula
        });
    }

    // Botões de Edição (Delegation)
    diaryOverlay.addEventListener('click', (e) => {
        const btnEdit = e.target.closest('.btn-edit-class');
        if (btnEdit) {
            const classId = parseInt(btnEdit.dataset.id);
            const classData = DatabaseService.getProjectClasses(project.id).find(c => c.id === classId);
            openAttendanceForm(project, classData, diaryOverlay);
        }
    });
}

function openAttendanceForm(project, classData, parentOverlay) {
    // Substitui o conteúdo do overlay secundário pelo formulário
    parentOverlay.innerHTML = AttendanceFormModal(project, classData);

    // Botão Voltar para Lista
    parentOverlay.querySelector('#btn-back-to-log').addEventListener('click', () => {
        // Remove o overlay atual e reabre o Log para "resetar" a visualização
        parentOverlay.remove();
        openClassLogModal(project); 
    });

    // Botão Fechar Tudo
    parentOverlay.querySelector('.btn-close-secondary').addEventListener('click', () => parentOverlay.remove());

    // Submit da Chamada
    const form = parentOverlay.querySelector('#attendance-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Coleta dados dos checkboxes
        const attendance = [];
        parentOverlay.querySelectorAll('.attendance-check').forEach(chk => {
            attendance.push({
                studentId: parseInt(chk.dataset.id), // Mock ID
                present: chk.checked
            });
        });

        const newClass = {
            id: classData ? classData.id : null,
            projectId: project.id,
            date: document.getElementById('class-date').value,
            description: document.getElementById('class-desc').value,
            attendance: attendance
        };

        DatabaseService.saveProjectClass(newClass);
        alert("Chamada registrada com sucesso!");
        
        // Volta para a lista de histórico
        parentOverlay.remove();
        openClassLogModal(project);
    });
}

// --- UTILS ---
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