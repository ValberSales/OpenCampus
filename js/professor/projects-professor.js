import { ProfessorHeaderComponent } from '../components/professor/ProfessorHeader.js';
import { ProfessorSidebarComponent } from '../components/professor/ProfessorSidebar.js';
import { FooterComponent } from '../components/shared/Footer.js';
import { ProfessorProjectCardComponent } from '../components/professor/ProfessorProjectCard.js';
import { ProjectManagementModal } from '../components/professor/ProjectManagementModal.js';
import { AttendanceFormModal } from '../components/professor/AttendanceModal.js';
import { CreateProjectModal } from '../components/professor/CreateProjectModal.js';
import { DatabaseService } from '../services/DatabaseService.js';

async function init() {
    await DatabaseService.init();

    document.getElementById('app-header').innerHTML = ProfessorHeaderComponent('projects');
    document.getElementById('app-sidebar-mobile').innerHTML = ProfessorSidebarComponent('projects');
    document.getElementById('app-footer').innerHTML = FooterComponent();

    loadProfessorProjects();
    setupEventListeners();

    const btnCreate = document.getElementById('btn-create-project');
    if(btnCreate) {
        btnCreate.addEventListener('click', openCreateModal);
    }

    const urlParams = new URLSearchParams(window.location.search);
    if(urlParams.get('action') === 'new') {
        window.history.replaceState({}, document.title, window.location.pathname);
        openCreateModal();
    }
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

// =========================================
// LÓGICA DO MODAL DE CRIAÇÃO
// =========================================
function openCreateModal() {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = CreateProjectModal();
    requestAnimationFrame(() => overlay.classList.add('active'));

    const imgTrigger = document.getElementById('create-img-trigger');
    const imgInput = document.getElementById('create-img-input');
    const imgPreview = document.getElementById('create-img-preview');
    const imgPlaceholder = document.getElementById('create-img-placeholder');
    let imageBase64 = "https://placehold.co/600x400/e2e8f0/64748b?text=Sem+Imagem";

    if (imgTrigger && imgInput) {
        imgTrigger.addEventListener('click', () => imgInput.click());
        
        imgInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    imageBase64 = await compressImage(file, 800, 0.7);
                    if(imgPreview) {
                        imgPreview.src = imageBase64;
                        imgPreview.style.display = 'block';
                    }
                    if(imgPlaceholder) imgPlaceholder.style.display = 'none';
                } catch (err) {
                    console.error("Erro ao processar imagem", err);
                    alert("Não foi possível processar essa imagem.");
                }
            }
        });
    }

    const form = document.getElementById('create-project-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const category = document.getElementById('create-category').value;
            let tagClass = 'badge-tech';
            if(['Meio Ambiente', 'Saúde', 'Agronomia'].includes(category)) tagClass = 'badge-env';
            if(['Social', 'Cultura', 'Artes'].includes(category)) tagClass = 'badge-art';

            const newProjectData = {
                title: document.getElementById('create-title').value,
                description: document.getElementById('create-desc').value,
                image: imageBase64,
                date: {
                    isOneDay: false,
                    start: formatDate(document.getElementById('create-start').value),
                    end: formatDate(document.getElementById('create-end').value),
                    schedule: document.getElementById('create-schedule').value
                },
                location: document.getElementById('create-location').value,
                hours: parseInt(document.getElementById('create-hours').value),
                tags: [{ label: category, class: tagClass }],
                openToCommunity: document.getElementById('create-open').checked,
                vacancies: {
                    students: document.getElementById('create-v-students').value,
                    community: document.getElementById('create-v-community').value
                }
            };

            const success = DatabaseService.createProject(newProjectData);
            
            if (success) {
                alert('Projeto criado com sucesso!');
                closeModal();
                loadProfessorProjects();
            }
        });
    }

    const closeModal = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.innerHTML = '', 300);
    };

    const closeBtns = overlay.querySelectorAll('#btn-close-create, #btn-cancel-create');
    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
    
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

