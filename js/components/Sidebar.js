export function SidebarComponent() {
    return `
    <div class="overlay" id="overlay"></div>
    <div class="sidebar-mobile" id="sidebar">
        <div class="flex justify-between align-center mb-4">
            <div class="logo"><i class="ph ph-graduation-cap"></i> OpenCampus</div>
            <button class="btn-icon" id="btn-close-sidebar"><i class="ph ph-x"></i></button>
        </div>
        <ul class="flex-column gap-2">
            <li><a href="#" class="nav-item active"><i class="ph ph-squares-four"></i> Dashboard</a></li>
            <li><a href="#" class="nav-item"><i class="ph ph-folder-open"></i> Meus Projetos</a></li>
            <li><a href="#" class="nav-item"><i class="ph ph-chat-circle-text"></i> Mensagens</a></li>
            <li><a href="#" class="nav-item"><i class="ph ph-certificate"></i> Meus Certificados</a></li>
        </ul>
    </div>
    `;
}