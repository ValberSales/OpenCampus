import { DatabaseService } from './services/DatabaseService.js';
import { ProjectCardComponent } from './components/ProjectCard.js';
import { CommunityProjectModal, CommunitySubscribeForm, PartnershipFormModal } from './components/CommunityModals.js';

document.addEventListener('DOMContentLoaded', async () => {
    await DatabaseService.init();
    
    loadPublicShowcase();
    setupLoginModal();
    setupPartnerModal(); // Novo
});

function loadPublicShowcase() {
    const projects = DatabaseService.getAllProjects();
    const container = document.getElementById('public-projects-container');
    
    // Filtra apenas projetos abertos à comunidade (opcional, ou mostra todos com flag)
    const publicProjects = projects.filter(p => p.openToCommunity !== false);

    if (publicProjects.length === 0) {
        container.innerHTML = '<p class="text-secondary">Nenhum projeto disponível para a comunidade no momento.</p>';
        return;
    }

    container.innerHTML = publicProjects.map(p => ProjectCardComponent(p)).join('');

    // Adiciona interatividade aos cards
    const cards = container.querySelectorAll('.project-card');
    cards.forEach(card => {
        const projectId = parseInt(card.dataset.id);
        const project = publicProjects.find(p => p.id === projectId);

        // Ajuste visual do botão para "Saiba Mais" em vez de detalhes restritos
        const btn = card.querySelector('.btn-primary');
        if(btn) {
            btn.innerHTML = 'Saiba Mais';
            btn.classList.add('btn-outline');
            btn.classList.remove('btn-primary');
        }

        // Ao clicar, abre o Modal da Comunidade
        card.addEventListener('click', (e) => {
            e.preventDefault();
            if(!e.target.closest('.btn-message')) { // Ignora botão msg se houver
                openCommunityDetails(project);
            }
        });
    });
}

// --- MODAIS DA COMUNIDADE ---

function openCommunityDetails(project) {
    const overlay = document.getElementById('modal-overlay-container') || createOverlay();
    overlay.innerHTML = CommunityProjectModal(project);
    overlay.classList.add('active');

    document.getElementById('btn-modal-close').addEventListener('click', () => overlay.classList.remove('active'));
    
    const btnSub = document.getElementById('btn-open-subscribe');
    if(btnSub) {
        btnSub.addEventListener('click', () => {
            openSubscribeForm(project);
        });
    }
}

function openSubscribeForm(project) {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = CommunitySubscribeForm(project);
    
    document.getElementById('btn-close-sub-form').addEventListener('click', () => overlay.classList.remove('active'));
    document.getElementById('btn-cancel-sub').addEventListener('click', () => overlay.classList.remove('active'));

    document.getElementById('community-sub-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const app = {
            projectId: project.id,
            projectTitle: project.title,
            name: document.getElementById('comm-name').value,
            phone: document.getElementById('comm-phone').value,
            email: document.getElementById('comm-email').value,
            reason: document.getElementById('comm-reason').value
        };

        DatabaseService.saveCommunityApplication(app);
        alert(`Inscrição solicitada com sucesso para ${project.title}! Entraremos em contato.`);
        overlay.classList.remove('active');
    });
}

function setupPartnerModal() {
    const btnPartner = document.getElementById('btn-partner-request'); // Adicionaremos este ID no index.html
    if(!btnPartner) return;

    btnPartner.addEventListener('click', () => {
        const overlay = document.getElementById('modal-overlay-container') || createOverlay();
        overlay.innerHTML = PartnershipFormModal();
        overlay.classList.add('active');

        document.getElementById('btn-close-partner').addEventListener('click', () => overlay.classList.remove('active'));
        document.getElementById('btn-cancel-partner').addEventListener('click', () => overlay.classList.remove('active'));

        document.getElementById('partner-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const req = {
                org: document.getElementById('part-org').value,
                contact: document.getElementById('part-name').value,
                phone: document.getElementById('part-phone').value,
                type: document.getElementById('part-type').value
            };
            DatabaseService.savePartnershipRequest(req);
            alert("Solicitação enviada! A coordenação de extensão entrará em contato.");
            overlay.classList.remove('active');
        });
    });
}

// Helper para criar overlay se não existir (o index.html não tinha o container genérico)
function createOverlay() {
    let overlay = document.getElementById('modal-overlay-container');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'modal-overlay-container';
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);
        
        // Fecha ao clicar fora
        overlay.addEventListener('click', (e) => {
            if(e.target === overlay) overlay.classList.remove('active');
        });
    }
    return overlay;
}

// ... Lógica de Login (setupLoginModal) mantém-se igual ...
// Apenas copie a função setupLoginModal do código anterior para cá.
function setupLoginModal() {
    const modalOverlay = document.getElementById('login-modal-overlay');
    const btnTrigger = document.getElementById('btn-login-trigger');
    const btnClose = document.getElementById('btn-close-login');
    const loginForm = document.getElementById('login-form');

    if(btnTrigger) btnTrigger.addEventListener('click', () => modalOverlay.classList.add('active'));
    if(btnClose) btnClose.addEventListener('click', () => modalOverlay.classList.remove('active'));
    
    if(modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) modalOverlay.classList.remove('active');
        });
    }

    if(loginForm) {
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
    }
}