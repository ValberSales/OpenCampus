export function ProfileCardComponent() {
    // 1. Busca dados do LocalStorage
    const savedCerts = JSON.parse(localStorage.getItem('opencampus_certificates')) || [];
    
    // 2. Calcula Horas
    const totalHoursRequired = 200;
    const currentHours = savedCerts.reduce((acc, curr) => acc + parseInt(curr.hours), 0);
    const percentage = Math.min(Math.round((currentHours / totalHoursRequired) * 100), 100);

    // 3. Pega os últimos 2 certificados
    const recentCerts = savedCerts.slice(0, 2);

    // 4. Gera HTML da lista mini
    const certsHtml = recentCerts.length > 0 
        ? recentCerts.map(cert => `
            <div class="cert-item" data-id="${cert.id}">
                <i class="ph ph-certificate cert-icon"></i>
                <div style="flex: 1; overflow: hidden;">
                    <div class="font-bold text-sm" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${cert.title}</div>
                    <div class="text-secondary" style="font-size: 0.7rem;">${cert.hours} horas • ${cert.institution}</div>
                </div>
            </div>
          `).join('')
        : `<p class="text-secondary text-sm text-center p-3">Nenhum certificado enviado ainda.</p>`;

    const gradient = `conic-gradient(var(--primary) 0% ${percentage}%, var(--border-color) ${percentage}% 100%)`;

    // --- CORES DOS RANKINGS ---
    const rankColors = {
        bronze: '#cd7f32',   // Bronze
        silver: '#64748b',   // Prata (Slate Grey)
        gold: '#eab308',     // Ouro (Yellow-500)
        platinum: '#8b5cf6'  // Platina (Violet-500)
    };

    // Helper para gerar estilo do badge
    const getBadgeStyle = (hours, threshold, color) => {
        if (currentHours >= hours) {
            // CONQUISTADO: Cor viva, fundo sutil, cursor clique
            return `color: ${color}; border-color: ${color}; background-color: var(--bg-ground); cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.05);`;
        }
        // NÃO CONQUISTADO: Cinza, sem fundo, opacidade baixa
        return `color: var(--text-secondary); border-color: var(--border-color); background-color: transparent; opacity: 0.4; cursor: not-allowed; filter: grayscale(100%);`;
    };

    // Helper para classe de trigger
    const getTriggerClass = (hours) => currentHours >= hours ? 'trophy-trigger' : '';

    return `
    <div class="card profile-card" id="profile-card-component">
        
        <div class="profile-mobile-header">
            <div class="mini-circular-chart" style="background: ${gradient}">
                <span class="mini-chart-text">${percentage}%</span>
            </div>
            
            <div class="profile-mobile-info">
                <div class="font-bold">Valber Sales</div>
                <div class="text-xs text-secondary">${currentHours}h / ${totalHoursRequired}h</div>
            </div>

            <i class="ph ph-caret-down caret-icon"></i>
        </div>

        <div class="profile-details">
            <img src="https://ui-avatars.com/api/?name=Valber+Sales&background=random&size=200" alt="Valber Sales" class="profile-img">
            <h2 class="font-bold" style="font-size: 1.25rem;">Valber Sales</h2>
            <p class="text-secondary text-sm">Análise e Des. de Sistemas</p>
            <p class="text-secondary text-sm">UTFPR - Pato Branco</p>

            <div class="circular-chart" style="background: ${gradient}">
                <div class="chart-content">
                    <span class="chart-percentage">${percentage}%</span>
                    <div class="chart-label">${currentHours}h / ${totalHoursRequired}h</div>
                </div>
            </div>
            <p class="text-sm font-bold mt-2 text-secondary uppercase">Meu Ranking</p>

            <div class="badges-grid mb-4">
                
                <div class="badge-icon ${getTriggerClass(10)}" data-level="bronze" title="Bronze (10h)" 
                     style="${getBadgeStyle(10, 10, rankColors.bronze)}">
                    <i class="ph ph-star"></i>
                </div>
                
                <div class="badge-icon ${getTriggerClass(50)}" data-level="silver" title="Prata (50h)" 
                     style="${getBadgeStyle(50, 50, rankColors.silver)}">
                    <i class="ph ph-medal"></i>
                </div>
                
                <div class="badge-icon ${getTriggerClass(100)}" data-level="gold" title="Ouro (100h)" 
                     style="${getBadgeStyle(100, 100, rankColors.gold)}">
                    <i class="ph ph-trophy"></i>
                </div>
                
                <div class="badge-icon ${getTriggerClass(200)}" data-level="platinum" title="Platina (200h)" 
                     style="${getBadgeStyle(200, 200, rankColors.platinum)}">
                    <i class="ph ph-crown"></i>
                </div>

            </div>

            <div class="divider"></div>

            <h3 class="font-bold mb-3 text-sm text-secondary uppercase text-left">Certificados Submetidos</h3>
            <div class="cert-list">
                ${certsHtml}
            </div>
            <a href="meus-certificados.html" class="btn btn-outline w-full justify-center mt-3 text-sm p-3">Ver Todos</a>
        </div>
    </div>
    `;
}