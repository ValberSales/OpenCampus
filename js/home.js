// js/home.js
import { DatabaseService } from './services/DatabaseService.js';
import { PaginationComponent } from './components/shared/Pagination.js';
import { ProjectCardComponent } from './components/shared/ProjectCard.js'; 

import { CommunityProjectFlipModal, PartnershipFormModal } from './components/landing/CommunityModal.js';
import { PublicHeader } from './components/landing/PublicHeader.js';
import { HeroSection } from './components/landing/Hero.js';
import { ImpactSection } from './components/landing/Impact.js';
import { ShowcaseSection } from './components/landing/Showcase.js';
import { PublicFooter } from './components/landing/PublicFooter.js';

// Estado Local da Página
const state = {
    allProjects: [],
    filteredProjects: [],
    currentPage: 1,
    itemsPerPage: 6, // Exibe 6 projetos por vez (Grid 3x2)
    filters: {
        search: "",
        category: ""
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Renderiza a Estrutura Estática da Página (Montagem dos Componentes)
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            ${PublicHeader()}
            ${HeroSection()}
            ${ImpactSection()}
            ${ShowcaseSection()}
            ${PublicFooter()}
        `;
    }

    // 2. Inicializa o Banco de Dados
    await DatabaseService.init();
    
    // 3. Carrega dados e filtra apenas os públicos
    const rawProjects = DatabaseService.getAllProjects();
    state.allProjects = rawProjects.filter(p => p.openToCommunity !== false);
    state.filteredProjects = [...state.allProjects];

    // 4. Inicializa Lógicas da Vitrine
    initFilters();      // Preenche o Select de Categorias
    renderShowcase();   // Renderiza os Cards e a Paginação no container criado pelo ShowcaseSection
    
    // 5. Configura Eventos Globais (Modais e Filtros)
    setupLoginModal();
    setupPartnerModal();
    setupFilterEvents();
});

// =========================================
// LÓGICA DE RENDERIZAÇÃO E PAGINAÇÃO
// =========================================

function renderShowcase() {
    const container = document.getElementById('public-projects-container');
    const paginationContainer = document.getElementById('pagination-wrapper');
    
    // Proteção caso o componente ShowcaseSection não tenha sido renderizado ainda
    if (!container || !paginationContainer) return;

    // Caso nenhum projeto seja encontrado
    if (state.filteredProjects.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="ph ph-magnifying-glass" style="font-size: 2rem; color: var(--text-secondary); opacity: 0.5;"></i>
                <p class="text-secondary mt-2">Nenhum projeto encontrado com esses termos.</p>
                <button class="btn btn-outline mt-2" id="btn-reset-filters">Limpar Filtros</button>
            </div>`;
        paginationContainer.innerHTML = '';
        
        const btnReset = document.getElementById('btn-reset-filters');
        if(btnReset) btnReset.addEventListener('click', resetFilters);
        return;
    }

    // Cálculo da Paginação
    const totalPages = Math.ceil(state.filteredProjects.length / state.itemsPerPage);
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    const paginatedItems = state.filteredProjects.slice(start, end);

    // Renderiza os Cards
    container.innerHTML = paginatedItems.map(p => ProjectCardComponent(p)).join('');
    
    // Renderiza os Controles de Paginação
    paginationContainer.innerHTML = PaginationComponent(state.currentPage, totalPages);

    // Reconecta os eventos após renderizar o HTML novo
    setupPaginationEvents(totalPages);
    setupCardInteractions(container, paginatedItems);
}

function setupPaginationEvents(totalPages) {
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (state.currentPage > 1) {
                state.currentPage--;
                renderShowcase();
                scrollToVitrine();
            }
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (state.currentPage < totalPages) {
                state.currentPage++;
                renderShowcase();
                scrollToVitrine();
            }
        });
    }
}

function scrollToVitrine() {
    const section = document.getElementById('vitrine-section');
    if(section) section.scrollIntoView({ behavior: 'smooth' });
}

// =========================================
// LÓGICA DE FILTROS E BUSCA
// =========================================

function initFilters() {
    // Cria lista única de categorias baseada nos projetos carregados
    const categories = new Set();
    state.allProjects.forEach(p => {
        p.tags.forEach(t => categories.add(t.label));
    });

    const select = document.getElementById('category-select');
    if (!select) return;

    const sortedCategories = Array.from(categories).sort();
    
    // Preenche o <select>
    sortedCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });
}

function setupFilterEvents() {
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('category-select');

    const handleFilter = () => {
        state.filters.search = searchInput.value.toLowerCase();
        state.filters.category = categorySelect.value;
        state.currentPage = 1; // Volta para página 1 ao filtrar

        applyFilters();
    };

    if(searchInput) searchInput.addEventListener('input', handleFilter);
    if(categorySelect) categorySelect.addEventListener('change', handleFilter);
}

