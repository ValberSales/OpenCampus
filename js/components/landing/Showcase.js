export function ShowcaseSection() {
    return `
    <section id="vitrine-section" class="showcase-wrapper">
        
        <div class="home-container">
            <div class="mb-4">
                <h2 class="font-bold mb-1" style="font-size: 1.8rem; color: var(--text-main);">Projetos em Destaque</h2>
                <p class="text-secondary mb-4">Conheça as iniciativas que estão fazendo a diferença agora.</p>
                
                <div class="controls-bar card p-3 flex gap-2 align-center wrap-mobile">
                    <div class="input-wrapper flex-1">
                        <i class="ph ph-magnifying-glass input-icon"></i>
                        <input type="text" id="search-input" class="form-input pl-5" placeholder="Buscar por nome, professor ou área...">
                    </div>
                    <div class="select-wrapper" style="min-width: 200px;">
                        <select id="category-select" class="form-select">
                            <option value="">Todas as Categorias</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div id="public-projects-container" class="project-list showcase-grid">
                <div class="card p-3 text-center w-full">
                    <div class="spinner"></div>
                    <p class="text-secondary mt-2">Carregando vitrine...</p>
                </div>
            </div>

            <div id="pagination-wrapper" class="mt-4"></div>
        </div>
    </section>`;
}