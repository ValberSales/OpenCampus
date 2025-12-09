import { ProfessorHeaderComponent } from '../components/professor/ProfessorHeader.js';
import { ProfessorSidebarComponent } from '../components/professor/ProfessorSidebar.js';
import { FooterComponent } from '../components/shared/Footer.js';
import { ProfessorProjectCardComponent } from '../components/professor/ProfessorProjectCard.js';
import { ProjectManagementModal } from '../components/professor/ProjectManagementModal.js';
import { AttendanceFormModal } from '../components/professor/AttendanceModal.js';
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

    const myProjects = allProjects.filter(p => {
        return (p.professor.id === user.id) || 
               (p.professor.name && user.name && p.professor.name.toLowerCase().includes(user.name.toLowerCase()));
    });

    const container = document.getElementById('professor-projects-grid');
    if (myProjects.length === 0) {
        container.innerHTML = `<div class="card p-3 text-center" style="grid-column: 1/-1;">Nenhum projeto encontrado.</div>`;
        return;
    }
    container.innerHTML = myProjects.map(p => ProfessorProjectCardComponent(p)).join('');
    setupCardActions(myProjects);
}

function setupCardActions(projects) {
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', () => {
            const project = projects.find(p => p.id === parseInt(card.dataset.id));
            openManagementModal(project);
        });
    });
}

function openManagementModal(project) {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = ProjectManagementModal(project);
    requestAnimationFrame(() => overlay.classList.add('active'));

    const closeModal = () => {
        overlay.classList.remove('active');
        setTimeout(() => loadProfessorProjects(), 300);
    };

    // Botões de Fechar
    const closeBtns = overlay.querySelectorAll('#btn-modal-close, #btn-modal-cancel, #btn-header-close');
    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

    // Scroll Header Logic
    const scrollBody = document.getElementById('modal-scroll-body');
    const stickyHeader = document.getElementById('pm-sticky-header');
    if(scrollBody && stickyHeader) {
        scrollBody.addEventListener('scroll', () => {
            stickyHeader.style.opacity = scrollBody.scrollTop > 180 ? '1' : '0';
        });
    }

    setupTabs(overlay);
    setupEditForm(overlay, project);

    // --- LÓGICA DE FLIP (DIÁRIO) ---
    const flipContainer = document.getElementById('flip-container');
    
    document.getElementById('btn-flip-diary').addEventListener('click', () => {
        flipContainer.classList.add('flipped');
    });

    document.getElementById('btn-flip-back').addEventListener('click', () => {
        flipContainer.classList.remove('flipped');
    });

    // Novo registro (no estado vazio ou botão footer)
    const btnNewClass = document.getElementById('btn-new-class');
    const btnNewClassEmpty = document.getElementById('btn-new-class-empty');
    if(btnNewClass) btnNewClass.addEventListener('click', () => openAttendanceForm(project, null));
    if(btnNewClassEmpty) btnNewClassEmpty.addEventListener('click', () => openAttendanceForm(project, null));

    // Edição de aula (Delegation)
    const flipBack = overlay.querySelector('.pm-flip-back');
    flipBack.addEventListener('click', (e) => {
        const btnEdit = e.target.closest('.btn-edit-class');
        if(btnEdit) {
            const classId = parseInt(btnEdit.dataset.id);
            const classData = DatabaseService.getProjectClasses(project.id).find(c => c.id === classId);
            openAttendanceForm(project, classData);
        }
    });

    // --- VIEW / EDIT TOGGLE ---
    const viewContainer = overlay.querySelector('#view-mode-container');
    const editContainer = overlay.querySelector('#edit-mode-container');
    const viewFooter = overlay.querySelector('#view-footer-actions');
    const editFooter = overlay.querySelector('#edit-footer-actions');

    overlay.querySelector('#btn-enable-edit').addEventListener('click', () => {
        viewContainer.style.display = 'none'; viewFooter.style.display = 'none';
        editContainer.style.display = 'block'; editFooter.style.display = 'flex';
        scrollBody.scrollTop = 0;
    });

    overlay.querySelector('#btn-cancel-edit').addEventListener('click', () => {
        editContainer.style.display = 'none'; editFooter.style.display = 'none';
        viewContainer.style.display = 'block'; viewFooter.style.display = 'flex';
        scrollBody.scrollTop = 0;
    });
}

