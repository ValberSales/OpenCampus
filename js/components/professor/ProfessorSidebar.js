export function ProfessorSidebarComponent(activePage = 'dashboard') {
    return `
    <div class="overlay" id="overlay"></div>
    <div class="sidebar-mobile" id="sidebar">
        <div class="flex justify-between align-center mb-4">
            <div class="logo"><i class="ph ph-graduation-cap"></i> OpenCampus </div>
            <button class="btn-icon" id="btn-close-sidebar"><i class="ph ph-x"></i></button>
        </div>
        <ul class="flex-column gap-2">
            <li>
                <a href="dashboard.html" class="nav-item ${activePage === 'dashboard' ? 'active' : ''}">
                    <i class="ph ph-squares-four"></i> Dashboard
                </a>
            </li>
            <li>
                <a href="meus-projetos.html" class="nav-item ${activePage === 'projects' ? 'active' : ''}">
                    <i class="ph ph-folder-notch-open"></i> Gerenciar Projetos
                </a>
            </li>
            <li>
                <a href="solicitacoes.html" class="nav-item ${activePage === 'requests' ? 'active' : ''}">
                    <i class="ph ph-user-plus"></i> Solicitações
                </a>
            </li>
            <li>
                <a href="mensagens.html" class="nav-item ${activePage === 'messages' ? 'active' : ''}">
                    <i class="ph ph-chat-circle-text"></i> Mensagens
                </a>
            </li>
            <li>
                <a href="validar-certificados.html" class="nav-item ${activePage === 'validation' ? 'active' : ''}">
                    <i class="ph ph-stamp"></i> Validar Horas
                </a>
            </li>
            
            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 0.5rem 0;">

            <li>
                <button id="sidebar-theme-btn" class="nav-item w-full" style="text-align: left; background: none; border: none; font-family: inherit; cursor: pointer;">
                    <i class="ph ph-moon" id="theme-icon-sidebar"></i> Alternar Tema
                </button>
            </li>
            <li>
                <a href="../../index.html" class="nav-item" style="color: var(--danger);">
                    <i class="ph ph-sign-out"></i> Sair
                </a>
            </li>
        </ul>
    </div>
    `;
}