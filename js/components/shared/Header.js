export function HeaderComponent(activePage = 'dashboard') {
    // Busca dados do usuário logado (ou usa fallback)
    const user = JSON.parse(localStorage.getItem('opencampus_current_user')) || {
        avatar: "https://ui-avatars.com/api/?name=V&background=random"
    };

    // Ajuste de caminho: Se estamos em /pages/aluno/, a raiz está 2 níveis acima.
    // Se estivéssemos na raiz (improvável para este header), seria ./
    const isInDeepFolder = window.location.pathname.includes('/pages/');
    const rootPath = isInDeepFolder ? '../../' : './';

    return `
    <nav class="topbar flex justify-between align-center">
        <div class="flex align-center gap-2">
            <button class="menu-toggle btn-icon" id="btn-menu-toggle"><i class="ph ph-list"></i></button>
            
            <a href="dashboard.html" class="logo" style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="ph ph-graduation-cap" style="font-size: 2rem;"></i>
                <div style="display: flex; flex-direction: column; line-height: 1;">
                    <span>OpenCampus</span>
                    <span class="badge badge-tech" style="font-size: 0.6rem; padding: 2px 6px; width: fit-content;"> Aluno </span>
                </div>
            </a>
        </div>
        
        <div class="nav-links nav-links-desktop">
            <a href="dashboard.html" class="nav-item ${activePage === 'dashboard' ? 'active' : ''}">
                <i class="ph ph-squares-four"></i> Dashboard
            </a>
            <a href="meus-projetos.html" class="nav-item ${activePage === 'projects' ? 'active' : ''}">
                <i class="ph ph-folder-open"></i> Meus Projetos
            </a>
            <a href="mensagens.html" class="nav-item ${activePage === 'messages' ? 'active' : ''}">
                <i class="ph ph-chat-circle-text"></i> Mensagens
            </a>
            <a href="meus-certificados.html" class="nav-item ${activePage === 'certificates' ? 'active' : ''}">
                <i class="ph ph-certificate"></i> Meus Certificados
            </a>
        </div>

        <div class="flex align-center gap-2">
            <button class="btn-icon desktop-only" id="header-theme-btn" title="Alternar Tema">
                <i class="ph ph-moon" id="theme-icon-header"></i>
            </button>
            
            <div class="avatar" style="width: 35px; height: 35px; border-radius: 50%; overflow: hidden; border: 2px solid var(--border-color);">
                <img src="${user.avatar}" alt="Perfil" style="width: 100%; height: 100%; object-fit: cover;">
            </div>

            <a href="${rootPath}index.html" class="btn-icon" title="Sair" style="color: var(--danger);">
                <i class="ph ph-sign-out"></i>
            </a>
        </div>
    </nav>`;
}