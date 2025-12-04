// MODO VISUALIZAÇÃO
export function CertificateDetailsModal(cert) {
    let dateDisplay = cert.isSingleDay 
        ? new Date(cert.startDate).toLocaleDateString('pt-BR') 
        : `${new Date(cert.startDate).toLocaleDateString('pt-BR')} até ${new Date(cert.endDate).toLocaleDateString('pt-BR')}`;

    const imageSrc = cert.image || "https://placehold.co/600x400/e2e8f0/64748b?text=Sem+Imagem";

    return `
    <div class="modal-content">
        <button class="btn-close-modal" id="btn-modal-close"><i class="ph ph-x"></i></button>
        <div class="modal-body">
            <h2 class="modal-title mb-2">${cert.title}</h2>
            <p class="text-secondary mb-4"><i class="ph ph-buildings"></i> ${cert.institution}</p>
            
            <div class="card p-3 mb-4" style="background: var(--bg-ground); border: none;">
                <div class="flex justify-between align-center">
                    <div>
                        <div class="text-xs text-secondary uppercase">Carga Horária</div>
                        <div class="font-bold text-lg">${cert.hours} horas</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-secondary uppercase">Data</div>
                        <div class="font-bold">${dateDisplay}</div>
                    </div>
                </div>
            </div>

            <div style="border: 1px solid var(--border-color); padding: 0.5rem; border-radius: 8px;">
                <img src="${imageSrc}" style="width: 100%; border-radius: 4px;">
            </div>
        </div>
        <div class="modal-footer">
            <span class="text-secondary text-sm mr-auto">Enviado em ${new Date(cert.id).toLocaleDateString()}</span>
            <button class="btn btn-primary" id="btn-modal-close-action">Fechar</button>
        </div>
    </div>
    `;
}

// MODO FORMULÁRIO
export function CertificateFormModal() {
    return `
    <div class="modal-content">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <h3 class="font-bold text-lg">Enviar Novo Certificado</h3>
            <button class="btn-icon" id="btn-close-form"><i class="ph ph-x"></i></button>
        </div>
        
        <form id="cert-form" class="modal-body">
            <div class="form-group mb-3">
                <label class="filter-label">Nome da Atividade / Projeto</label>
                <input type="text" id="cert-title" class="form-input" required placeholder="Ex: Workshop de Python">
            </div>

            <div class="form-group mb-3">
                <label class="filter-label">Instituição Emissora</label>
                <input type="text" id="cert-inst" class="form-input" required placeholder="Ex: Udemy, Coursera, UTFPR">
            </div>

            <div class="form-group mb-3">
                <label class="filter-label">Carga Horária (h)</label>
                <input type="number" id="cert-hours" class="form-input" required min="1" placeholder="Ex: 20">
            </div>

            <div class="form-group mb-3">
                <label class="checkbox-item mb-2">
                    <input type="checkbox" id="cert-single-day"> Foi um evento de um único dia?
                </label>
                
                <div class="flex gap-2">
                    <div class="w-full">
                        <label class="text-xs text-secondary">Data Início / Data Única</label>
                        <input type="date" id="cert-start" class="form-input" required>
                    </div>
                    <div class="w-full" id="end-date-group">
                        <label class="text-xs text-secondary">Data Fim</label>
                        <input type="date" id="cert-end" class="form-input">
                    </div>
                </div>
            </div>

            <div class="form-group mb-3">
                <label class="filter-label">Foto do Certificado</label>
                <input type="file" id="cert-file" accept="image/*" style="display: none;">
                <div class="file-upload-box" id="upload-trigger">
                    <i class="ph ph-upload-simple" style="font-size: 2rem; color: var(--primary);"></i>
                    <p class="text-sm mt-2">Clique para fazer upload</p>
                </div>
                <img id="cert-preview" class="preview-img-form">
            </div>
        </form>

        <div class="modal-footer">
            <button class="btn btn-outline" id="btn-cancel-form">Cancelar</button>
            <button type="submit" form="cert-form" class="btn btn-primary">Enviar para Análise</button>
        </div>
    </div>
    `;
}