function compressImage(file, maxWidth, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

function formatDate(dateString) {
    if(!dateString) return "";
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// =========================================
// LÓGICA DO MODAL DE GERENCIAMENTO
// =========================================
function openManagementModal(project) {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = ProjectManagementModal(project);
    requestAnimationFrame(() => overlay.classList.add('active'));

    const closeModal = () => {
        overlay.classList.remove('active');
        setTimeout(() => loadProfessorProjects(), 300);
    };

    const closeBtns = overlay.querySelectorAll('#btn-modal-close, #btn-modal-cancel, #btn-header-close');
    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

    const scrollBody = document.getElementById('modal-scroll-body');
    const stickyHeader = document.getElementById('pm-sticky-header');
    if(scrollBody && stickyHeader) {
        scrollBody.addEventListener('scroll', () => {
            stickyHeader.style.opacity = scrollBody.scrollTop > 180 ? '1' : '0';
        });
    }

    setupTabs(overlay);
    setupEditForm(overlay, project);

    const flipContainer = document.getElementById('flip-container');
    
    if(document.getElementById('btn-flip-diary')) {
        document.getElementById('btn-flip-diary').addEventListener('click', () => {
            flipContainer.classList.add('flipped');
        });
    }

    if(document.getElementById('btn-flip-back')) {
        document.getElementById('btn-flip-back').addEventListener('click', () => {
            flipContainer.classList.remove('flipped');
        });
    }

    const btnNewClass = document.getElementById('btn-new-class');
    const btnNewClassEmpty = document.getElementById('btn-new-class-empty');
    if(btnNewClass) btnNewClass.addEventListener('click', () => openAttendanceForm(project, null));
    if(btnNewClassEmpty) btnNewClassEmpty.addEventListener('click', () => openAttendanceForm(project, null));

    const flipBack = overlay.querySelector('.pm-flip-back');
    if(flipBack) {
        flipBack.addEventListener('click', (e) => {
            const btnEdit = e.target.closest('.btn-edit-class');
            if(btnEdit) {
                const classId = parseInt(btnEdit.dataset.id);
                const classData = DatabaseService.getProjectClasses(project.id).find(c => c.id === classId);
                openAttendanceForm(project, classData);
            }
        });
    }

    const viewContainer = overlay.querySelector('#view-mode-container');
    const editContainer = overlay.querySelector('#edit-mode-container');
    const viewFooter = overlay.querySelector('#view-footer-actions');
    const editFooter = overlay.querySelector('#edit-footer-actions');

    if(overlay.querySelector('#btn-enable-edit')) {
        overlay.querySelector('#btn-enable-edit').addEventListener('click', () => {
            viewContainer.style.display = 'none'; viewFooter.style.display = 'none';
            editContainer.style.display = 'block'; editFooter.style.display = 'flex';
            scrollBody.scrollTop = 0;
        });
    }

    if(overlay.querySelector('#btn-cancel-edit')) {
        overlay.querySelector('#btn-cancel-edit').addEventListener('click', () => {
            editContainer.style.display = 'none'; editFooter.style.display = 'none';
            viewContainer.style.display = 'block'; viewFooter.style.display = 'flex';
            scrollBody.scrollTop = 0;
        });
    }
}

function openAttendanceForm(project, classData) {
    const dOverlay = document.createElement('div');
    dOverlay.className = 'modal-overlay';
    dOverlay.style.zIndex = '3500';
    dOverlay.innerHTML = AttendanceFormModal(project, classData);
    document.body.appendChild(dOverlay);
    requestAnimationFrame(() => dOverlay.classList.add('active'));

    const closeForm = () => dOverlay.remove();
    
    dOverlay.querySelectorAll('.btn-close-secondary').forEach(btn => 
        btn.addEventListener('click', closeForm)
    );

    dOverlay.querySelectorAll('.btn-toggle-group').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            const type = e.target.dataset.target; 
            const checks = dOverlay.querySelectorAll(`.attendance-check[data-type="${type}"]`);
            
            if (checks.length === 0) return;

            const allChecked = Array.from(checks).every(c => c.checked);
            checks.forEach(c => c.checked = !allChecked);
            e.target.textContent = allChecked ? "Marcar Todos" : "Desmarcar Todos";
        });
    });

    const form = dOverlay.querySelector('#attendance-form');
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const attendance = [];
            dOverlay.querySelectorAll('.attendance-check').forEach(chk => {
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
            
            openManagementModal(project);
            
            setTimeout(() => {
                const flipContainer = document.getElementById('flip-container');
                if(flipContainer) flipContainer.classList.add('flipped');
            }, 100);
        });
    }
}

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
        imgInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if(file) {
                try {
                    currentImage = await compressImage(file, 800, 0.7);
                    if(imgPreview) imgPreview.src = currentImage;
                } catch(err) {
                    console.error("Erro ao comprimir imagem na edição", err);
                }
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
    try {
        const allProjects = DatabaseService.getAllProjects();
        const index = allProjects.findIndex(p => p.id === updatedProject.id);
        if (index !== -1) {
            allProjects[index] = updatedProject;
            
            const projectsToSave = allProjects.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                image: p.image,
                date: p.date,
                location: p.location,
                hours: p.hours,
                tags: p.tags,
                openToCommunity: p.openToCommunity,
                shifts: p.shifts,
                vacancies: p.vacancies,
                professorId: p.professorId || p.professor.id 
            }));

            localStorage.setItem('opencampus_projects', JSON.stringify(projectsToSave));
        }
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            alert("ERRO: Limite de armazenamento excedido. Tente usar imagens menores.");
        }
    }
}

function setupEventListeners() {
    const btnMenu = document.getElementById('btn-menu-toggle');
    const overlay = document.getElementById('overlay');
    if (btnMenu) btnMenu.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);
    document.getElementById('btn-close-sidebar')?.addEventListener('click', toggleMenu);
    
    // --- CORREÇÃO AQUI: ADICIONADO LISTENER DO HEADER ---
    document.getElementById('sidebar-theme-btn')?.addEventListener('click', toggleTheme);
    document.getElementById('header-theme-btn')?.addEventListener('click', toggleTheme);
    
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