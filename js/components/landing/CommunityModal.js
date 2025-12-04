// js/components/landing/CommunityModal.js

export function CommunityProjectFlipModal(project) {
    // Lógica de Vagas
    const spots = project.vacancies.community;
    const hasSpots = spots.available > 0;
    
    const statusBadge = hasSpots 
        ? `<span class="badge badge-env"><i class="ph ph-check"></i> Vagas Abertas</span>`
        : `<span class="badge badge-art">Lista de Espera</span>`;

    const buttonText = hasSpots ? 'Solicitar Minha Inscrição' : 'Entrar na Lista de Espera';
    const buttonState = !hasSpots ? 'disabled' : '';

    return `
    <div class="flip-card" id="flip-card-container">
        <div class="flip-card-inner">
            
            <div class="flip-card-front modal-content" style="margin: 0; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden;">
                
                <button class="btn-close-modal action-close-modal" style="z-index: 10;"><i class="ph ph-x"></i></button>
                
                <img src="${project.image}" class="modal-header-img" alt="${project.title}" style="flex-shrink: 0;">
                
                <div class="modal-body" style="flex: 1; overflow-y: auto;">
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
                            <li class="flex align-center gap-2 text-sm"><i class="ph ph-calendar-blank text-primary"></i> <strong>Data:</strong> ${project.date.start}</li>
                            <li class="flex align-center gap-2 text-sm"><i class="ph ph-clock text-primary"></i> <strong>Horário:</strong> ${project.date.schedule}</li>
                            <li class="flex align-center gap-2 text-sm"><i class="ph ph-map-pin text-primary"></i> <strong>Local:</strong> ${project.location}</li>
                            <li class="flex align-center gap-2 text-sm"><i class="ph ph-users text-primary"></i> <strong>Vagas:</strong> ${spots.available} restantes</li>
                        </ul>
                    </div>
                </div>

                <div class="modal-footer" style="flex-shrink: 0; border-top: 1px solid var(--border-color); padding: 1.5rem; text-align: center; background-color: var(--bg-card);">
                    <button class="btn btn-primary w-full justify-center py-3" id="btn-flip-to-form" ${buttonState}>
                        ${buttonText} <i class="ph ph-arrow-right"></i>
                    </button>
                </div>
            </div>

            <div class="flip-card-back modal-content" style="margin: 0; height: 100%; display: flex; flex-direction: column;">
                
                <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: flex-start; flex-shrink: 0;">
                    <div>
                        <h3 class="font-bold text-lg">Inscrição: ${project.title}</h3>
                        <p class="text-secondary text-sm" style="font-weight: 400; margin-top: 0.25rem;">
                            Sua solicitação será avaliada pelo professor responsável.
                        </p>
                    </div>
                    <button class="btn-icon action-close-modal"><i class="ph ph-x"></i></button>
                </div>
                
                <form id="community-sub-form" class="modal-body" style="flex: 1; overflow-y: auto;">
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

                <div class="modal-footer" style="flex-shrink: 0; border-top: 1px solid var(--border-color);">
                    <button type="button" class="btn btn-outline" id="btn-flip-back">
                        <i class="ph ph-arrow-left"></i> Voltar
                    </button>
                    <button type="submit" form="community-sub-form" class="btn btn-primary">Confirmar Inscrição</button>
                </div>
            </div>

        </div>
    </div>`;
}

// (Mantenha a função PartnershipFormModal logo abaixo, como estava antes)
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