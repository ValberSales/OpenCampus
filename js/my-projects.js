import { HeaderComponent } from './components/Header.js';
import { SidebarComponent } from './components/Sidebar.js';
import { ProfileCardComponent } from './components/ProfileCard.js';
import { FooterComponent } from './components/Footer.js';
import { MyProjectCardComponent } from './components/MyProjectCard.js';
import { ProjectModalComponent } from './components/ProjectModal.js';
import { MessageModalComponent } from './components/MessageModal.js';

// Estado
const state = {
    allProjects: [],
    myProjects: []
};

async function init() {
    // CORREÇÃO AQUI: Passamos 'projects' para destacar o ícone
    document.getElementById('app-header').innerHTML = HeaderComponent('projects');
    document.getElementById('app-sidebar-mobile').innerHTML = SidebarComponent('projects');
    
    document.getElementById('profile-container').innerHTML = ProfileCardComponent();
    document.getElementById('app-footer').innerHTML = FooterComponent();

    // Carrega dados
    await fetchProjects();
    
    // Events
    setupEventListeners();
    loadTheme();
}

async function fetchProjects() {
    try {
        const response = await fetch('./data/projects.json');
        const data = await response.json();
        state.allProjects = data;

        // Filtra pelos IDs salvos
        const subscribedIds = JSON.parse(localStorage.getItem('opencampus_subscriptions')) || [];
        state.myProjects = state.allProjects.filter(p => subscribedIds.includes(p.id));

        renderList();
    } catch (error) {
        console.error(error);
    }
}

function renderList() {
    const container = document.getElementById('my-projects-container');
    
    if (state.myProjects.length === 0) {
        container.innerHTML = `
            <div class="card p-3 text-center" style="grid-column: 1 / -1;">
                <p class="text-secondary mb-2">Você ainda não se inscreveu em nenhum projeto.</p>
                <a href="index.html" class="btn btn-primary">Explorar Projetos</a>
            </div>
        `;
        return;
    }

    container.innerHTML = state.myProjects.map(p => MyProjectCardComponent(p)).join('');
    
    // Eventos dos Cards
    setupCardEvents();
}

function setupCardEvents() {
    const cards = document.querySelectorAll('.my-project-card');
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.dataset.id);
            const project = state.myProjects.find(p => p.id === id);

            if (e.target.closest('.btn-message')) {
                e.stopPropagation();
                openMessageModal(project);
                return;
            }

            // Abre modal (sempre como inscrito = true)
            openProjectModal(project);
        });
    });
}

// Reutilizando lógica de Modal
function openProjectModal(project) { 
    const overlay = document.getElementById('modal-overlay-container');
    // Passamos TRUE pois estamos na página de "Meus Projetos"
    overlay.innerHTML = ProjectModalComponent(project, true); 
    requestAnimationFrame(() => overlay.classList.add('active'));
    
    document.getElementById('btn-modal-close').addEventListener('click', closeModal);
    document.getElementById('btn-modal-cancel').addEventListener('click', closeModal);
    
    // Botão Mensagem dentro do modal
    const btnMsg = document.getElementById('btn-modal-msg');
    if(btnMsg) {
        btnMsg.addEventListener('click', () => {
            closeModal();
            setTimeout(() => openMessageModal(project), 300);
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
        // Lógica de salvar mensagem (igual ao main.js)
        const text = document.getElementById('message-text').value;
        if(text) {
            saveMessageToStorage(project, text);
            alert("Mensagem enviada!");
            closeModal();
        }
    });

    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

function saveMessageToStorage(project, text) {
    const storageKey = 'opencampus_conversations';
    let conversations = JSON.parse(localStorage.getItem(storageKey)) || [];
    let idx = conversations.findIndex(c => c.projectId === project.id);
    const msg = { id: Date.now(), sender: 'student', text, timestamp: new Date().toISOString() };

    if (idx >= 0) {
        conversations[idx].messages.push(msg);
        conversations[idx].lastUpdated = new Date().toISOString(); // Atualiza data
    } else {
        conversations.push({
            projectId: project.id, projectTitle: project.title,
            professorName: project.professor.name, professorAvatar: project.professor.avatar,
            lastUpdated: new Date().toISOString(),
            messages: [msg]
        });
    }
    localStorage.setItem(storageKey, JSON.stringify(conversations));
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.classList.remove('active');
    setTimeout(() => overlay.innerHTML = '', 300);
}

// Utils (Menu/Theme)
function setupEventListeners() {
    const btnMenu = document.getElementById('btn-menu-toggle');
    const overlay = document.getElementById('overlay');
    if(btnMenu) btnMenu.addEventListener('click', toggleMenu);
    if(overlay) overlay.addEventListener('click', toggleMenu);
    document.getElementById('btn-theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('btn-close-sidebar').addEventListener('click', toggleMenu);
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
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
}

document.addEventListener('DOMContentLoaded', init);