import { DatabaseService } from './services/DatabaseService.js';
import { ProjectCardComponent } from './components/ProjectCard.js';

document.addEventListener('DOMContentLoaded', async () => {
    
    // 1. Inicializa Banco e Carrega Projetos
    await DatabaseService.init();
    loadPublicShowcase();

    // 2. Configuração do Modal de Login
    setupLoginModal();
});

function loadPublicShowcase() {
    const projects = DatabaseService.getAllProjects();
    const container = document.getElementById('public-projects-container');
    
    if (projects.length === 0) {
        container.innerHTML = '<p class="text-secondary">Nenhum projeto disponível no momento.</p>';
        return;
    }

    // Renderiza os Cards
    container.innerHTML = projects.map(p => ProjectCardComponent(p)).join('');

    // Ajustes na Vitrine Pública:
    // Como é público, os botões "Ver Detalhes" ou "Mensagem" devem pedir login
    const cards = container.querySelectorAll('.project-card');
    cards.forEach(card => {
        // Desabilita navegação padrão e força abertura do login
        card.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            openLoginModal(); // Qualquer clique no card pede login
        });

        // Opcional: Mudar o texto dos botões visualmente para indicar bloqueio
        const btnDetails = card.querySelector('.btn-primary');
        if(btnDetails) {
            btnDetails.innerHTML = '<i class="ph ph-lock-key"></i> Detalhes';
            btnDetails.classList.add('btn-outline'); // Estilo mais suave
            btnDetails.classList.remove('btn-primary');
        }
    });
}

// --- LÓGICA DE LOGIN ---

function setupLoginModal() {
    const modalOverlay = document.getElementById('login-modal-overlay');
    const btnTrigger = document.getElementById('btn-login-trigger');
    const btnClose = document.getElementById('btn-close-login');
    const loginForm = document.getElementById('login-form');

    // Abrir Modal
    btnTrigger.addEventListener('click', openLoginModal);

    // Fechar Modal
    btnClose.addEventListener('click', closeLoginModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeLoginModal();
    });

    // Submit do Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('username').value;
        const course = document.getElementById('usercourse').value;

        if (!name.trim()) return;

        const user = {
            name: name,
            course: course,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`
        };

        DatabaseService.login(user);
        window.location.href = 'pages/aluno/dashboard.html';
    });

    // Preencher se já existir user
    const savedUser = DatabaseService.getCurrentUser();
    if (savedUser && savedUser.name) {
        document.getElementById('username').value = savedUser.name;
    }
}

function openLoginModal() {
    document.getElementById('login-modal-overlay').classList.add('active');
}

function closeLoginModal() {
    document.getElementById('login-modal-overlay').classList.remove('active');
}