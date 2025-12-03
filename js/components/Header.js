export function HeaderComponent(activePage = 'dashboard') {
    return `
    <nav class="topbar flex justify-between align-center">
        <div class="flex align-center gap-3">
            <button class="menu-toggle btn-icon" id="btn-menu-toggle"><i class="ph ph-list"></i></button>
            <a href="index.html" class="logo"><i class="ph ph-graduation-cap"></i> OpenCampus</a>
        </div>
        
        <div class="nav-links nav-links-desktop">
            <a href="index.html" class="nav-item ${activePage === 'dashboard' ? 'active' : ''}">
                <i class="ph ph-squares-four"></i> Dashboard
            </a>
            
            <a href="meus-projetos.html" class="nav-item ${activePage === 'projects' ? 'active' : ''}">
                <i class="ph ph-folder-open"></i> Meus Projetos
            </a>
            
            <a href="mensagens.html" class="nav-item ${activePage === 'messages' ? 'active' : ''}">
                <i class="ph ph-chat-circle-text"></i> Mensagens
            </a>
            
            <a href="#" class="nav-item ${activePage === 'certificates' ? 'active' : ''}">
                <i class="ph ph-certificate"></i> Meus Certificados
            </a>
        </div>

        <div class="flex align-center gap-2">
            <button class="btn-icon" id="btn-theme-toggle" title="Alternar Tema">
                <i class="ph ph-moon" id="theme-icon"></i>
            </button>
            <button class="btn-icon"><i class="ph ph-bell"></i></button>
            <div class="avatar" style="width: 35px; height: 35px; border-radius: 50%; background: #ddd; overflow: hidden;">
                <img src="https://ui-avatars.com/api/?name=Valber+Sales&background=6366f1&color=fff" alt="Perfil" style="width: 100%;">
            </div>
        </div>
    </nav>`;
}