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
        platinum: '#8b5cf6'  // Platina/Místico (Violet-500)
    };

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
                
                <div class="badge-icon" title="Bronze: 10H " 
                     style="${currentHours >= 10 ? `color: ${rankColors.bronze}; border-color: ${rankColors.bronze}; background-color: #fff7ed;` : 'opacity: 0.3; color: gray'}">
                    <i class="ph ph-star"></i>
                </div>
                
                <div class="badge-icon" title="Prata: 50H" 
                     style="${currentHours >= 50 ? `color: ${rankColors.silver}; border-color: ${rankColors.silver}; background-color: #f8fafc;` : 'opacity: 0.3; color: gray'}">
                    <i class="ph ph-medal"></i>
                </div>
                
                <div class="badge-icon" title="Ouro: 100H" 
                     style="${currentHours >= 100 ? `color: ${rankColors.gold}; border-color: ${rankColors.gold}; background-color: #fefce8;` : 'opacity: 0.3; color: gray'}">
                    <i class="ph ph-trophy"></i>
                </div>
                
                <div class="badge-icon" title="Platina: 200H" 
                     style="${currentHours >= 200 ? `color: ${rankColors.platinum}; border-color: ${rankColors.platinum}; background-color: #f5f3ff;` : 'opacity: 0.3; color: gray'}">
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