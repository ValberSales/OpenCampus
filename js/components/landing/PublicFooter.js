export function PublicFooter() {
    return `
    <footer class="home-footer">
        <div class="main-container footer-centered">
            <div class="footer-brand mb-3">
                <h4 class="font-bold text-lg flex align-center justify-center gap-2" style="color: var(--primary);">
                    <i class="ph ph-graduation-cap"></i> OpenCampus
                </h4>
                <p class="text-secondary text-sm">Plataforma de gestão extensionista integrada.</p>
            </div>
            <div class="footer-institution">
                <img src="https://www.utfpr.edu.br/icones/cabecalho/logo-utfpr/@@images/image-1024-b81cb1614d9ff77734c703bafc92519e.png" alt="Logo UTFPR" title="UTFPR" style="height: 32px; filter: grayscale(100%); opacity: 0.6;">
                <div class="separator"></div>
                <span class="text-xs text-secondary">Campus Pato Branco &copy; 2025</span>
            </div>
        </div>
    </footer>`;
}