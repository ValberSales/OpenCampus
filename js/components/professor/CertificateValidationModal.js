export function CertificateValidationModal(cert) {
    const date = new Date(cert.date).toLocaleDateString('pt-BR');

    return `
    <div class="modal-content" style="max-width: 700px; height: 85vh; display: flex; flex-direction: column; overflow: hidden;">
        
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; background-color: var(--bg-card); z-index: 10;">
            <div>
                <h3 class="font-bold text-lg">Validar Atividade</h3>
                <p class="text-xs text-secondary uppercase tracking-wider">ID: #${cert.id}</p>
            </div>
            <button class="btn-icon" id="btn-close-val"><i class="ph ph-x"></i></button>
        </div>
        
        <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 2rem;">
            
            <div class="val-student-header">
                <img src="${cert.studentAvatar}" style="width: 50px; height: 50px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <div style="flex: 1;">
                    <div class="flex justify-between align-start">
                        <h4 class="font-bold text-lg leading-tight">${cert.studentName}</h4>
                        <span class="badge badge-tech">RA: ${cert.ra}</span>
                    </div>
                    <div class="text-sm text-secondary">${cert.studentCourse}</div>
                </div>
            </div>

            <div class="text-center mb-4">
                <h2 class="font-bold text-xl mb-1 text-main">${cert.title}</h2>
                <p class="text-secondary text-sm">Documento enviado para análise de horas complementares</p>
            </div>

            <div class="val-stats-grid">
                <div class="val-stat-box">
                    <div class="val-stat-icon"><i class="ph ph-buildings"></i></div>
                    <div class="val-stat-label">Emissor</div>
                    <div class="val-stat-value text-sm" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${cert.institution}">${cert.institution}</div>
                </div>
                
                <div class="val-stat-box" style="border-color: var(--primary); background-color: rgba(99, 102, 241, 0.05);">
                    <div class="val-stat-icon"><i class="ph ph-clock"></i></div>
                    <div class="val-stat-label" style="color: var(--primary);">Carga Horária</div>
                    <div class="val-stat-value" style="color: var(--primary); font-size: 1.4rem;">${cert.hours}h</div>
                </div>

                <div class="val-stat-box">
                    <div class="val-stat-icon"><i class="ph ph-calendar-blank"></i></div>
                    <div class="val-stat-label">Data de Emissão</div>
                    <div class="val-stat-value">${date}</div>
                </div>
            </div>

            <label class="filter-label mb-2 block">Visualização do Comprovante</label>
            <div class="cert-preview-wrapper">
                <img src="${cert.image}" alt="Certificado" class="cert-full-img">
                
                <div class="preview-actions">
                    <a href="${cert.image}" target="_blank" class="btn btn-outline text-sm" style="background-color: var(--bg-card)">
                        <i class="ph ph-magnifying-glass-plus"></i> Ampliar
                    </a>
                    <a href="${cert.image}" download="certificado_${cert.studentName}.jpg" class="btn btn-outline text-sm" style="background-color: var(--bg-card)">
                        <i class="ph ph-download-simple"></i> Baixar Arquivo
                    </a>
                </div>
            </div>

        </div>

        <div class="modal-footer" style="justify-content: space-between; background-color: var(--bg-ground); flex-shrink: 0; border-top: 1px solid var(--border-color); z-index: 10;">
            <button class="btn btn-outline" id="btn-cancel-val">Cancelar</button>
            <div class="flex gap-2">
                <button class="btn btn-outline text-danger hover-danger" id="btn-reject" style="border-color: var(--danger); color: var(--danger);">
                    <i class="ph ph-x-circle"></i> Rejeitar
                </button>
                <button class="btn btn-primary" id="btn-approve" style="padding-left: 2rem; padding-right: 2rem;">
                    <i class="ph ph-check-circle"></i> Aprovar Validação
                </button>
            </div>
        </div>
    </div>
    `;
}