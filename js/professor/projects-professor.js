import { ProfessorHeaderComponent } from '../components/professor/ProfessorHeader.js';
import { ProfessorSidebarComponent } from '../components/professor/ProfessorSidebar.js';
import { FooterComponent } from '../components/shared/Footer.js';
import { ProfessorProjectCardComponent } from '../components/professor/ProfessorProjectCard.js';
import { ProjectManagementModal } from '../components/professor/ProjectManagementModal.js';
// Importação do Diário de Classe (Recuperada)
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
    
    // --- CORREÇÃO DO FILTRO ---
    // Compara pelo ID (mais seguro) OU pelo nome (fallback para dados legados)
    const myProjects = allProjects.filter(p => {
        const idMatch = p.professor.id === user.id;
        // Fallback: se não tiver ID, tenta comparar nomes de forma flexível
        const nameMatch = p.professor.name && user.name && 
                          p.professor.name.toLowerCase().includes(user.name.toLowerCase());
        
        return idMatch || nameMatch;
    });
    
    const container = document.getElementById('professor-projects-grid');
    
    if (myProjects.length === 0) {
        container.innerHTML = `
            <div class="card p-3 text-center" style="grid-column: 1 / -1;">
                <p class="text-secondary mb-2">Nenhum projeto encontrado para <strong>${user.name}</strong>.</p>
                <small class="text-secondary">Dica: Verifique se você está logado com a conta correta.</small>
            </div>`;
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

// --- SUPER MODAL DE GESTÃO ---
function openManagementModal(project) {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = ProjectManagementModal(project);
    requestAnimationFrame(() => overlay.classList.add('active'));

    document.getElementById('btn-modal-close').addEventListener('click', () => {
        overlay.classList.remove('active');
        // Recarrega a lista para atualizar dados (ex: nova imagem)
        loadProfessorProjects();
    });

    setupTabs(overlay);
    setupEditForm(overlay, project);

    // Conecta o botão do Diário de Classe
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

// --- EDIÇÃO E UPLOAD DE IMAGEM ---
function setupEditForm(overlay, project) {
    const form = overlay.querySelector('#edit-project-form');
    const imgInput = overlay.querySelector('#edit-img-input');
    const imgTrigger = overlay.querySelector('#edit-img-trigger');
    const imgPreview = overlay.querySelector('#edit-img-preview');
    
    let currentImageBase64 = project.image;

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

// --- DIÁRIO DE CLASSE (MODAL SECUNDÁRIO) ---
function openClassLogModal(project) {
    const diaryOverlay = document.createElement('div');
    diaryOverlay.className = 'modal-overlay';
    diaryOverlay.style.zIndex = '3500';
    diaryOverlay.innerHTML = ClassLogModal(project);
    document.body.appendChild(diaryOverlay);
    
    requestAnimationFrame(() => diaryOverlay.classList.add('active'));

    const close = () => {
        diaryOverlay.classList.remove('active');
        setTimeout(() => diaryOverlay.remove(), 300);
    };

    diaryOverlay.querySelector('.btn-close-secondary').addEventListener('click', close);
    diaryOverlay.addEventListener('click', (e) => { if(e.target === diaryOverlay) close(); });

    const btnNewClass = diaryOverlay.querySelector('#btn-new-class');
    if(btnNewClass) {
        btnNewClass.addEventListener('click', () => {
            openAttendanceForm(project, null, diaryOverlay);
        });
    }

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
    parentOverlay.innerHTML = AttendanceFormModal(project, classData);

    parentOverlay.querySelector('#btn-back-to-log').addEventListener('click', () => {
        parentOverlay.remove();
        openClassLogModal(project); 
    });

    parentOverlay.querySelector('.btn-close-secondary').addEventListener('click', () => parentOverlay.remove());

    const form = parentOverlay.querySelector('#attendance-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const attendance = [];
        parentOverlay.querySelectorAll('.attendance-check').forEach(chk => {
            attendance.push({
                studentId: parseInt(chk.dataset.id),
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
    document.getElementById('btn-close-sidebar')?.addEventListener('click', toggleMenu);
    document.getElementById('sidebar-theme-btn')?.addEventListener('click', toggleTheme);
    loadTheme();
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

function loadTheme() {
    const saved = localStorage.getItem('opencampus-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
}

document.addEventListener('DOMContentLoaded', init);