export function ProjectManagementModal(project) {
    return `
    <div class="modal-content" style="max-width: 800px; height: 90vh; display: flex; flex-direction: column;">
        
        <div class="modal-header flex justify-between align-center p-3 border-bottom" style="background: var(--bg-card);">
            <div>
                <h3 class="font-bold text-lg">${project.title}</h3>
                <span class="text-xs text-secondary">Painel de Gestão</span>
            </div>
            <button class="btn-icon" id="btn-modal-close"><i class="ph ph-x"></i></button>
        </div>

        <div class="tabs-nav flex border-bottom" style="padding: 0 1rem; gap: 1rem;">
            <button class="tab-btn active" data-tab="details">Detalhes</button>
            <button class="tab-btn" data-tab="students">Alunos Inscritos</button>
            <button class="tab-btn" data-tab="community">Participantes Externos</button>
            <button class="tab-btn" data-tab="certificates">Certificados</button>
        </div>

        <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 1.5rem;">
            
            <div id="tab-details" class="tab-content active">
                <form id="edit-project-form">
                    <div class="form-group mb-3">
                        <label class="filter-label">Título do Projeto</label>
                        <input type="text" class="form-input" value="${project.title}">
                    </div>
                    <div class="flex gap-2 mb-3">
                        <div class="w-full">
                            <label class="filter-label">Data Início</label>
                            <input type="text" class="form-input" value="${project.date.start}">
                        </div>
                        <div class="w-full">
                            <label class="filter-label">Horário</label>
                            <input type="text" class="form-input" value="${project.date.schedule}">
                        </div>
                    </div>
                    <div class="form-group mb-3">
                        <label class="filter-label">Descrição</label>
                        <textarea class="form-input" rows="4">${project.description}</textarea>
                    </div>
                    <div class="flex gap-2">
                        <div class="w-full">
                            <label class="filter-label">Vagas Alunos</label>
                            <input type="number" class="form-input" value="${project.vacancies.students.total}">
                        </div>
                        <div class="w-full">
                            <label class="filter-label">Vagas Comunidade</label>
                            <input type="number" class="form-input" value="${project.vacancies.community.total}">
                        </div>
                    </div>
                    <div class="mt-4 text-right">
                        <button type="submit" class="btn btn-primary">Salvar Alterações</button>
                    </div>
                </form>
            </div>

            <div id="tab-students" class="tab-content" style="display: none;">
                <div class="flex justify-between align-center mb-3">
                    <h4 class="font-bold">Alunos da UTFPR</h4>
                    <button class="btn btn-sm btn-outline"><i class="ph ph-file-csv"></i> Exportar Lista</button>
                </div>
                <div class="user-list">
                    ${renderMockUserList('aluno')}
                </div>
            </div>

            <div id="tab-community" class="tab-content" style="display: none;">
                <div class="flex justify-between align-center mb-3">
                    <h4 class="font-bold">Membros da Comunidade</h4>
                    <button class="btn btn-sm btn-outline"><i class="ph ph-plus"></i> Adicionar Manualmente</button>
                </div>
                <div class="user-list">
                    ${renderMockUserList('comunidade')}
                </div>
            </div>

            <div id="tab-certificates" class="tab-content" style="display: none;">
                <div class="card p-3 mb-4" style="background: var(--bg-ground); border: none;">
                    <h4 class="font-bold mb-2">Emissão em Lote</h4>
                    <p class="text-sm text-secondary">Selecione os participantes que concluíram a carga horária mínima de 75%.</p>
                </div>

                <details class="mb-2" open>
                    <summary class="p-2 font-bold cursor-pointer bg-ground rounded mb-2">Alunos Extensionistas</summary>
                    <div class="p-2">
                        ${renderChecklist('aluno')}
                    </div>
                </details>

                <details>
                    <summary class="p-2 font-bold cursor-pointer bg-ground rounded mb-2">Participantes Externos</summary>
                    <div class="p-2">
                        ${renderChecklist('comunidade')}
                    </div>
                </details>

                <div class="mt-4 pt-3 border-top flex justify-between align-center">
                    <span class="text-sm text-secondary">Isso enviará um email para os selecionados.</span>
                    <button class="btn btn-success"><i class="ph ph-certificate"></i> Emitir Certificados</button>
                </div>
            </div>

        </div>
    </div>
    `;
}

// --- HELPER PARA DADOS MOCKADOS (SIMULAÇÃO) ---
function renderMockUserList(type) {
    const names = type === 'aluno' 
        ? ['João Silva', 'Maria Oliveira', 'Pedro Santos', 'Ana Costa'] 
        : ['Sr. José (Comunidade)', 'Dona Lourdes', 'Carlos (ONG Viva)'];
    
    return names.map(name => `
        <div class="flex justify-between align-center p-2 border-bottom">
            <div class="flex align-center gap-2">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random" class="rounded-circle" style="width: 32px; height: 32px;">
                <div>
                    <div class="font-bold text-sm">${name}</div>
                    <div class="text-xs text-secondary">75% Presença</div>
                </div>
            </div>
            <div class="flex gap-1">
                <button class="btn-icon text-primary" title="Mensagem"><i class="ph ph-chat-circle"></i></button>
                <button class="btn-icon text-danger" title="Remover"><i class="ph ph-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function renderChecklist(type) {
    const names = type === 'aluno' 
        ? ['João Silva', 'Maria Oliveira', 'Pedro Santos', 'Ana Costa'] 
        : ['Sr. José (Comunidade)', 'Dona Lourdes', 'Carlos (ONG Viva)'];

    return names.map(name => `
        <label class="flex align-center gap-2 p-2 hover-bg rounded">
            <input type="checkbox" checked>
            <span class="text-sm">${name}</span>
        </label>
    `).join('');
}