function applyFilters() {
    state.filteredProjects = state.allProjects.filter(p => {
        // Verifica se texto bate com Título, Descrição ou Nome do Professor
        const matchesSearch = 
            p.title.toLowerCase().includes(state.filters.search) ||
            p.description.toLowerCase().includes(state.filters.search) ||
            p.professor.name.toLowerCase().includes(state.filters.search);

        // Verifica se categoria bate (ou se está vazio "Todas")
        const matchesCategory = 
            state.filters.category === "" || 
            p.tags.some(t => t.label === state.filters.category);

        return matchesSearch && matchesCategory;
    });

    renderShowcase();
}

function resetFilters() {
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('category-select');
    
    if(searchInput) searchInput.value = '';
    if(categorySelect) categorySelect.value = '';
    
    state.filters.search = '';
    state.filters.category = '';
    state.currentPage = 1;
    applyFilters();
}

// =========================================
// INTERAÇÕES COM CARDS E MODAIS
// =========================================

function setupCardInteractions(container, projects) {
    const cards = container.querySelectorAll('.project-card');
    cards.forEach(card => {
        const projectId = parseInt(card.dataset.id);
        const project = projects.find(p => p.id === projectId);

        // Ajuste visual do botão para contexto público
        const btn = card.querySelector('.btn-primary');
        if(btn) {
            btn.innerHTML = 'Saiba Mais';
            // Garante estilo primário para destaque
            btn.classList.add('btn-primary'); 
        }

        // Clique no card abre modal da comunidade
        card.addEventListener('click', (e) => {
            e.preventDefault();
            // Evita abrir se clicar num botão que não deva disparar (ex: se houvesse outro link)
            if(!e.target.closest('.no-modal')) {
                openCommunityDetails(project);
            }
        });
    });
}

// --- Modais Específicos da Home ---

function openCommunityDetails(project) {
    const overlay = document.getElementById('modal-overlay-container') || createOverlay();
    
    // 1. Renderiza o Componente "Flip" (Frente e Verso já no HTML)
    overlay.innerHTML = CommunityProjectFlipModal(project);
    overlay.classList.add('active');

    const flipContainer = document.getElementById('flip-card-container');

    // 2. Configura botões de FECHAR (X) - Existem dois agora (frente e verso)
    const closeButtons = overlay.querySelectorAll('.action-close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => overlay.classList.remove('active'));
    });

    // 3. Configura botão "Solicitar Inscrição" (Gira para o verso)
    const btnFlipToForm = document.getElementById('btn-flip-to-form');
    if(btnFlipToForm) {
        btnFlipToForm.addEventListener('click', () => {
            flipContainer.classList.add('flipped');
        });
    }

    // 4. Configura botão "Voltar" (Gira para a frente)
    const btnFlipBack = document.getElementById('btn-flip-back');
    if(btnFlipBack) {
        btnFlipBack.addEventListener('click', () => {
            flipContainer.classList.remove('flipped');
        });
    }

    // 5. Configura o Submit do Formulário
    const form = document.getElementById('community-sub-form');
    if (form) {
        form.addEventListener('submit', (e) => {
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
    
    // Fecha ao clicar fora (no overlay escuro)
    overlay.onclick = (e) => { 
        if (e.target === overlay) overlay.classList.remove('active'); 
    };
}

function setupPartnerModal() {
    // O botão pode não existir se o componente Hero não estiver renderizado ainda,
    // mas como chamamos isso no DOMContentLoaded após o innerHTML do app, deve funcionar.
    const btnPartner = document.getElementById('btn-partner-request');
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

function setupLoginModal() {
    const modalOverlay = document.getElementById('login-modal-overlay');
    const btnTrigger = document.getElementById('btn-login-trigger');
    const btnClose = document.getElementById('btn-close-login');
    const loginForm = document.getElementById('login-form');

    // Botão do Header Público
    if(btnTrigger) btnTrigger.addEventListener('click', () => modalOverlay.classList.add('active'));
    
    // Botão Fechar Modal
    if(btnClose) btnClose.addEventListener('click', () => modalOverlay.classList.remove('active'));
    
    // Fechar ao clicar fora
    if(modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) modalOverlay.classList.remove('active');
        });
    }

    // Submit do Login
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

// Função auxiliar para criar o container de modais caso ele não exista no HTML base
function createOverlay() {
    let overlay = document.getElementById('modal-overlay-container');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'modal-overlay-container';
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', (e) => {
            if(e.target === overlay) overlay.classList.remove('active');
        });
    }
    return overlay;
}