export function PublicHeader() {
    return `
    <nav class="topbar flex justify-between align-center sticky-header">
        <div class="flex align-center gap-2">
            <a href="#" class="logo"><i class="ph ph-graduation-cap"></i> OpenCampus</a>
        </div>
        <div>
            <button id="btn-login-trigger" class="btn btn-primary">
                <i class="ph ph-user"></i> Sou Aluno / Professor
            </button>
        </div>
    </nav>`;
}