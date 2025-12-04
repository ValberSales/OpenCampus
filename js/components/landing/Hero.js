export function HeroSection() {
    return `
    <header class="hero-section">
        <div class="hero-content text-center">
            <span class="badge badge-tech mb-3" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4);">UTFPR Pato Branco</span>
            <h1 class="hero-title">Conectando Saberes,<br>Transformando a Comunidade</h1>
            <p class="hero-subtitle">
                A plataforma oficial de extensão universitária. Descubra como nossos alunos e professores estão impactando escolas e instituições locais através da tecnologia e inovação.
            </p>
            <div class="flex justify-center gap-2 mt-4">
                <button class="btn btn-white" onclick="document.getElementById('vitrine-section').scrollIntoView({behavior: 'smooth'})">
                    Ver Projetos Ativos
                </button>
                <button id="btn-partner-request" class="btn btn-outline-white">
                    Seja um Parceiro
                </button>
            </div>
        </div>
    </header>`;
}