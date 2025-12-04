export function CommunityProjectModal(project) {
    // Lógica visual de vagas da comunidade
    const spots = project.vacancies.community;
    const hasSpots = spots.available > 0;
    
    const statusBadge = hasSpots 
        ? `<span class="badge badge-env"><i class="ph ph-check"></i> Vagas Abertas</span>`
        : `<span class="badge badge-art">Lista de Espera</span>`;

    return `
    <div class="modal-content">
        <button class="btn-close-modal" id="btn-modal-close"><i class="ph ph-x"></i></button>
        <img src="${project.image}" class="modal-header-img" alt="${project.title}">
        
        <div class="modal-body">
            <div class="flex justify-between align-center mb-3">
                <div class="flex gap-1">
                    ${project.tags.map(t => `<span class="badge ${t.class}">${t.label}</span>`).join('')}
                </div>
                ${statusBadge}
            </div>

            <h2 class="modal-title">${project.title}</h2>
            <p class="text-secondary mb-4" style="line-height: 1.6;">${project.description}</p>

            <div class="card p-3 mb-4" style="background: var(--bg-ground); border: none;">
                <h4 class="font-bold mb-2">Informações para a Comunidade</h4>
                <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem;">
                    <li class="flex align-center gap-2 text-sm">
                        <i class="ph ph-calendar-blank text-primary"></i> 
                        <strong>Data:</strong> ${project.date.start}
                    </li>
                    <li class="flex align-center gap-2 text-sm">
                        <i class="ph ph-clock text-primary"></i> 
                        <strong>Horário:</strong> ${project.date.schedule}
                    </li>
                    <li class="flex align-center gap-2 text-sm">
                        <i class="ph ph-map-pin text-primary"></i> 
                        <strong>Local:</strong> ${project.location}
                    </li>
                    <li class="flex align-center gap-2 text-sm">
                        <i class="ph ph-users text-primary"></i> 
                        <strong>Vagas Públicas:</strong> ${spots.available} restantes
                    </li>
                </ul>
            </div>

            <div class="text-center">
                <button class="btn btn-primary w-full justify-center py-3" id="btn-open-subscribe" ${!hasSpots ? 'disabled' : ''}>
                    ${hasSpots ? 'Solicitar Minha Inscrição' : 'Entrar na Lista de Espera'}
                </button>
                <p class="text-xs text-secondary mt-2">Sua solicitação será analisada pela coordenação do projeto.</p>
            </div>
        </div>
    </div>`;
}

export function CommunitySubscribeForm(project) {
    return `
    <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <h3 class="font-bold text-lg">Inscrição: ${project.title}</h3>
            <button class="btn-icon" id="btn-close-sub-form"><i class="ph ph-x"></i></button>
        </div>
        
        <form id="community-sub-form" class="modal-body">
            <div class="form-group mb-3">
                <label class="filter-label">Nome Completo</label>
                <input type="text" id="comm-name" class="form-input" required placeholder="Seu nome">
            </div>
            <div class="form-group mb-3">
                <label class="filter-label">Telefone / WhatsApp</label>
                <input type="tel" id="comm-phone" class="form-input" required placeholder="(XX) 9XXXX-XXXX">
            </div>
            <div class="form-group mb-3">
                <label class="filter-label">Email (Opcional)</label>
                <input type="email" id="comm-email" class="form-input" placeholder="seu@email.com">
            </div>
            <div class="form-group">
                <label class="filter-label">Por que deseja participar?</label>
                <textarea id="comm-reason" class="form-input" rows="3" placeholder="Conte brevemente seu interesse..."></textarea>
            </div>
        </form>

        <div class="modal-footer">
            <button class="btn btn-outline" id="btn-cancel-sub">Cancelar</button>
            <button type="submit" form="community-sub-form" class="btn btn-primary">Confirmar Inscrição</button>
        </div>
    </div>`;
}

export function PartnershipFormModal() {
    return `
    <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <h3 class="font-bold text-lg">Seja um Parceiro</h3>
            <button class="btn-icon" id="btn-close-partner"><i class="ph ph-x"></i></button>
        </div>
        
        <form id="partner-form" class="modal-body">
            <p class="text-secondary text-sm mb-4">Tem uma escola, ONG ou empresa e quer levar projetos da UTFPR para ela? Preencha abaixo.</p>
            
            <div class="form-group mb-3">
                <label class="filter-label">Nome da Instituição</label>
                <input type="text" id="part-org" class="form-input" required placeholder="Ex: Escola Estadual X">
            </div>
            <div class="form-group mb-3">
                <label class="filter-label">Responsável pelo Contato</label>
                <input type="text" id="part-name" class="form-input" required>
            </div>
            <div class="form-group mb-3">
                <label class="filter-label">Telefone</label>
                <input type="tel" id="part-phone" class="form-input" required>
            </div>
            <div class="form-group mb-3">
                <label class="filter-label">Tipo de Interesse</label>
                <select id="part-type" class="form-select">
                    <option value="Receber Projetos">Receber Projetos (Palestras/Oficinas)</option>
                    <option value="Visita Técnica">Levar alunos para visita na UTFPR</option>
                    <option value="Outro">Outro</option>
                </select>
            </div>
        </form>

        <div class="modal-footer">
            <button class="btn btn-outline" id="btn-cancel-partner">Cancelar</button>
            <button type="submit" form="partner-form" class="btn btn-primary">Enviar Solicitação</button>
        </div>
    </div>`;
}