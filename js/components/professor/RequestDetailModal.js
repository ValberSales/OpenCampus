export function RequestDetailModal(request) {
    // Limpa telefone
    const cleanPhone = request.phone.replace(/\D/g, '');
    const whatsappLink = `https://wa.me/55${cleanPhone}?text=Olá ${request.applicantName}, recebi seu pedido para o projeto ${request.projectTitle}.`;
    const emailLink = `mailto:${request.email}?subject=Projeto ${request.projectTitle}&body=Olá ${request.applicantName},`;

    // CONDICIONAL: Só mostra a badge de info se for aluno
    const subInfoHtml = (request.type === 'student' && request.info) 
        ? `<span class="badge badge-tech text-xs">${request.info}</span>`
        : ``; // Vazio para comunidade

    return `
    <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <h3 class="font-bold text-lg">Detalhes da Solicitação</h3>
            <button class="btn-icon" id="btn-close-req"><i class="ph ph-x"></i></button>
        </div>
        
        <div class="modal-body">
            
            <div class="flex align-center gap-3 mb-4 p-3 rounded" style="background-color: var(--bg-ground); border: 1px solid var(--border-color);">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(request.applicantName)}&background=random&color=fff" style="width: 60px; height: 60px; border-radius: 50%;">
                <div style="flex: 1;">
                    <h4 class="font-bold text-lg mb-1">${request.applicantName}</h4>
                    ${subInfoHtml}
                    <div class="text-sm text-secondary mt-1">Interessado em: <strong>${request.projectTitle}</strong></div>
                </div>
            </div>

            <div class="flex gap-2 mb-4">
                <a href="${whatsappLink}" target="_blank" class="btn w-full justify-center" style="background-color: #25D366; color: white; border: none;">
                    <i class="ph ph-whatsapp-logo" style="font-size: 1.2rem;"></i> WhatsApp
                </a>
                
                <a href="${emailLink}" class="btn w-full justify-center" style="background-color: var(--text-main); color: var(--bg-card); border: none;">
                    <i class="ph ph-envelope-simple" style="font-size: 1.2rem;"></i> Email
                </a>
            </div>

            <div class="form-group mb-3">
                <label class="filter-label">Mensagem do Candidato</label>
                <div class="p-3 border rounded text-sm text-secondary" style="background: var(--bg-card); line-height: 1.6; min-height: 80px;">
                    "${request.reason}"
                </div>
            </div>

            <div class="flex gap-3">
                <div class="w-full">
                    <label class="filter-label text-xs uppercase">Telefone</label>
                    <div class="p-2 bg-ground border rounded text-sm font-bold">${request.phone}</div>
                </div>
                <div class="w-full">
                    <label class="filter-label text-xs uppercase">Email</label>
                    <div class="p-2 bg-ground border rounded text-sm font-bold" style="overflow: hidden; text-overflow: ellipsis;">${request.email}</div>
                </div>
            </div>
        </div>

        <div class="modal-footer" style="justify-content: space-between; background-color: var(--bg-ground);">
            <button class="btn btn-outline" id="btn-close-action">Fechar</button>
            <div class="flex gap-2">
                <button class="btn btn-outline text-danger hover-danger" id="btn-reject" style="border-color: var(--danger); color: var(--danger);">
                    Rejeitar
                </button>
                <button class="btn btn-primary" id="btn-accept">
                    <i class="ph ph-check"></i> Aceitar
                </button>
            </div>
        </div>
    </div>
    `;
}