function openAttendanceForm(project, classData) {
    // Cria modal sobreposto para o formulário
    const dOverlay = document.createElement('div');
    dOverlay.className = 'modal-overlay';
    dOverlay.style.zIndex = '3500'; // Garante que fique acima do modal principal
    dOverlay.innerHTML = AttendanceFormModal(project, classData);
    document.body.appendChild(dOverlay);
    requestAnimationFrame(() => dOverlay.classList.add('active'));

    const closeForm = () => dOverlay.remove();
    
    // Configura botões de fechar (X e Cancelar)
    dOverlay.querySelectorAll('.btn-close-secondary').forEach(btn => 
        btn.addEventListener('click', closeForm)
    );

    // Lógica "Marcar Todos" (Agora por Grupo: Alunos ou Externos)
    dOverlay.querySelectorAll('.btn-toggle-group').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Evita submit acidental
            const type = e.target.dataset.target; // Pega se é 'student' ou 'external'
            const checks = dOverlay.querySelectorAll(`.attendance-check[data-type="${type}"]`);
            
            if (checks.length === 0) return;

            // Se todos estiverem marcados, desmarca. Senão, marca todos.
            const allChecked = Array.from(checks).every(c => c.checked);
            
            checks.forEach(c => c.checked = !allChecked);
            
            // Atualiza o texto do botão para dar feedback visual
            e.target.textContent = allChecked ? "Marcar Todos" : "Desmarcar Todos";
        });
    });

    // Salvar Chamada
    const form = dOverlay.querySelector('#attendance-form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const attendance = [];
            dOverlay.querySelectorAll('.attendance-check').forEach(chk => {
                // Tratamento de ID: Alunos usam Int, Externos (mock) usam String
                const rawId = chk.dataset.id;
                const type = chk.dataset.type;
                const id = type === 'student' ? parseInt(rawId) : rawId;

                attendance.push({ 
                    studentId: id, 
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
            alert("Chamada salva com sucesso!");
            closeForm();
            
            // Recarrega o modal principal para atualizar a lista do histórico
            openManagementModal(project);
            
            // Hack Visual: Força o modal a voltar para o verso (Diário) imediatamente
            // para o usuário não perder o contexto de onde estava
            setTimeout(() => {
                const flipContainer = document.getElementById('flip-container');
                if(flipContainer) flipContainer.classList.add('flipped');
            }, 100);
        });
    }
}

// ... (setupTabs, setupEditForm, updateProjectInDb, setupEventListeners mantidos iguais) ...
function setupTabs(overlay) {
    const tabBtns = overlay.querySelectorAll('.pm-tab-btn');
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

function setupEditForm(overlay, project) {
    const form = overlay.querySelector('#edit-project-form');
    const imgTrigger = overlay.querySelector('#edit-img-trigger');
    const imgInput = overlay.querySelector('#edit-img-input');
    const imgPreview = overlay.querySelector('#edit-img-preview');
    let currentImage = project.image;

    if(imgTrigger && imgInput) {
        imgTrigger.addEventListener('click', () => imgInput.click());
        imgInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if(file) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    currentImage = ev.target.result;
                    imgPreview.src = currentImage;
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
            project.vacancies.students.total = parseInt(document.getElementById('edit-v-students').value);
            project.vacancies.community.total = parseInt(document.getElementById('edit-v-community').value);
            project.image = currentImage;
            updateProjectInDb(project);
            alert("Salvo com sucesso!");
            document.getElementById('btn-cancel-edit').click();
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

function setupEventListeners() {
    const btnMenu = document.getElementById('btn-menu-toggle');
    const overlay = document.getElementById('overlay');
    if (btnMenu) btnMenu.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);
    document.getElementById('btn-close-sidebar')?.addEventListener('click', toggleMenu);
    document.getElementById('sidebar-theme-btn')?.addEventListener('click', toggleTheme);
    loadTheme();
}
function toggleMenu() { document.getElementById('sidebar').classList.toggle('active'); document.getElementById('overlay').classList.toggle('active'); }
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