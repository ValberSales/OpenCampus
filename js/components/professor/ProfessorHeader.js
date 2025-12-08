export function ProfessorHeaderComponent(activePage = 'dashboard') {
    const user = JSON.parse(localStorage.getItem('opencampus_current_user')) || {
        avatar: "https://ui-avatars.com/api/?name=Professor&background=0d9488&color=fff"
    };

    return `
    <nav class="topbar flex justify-between align-center">
        <div class="flex align-center gap-2">
            <button class="menu-toggle btn-icon" id="btn-menu-toggle"><i class="ph ph-list"></i></button>
            <a href="dashboard.html" class="logo"><i class="ph ph-graduation-cap"></i> OpenCampus <span class="badge badge-tech" style="font-size: 0.6rem; margin-left: 5px;">Docente</span></a>
        </div>
        
        <div class="nav-links nav-links-desktop">
            <a href="dashboard.html" class="nav-item ${activePage === 'dashboard' ? 'active' : ''}">
                <i class="ph ph-squares-four"></i> Dashboard
            </a>
            <a href="meus-projetos.html" class="nav-item ${activePage === 'projects' ? 'active' : ''}">
                <i class="ph ph-folder-notch-open"></i> Gerenciar Projetos
            </a>
            <a href="solicitacoes.html" class="nav-item ${activePage === 'requests' ? 'active' : ''}">
                <i class="ph ph-user-plus"></i> Solicitações
            </a>
            <a href="validar-certificados.html" class="nav-item ${activePage === 'validation' ? 'active' : ''}">
                <i class="ph ph-stamp"></i> Validar Horas
            </a>
        </div>

        <div class="flex align-center gap-2">
            <button class="btn-icon desktop-only" id="header-theme-btn" title="Alternar Tema">
                <i class="ph ph-moon" id="theme-icon-header"></i>
            </button>
            
            <div class="avatar" style="width: 35px; height: 35px; border-radius: 50%; overflow: hidden; border: 2px solid var(--border-color);">
                <img src="${user.avatar}" alt="Perfil" style="width: 100%; height: 100%; object-fit: cover;">
            </div>

            <a href="../../index.html" class="btn-icon" title="Sair" style="color: var(--danger);">
                <i class="ph ph-sign-out"></i>
            </a>
        </div>
    </nav>`;
}