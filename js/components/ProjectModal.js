export function ProjectModalComponent(project, isSubscribed = false) {
    // Lógica para Vagas
    let vacanciesHtml = '';
    const totalSpots = project.vacancies.students.total;
    const availableSpots = project.vacancies.students.available;
    const takenSpots = totalSpots - availableSpots;

    if (totalSpots <= 10) {
        for (let i = 0; i < takenSpots; i++) vacanciesHtml += `<div class="dot taken" title="Ocupada"></div>`;
        for (let i = 0; i < availableSpots; i++) vacanciesHtml += `<div class="dot filled" title="Disponível"></div>`;
    } else {
        vacanciesHtml = `<span class="text-sm text-secondary">${availableSpots} vagas restantes</span>`;
    }

    // Lógica de Data
    let dateDisplay = project.date.isOneDay ? project.date.start : `${project.date.start} até ${project.date.end}`;

    // Lógica dos Botões (Renderização Condicional)
    // Se inscrito: Botão Verde desabilitado. Se não: Botão Primário de ação.
    const actionButton = isSubscribed
        ? `<button class="btn btn-success" disabled><i class="ph ph-check"></i> Você já está inscrito</button>`
        : `<button class="btn btn-primary" id="btn-confirm-sub" ${availableSpots === 0 ? 'disabled' : ''}>Confirmar Inscrição</button>`;

    return `
    <div class="modal-content">
        <button class="btn-close-modal" id="btn-modal-close"><i class="ph ph-x"></i></button>
        
        <img src="${project.image}" alt="${project.title}" class="modal-header-img">
        
        <div class="modal-body">
            <div class="flex justify-between align-center mb-2">
                <div class="flex gap-1">
                    ${project.tags.map(t => `<span class="badge ${t.class}">${t.label}</span>`).join('')}
                </div>
                ${availableSpots > 0 
                    ? `<span class="badge badge-env"><i class="ph ph-check"></i> Inscrições Abertas</span>` 
                    : `<span class="badge badge-art">Esgotado</span>`
                }
            </div>

            <h2 class="modal-title">${project.title}</h2>
            
            <div class="professor-badge">
                <img src="${project.professor.avatar}" alt="${project.professor.name}" class="prof-avatar">
                <div>
                    <div class="text-sm text-secondary uppercase font-bold">Responsável</div>
                    <div class="font-bold">${project.professor.name}</div>
                    <div class="text-sm text-secondary">${project.professor.email}</div>
                </div>
            </div>

            <p style="line-height: 1.6; color: var(--text-secondary); margin-bottom: 1.5rem;">
                ${project.description}
            </p>

            <div class="modal-meta-grid">
                <div class="meta-item">
                    <div class="meta-icon"><i class="ph ph-calendar-blank"></i></div>
                    <div class="meta-info"><h4>Quando?</h4><p>${dateDisplay}</p><p class="text-sm text-secondary">${project.date.schedule}</p></div>
                </div>
                <div class="meta-item">
                    <div class="meta-icon"><i class="ph ph-clock"></i></div>
                    <div class="meta-info"><h4>Carga Horária</h4><p>${project.hours} Horas</p><p class="text-sm text-secondary">Certificado Incluso</p></div>
                </div>
                <div class="meta-item">
                    <div class="meta-icon"><i class="ph ph-users-three"></i></div>
                    <div class="meta-info"><h4>Vagas</h4><p>${availableSpots} / ${totalSpots} Disponíveis</p><div class="vacancy-visuals">${vacanciesHtml}</div></div>
                </div>
                <div class="meta-item">
                    <div class="meta-icon"><i class="ph ph-map-pin"></i></div>
                    <div class="meta-info"><h4>Onde?</h4><p>${project.location}</p></div>
                </div>
            </div>
        </div>

        <div class="modal-footer">
            <button class="btn btn-outline" id="btn-modal-cancel">Fechar</button>
            <button class="btn btn-outline btn-message-modal" id="btn-modal-msg">
                <i class="ph ph-chat-circle-text"></i> Mensagem
            </button>
            ${actionButton}
        </div>
    </div>
    `;
}