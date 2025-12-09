import { DatabaseService } from '../../services/DatabaseService.js';

export function ProjectManagementModal(project) {
    const enrolledStudents = DatabaseService.getProjectStudents(project.id);
    const classes = DatabaseService.getProjectClasses(project.id);
    
    // Cálculos de Vagas
    const sTotal = project.vacancies.students.total;
    const sTaken = enrolledStudents.length;
    const sAvail = Math.max(0, sTotal - sTaken);
    
    const cTotal = project.vacancies.community.total;
    const cTaken = Math.floor(cTotal * 0.3); // Mock
    
    let vacanciesHtml = '';
    for(let i=0; i<Math.min(sTaken, 15); i++) vacanciesHtml += `<div class="dot taken" title="Ocupada"></div>`;
    for(let i=0; i<Math.min(sAvail, 15); i++) vacanciesHtml += `<div class="dot filled" title="Disponível"></div>`;

    const dateDisplay = project.date.isOneDay ? project.date.start : `${project.date.start} até ${project.date.end}`;

    return `
    <div class="pm-modal-container" id="flip-container">
        <div class="pm-flip-inner">
            
            <div class="pm-flip-front">
                <div class="pm-header-overlay">
                    <button class="pm-close-btn" id="btn-modal-close" title="Fechar Janela"><i class="ph ph-x"></i></button>
                </div>

                <div class="pm-scroll-body" id="modal-scroll-body">
                    
                    <div id="view-mode-container">
                        <img src="${project.image}" class="pm-hero-img" alt="${project.title}">
                        
                        <div class="pm-content-padding">
                            <div class="flex justify-between align-center mb-2">
                                <div class="flex gap-1">
                                    ${project.tags.map(t => `<span class="badge ${t.class}">${t.label}</span>`).join('')}
                                </div>
                                <span class="badge ${project.openToCommunity ? 'badge-env' : 'badge-art'}">
                                    ${project.openToCommunity ? 'Aberto à Comunidade' : 'Interno'}
                                </span>
                            </div>

                            <h2 class="modal-title mb-4">${project.title}</h2>

                            <div class="pm-tabs-container">
                                <button class="pm-tab-btn active" data-tab="details">Detalhes</button>
                                <button class="pm-tab-btn" data-tab="students">Alunos (${sTaken})</button>
                                <button class="pm-tab-btn" data-tab="community">Externos (${cTaken})</button>
                            </div>

                            <div style="min-height: 200px;">
                                <div id="tab-details" class="tab-content active">
                                    <p style="line-height: 1.6; color: var(--text-secondary); margin-bottom: 1.5rem;">${project.description}</p>
                                    <div class="modal-meta-grid" style="margin: 0; padding-top: 0; border-top: none;">
                                        <div class="meta-item">
                                            <div class="meta-icon"><i class="ph ph-calendar-blank"></i></div>
                                            <div class="meta-info"><h4>Período</h4><p>${dateDisplay}</p></div>
                                        </div>
                                        <div class="meta-item">
                                            <div class="meta-icon"><i class="ph ph-users-three"></i></div>
                                            <div class="meta-info"><h4>Vagas Alunos</h4><p>${sTaken} / ${sTotal}</p><div class="vacancy-visuals">${vacanciesHtml}</div></div>
                                        </div>
                                    </div>
                                </div>

                                <div id="tab-students" class="tab-content" style="display: none;">
                                    <div class="flex justify-between align-center mb-3">
                                        <h4 class="font-bold text-sm uppercase text-secondary">Alunos Inscritos</h4>
                                        <button class="btn-icon text-primary"><i class="ph ph-plus-circle" style="font-size: 1.2rem;"></i></button>
                                    </div>
                                    <div class="user-list bg-card border rounded">
                                        ${renderStudentList(enrolledStudents)}
                                    </div>
                                </div>

                                <div id="tab-community" class="tab-content" style="display: none;">
                                    <div class="flex justify-between align-center mb-3">
                                        <h4 class="font-bold text-sm uppercase text-secondary">Participantes Externos</h4>
                                        <button class="btn-icon text-primary"><i class="ph ph-plus-circle" style="font-size: 1.2rem;"></i></button>
                                    </div>
                                    <div class="user-list bg-card border rounded">
                                        ${renderMockExternalList(cTaken)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div id="edit-mode-container" style="display: none;">
                        <div class="pm-img-edit" id="edit-img-trigger">
                            <img src="${project.image}" id="edit-img-preview">
                            <div class="pm-img-edit-overlay"><i class="ph ph-camera mr-2"></i> Alterar Capa</div>
                            <input type="file" id="edit-img-input" style="display: none;" accept="image/*">
                        </div>
                        <div class="pm-content-padding">
                            <h3 class="font-bold text-lg mb-4">Editar Informações</h3>
                            <form id="edit-project-form">
                                <div class="form-group mb-3">
                                    <label class="filter-label">Título</label>
                                    <input type="text" id="edit-title" class="form-input" value="${project.title}" required>
                                </div>
                                <div class="form-group mb-3">
                                    <label class="filter-label">Descrição</label>
                                    <textarea id="edit-desc" class="form-input" rows="5" required>${project.description}</textarea>
                                </div>
                                <div class="flex gap-3">
                                    <div class="w-full"><label class="filter-label">Vagas Alunos</label><input type="number" id="edit-v-students" class="form-input" value="${sTotal}"></div>
                                    <div class="w-full"><label class="filter-label">Vagas Externos</label><input type="number" id="edit-v-community" class="form-input" value="${cTotal}"></div>
                                </div>
                            </form>
                        </div>
                    </div>

                </div>

                <div class="pm-footer">
                    <div id="view-footer-actions" class="w-full flex justify-end gap-2">
                        <button class="btn btn-outline" id="btn-modal-cancel">Fechar</button>
                        <button class="btn btn-outline" id="btn-enable-edit"><i class="ph ph-pencil-simple"></i> Editar</button>
                        <button class="btn btn-primary" id="btn-flip-diary"><i class="ph ph-notebook"></i> Diário de Atividades</button>
                    </div>
                    <div id="edit-footer-actions" class="w-full flex justify-between align-center" style="display: none;">
                        <button class="btn btn-outline text-danger hover-danger" style="border-color: var(--danger); color: var(--danger);"><i class="ph ph-trash"></i> Excluir</button>
                        <div class="flex gap-2">
                            <button class="btn btn-outline" id="btn-cancel-edit">Cancelar</button>
                            <button type="submit" form="edit-project-form" class="btn btn-primary">Salvar</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="pm-flip-back">
                
                <div class="pm-header-simple">
                    <div class="flex align-center gap-2">
                        <div style="width: 40px; height: 40px; border-radius: 8px; background: var(--bg-ground); display: flex; align-items: center; justify-content: center; color: var(--primary);">
                            <i class="ph ph-notebook" style="font-size: 1.5rem;"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg line-height-1">Diário de Atividades</h3>
                            <span class="text-xs text-secondary">Controle de Frequência</span>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <span class="badge badge-tech">${classes.length} Atividades</span>
                    </div>
                </div>

                <div class="pm-scroll-body pm-content-padding" style="background-color: var(--bg-ground);">
                    ${classes.length === 0 
                        ? `<div class="card p-5 text-center">
                                <div style="width: 60px; height: 60px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: var(--text-secondary);">
                                    <i class="ph ph-calendar-plus" style="font-size: 1.5rem;"></i>
                                </div>
                                <h4 class="font-bold text-main">Nenhuma atividade registrada</h4>
                                <p class="text-sm text-secondary mb-3">Comece registrando a primeira ativiade do projeto.</p>
                                <button class="btn btn-primary" id="btn-new-class-empty">Registrar Primeira Atividade</button>
                           </div>`
                        : `<div class="history-list">
                                ${renderClassLog(classes)}
                           </div>`
                    }
                </div>

                <div class="pm-footer pm-footer-split">
                    <button class="btn btn-outline" id="btn-flip-back">
                        <i class="ph ph-arrow-left"></i> Voltar
                    </button>
                    <button class="btn btn-primary" id="btn-new-class">
                        <i class="ph ph-plus"></i> Registrar Nova Atividade
                    </button>
                </div>

            </div>

        </div>
    </div>
    `;
}

// Helpers de Renderização
function renderClassLog(classes) {
    // Ordena da mais recente para a mais antiga
    return classes.sort((a, b) => new Date(b.date) - new Date(a.date)).map(c => {
        const d = new Date(c.date + 'T12:00:00');
        const day = d.getDate().toString().padStart(2, '0');
        const month = d.toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();
        const presentCount = c.attendance.filter(a => a.present).length;
        const totalCount = c.attendance.length;
        const percent = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
        
        return `
        <div class="history-item card p-0 border-0 overflow-hidden">
            <div class="history-date">
                <span style="font-size: 1.1rem; font-weight: 800; line-height: 1;">${day}</span>
                <span style="font-size: 0.65rem; font-weight: 600; color: var(--text-secondary);">${month}</span>
            </div>
            <div style="flex: 1;">
                <div class="font-bold text-sm mb-1">${c.description}</div>
                <div class="text-xs text-secondary flex align-center gap-2">
                    <span class="badge ${percent > 70 ? 'badge-env' : 'badge-art'}" style="font-size: 0.6rem; padding: 2px 6px;">${percent}% Presente</span>
                    <span>${presentCount}/${totalCount} Alunos</span>
                </div>
            </div>
            <button class="action-btn btn-edit-class" data-id="${c.id}" title="Editar Chamada">
                <i class="ph ph-pencil-simple"></i>
            </button>
        </div>`;
    }).join('');
}

function renderStudentList(students) {
    if (students.length === 0) return `<div class="p-4 text-center text-secondary">Nenhum aluno inscrito.</div>`;
    
    return students.map(u => `
        <div class="user-item flex justify-between align-center p-3 border-bottom" style="background-color: var(--bg-card);">
            <div class="flex align-center gap-3">
                <img src="${u.avatar}" style="width: 40px; height: 40px; border-radius: 50%;">
                <div>
                    <div class="text-sm font-bold">${u.name}</div>
                    <div class="text-xs text-secondary">${u.course}</div>
                </div>
            </div>
            <div class="flex gap-2">
                <button class="action-btn" title="Enviar Mensagem"><i class="ph ph-chat-circle-text"></i></button>
                <button class="action-btn danger" title="Remover"><i class="ph ph-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function renderMockExternalList(count) {
    if (count === 0) return `<div class="p-4 text-center text-secondary">Nenhum participante externo.</div>`;
    
    let html = '';
    const names = ["Carlos Silva", "Maria Oliveira", "José Santos", "Ana Paula", "Ricardo Alves"];
    for(let i=0; i<Math.min(count, 5); i++) {
        html += `
        <div class="user-item flex justify-between align-center p-3 border-bottom" style="background-color: var(--bg-card);">
            <div class="flex align-center gap-3">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--bg-ground); display: flex; align-items: center; justify-content: center; font-weight: bold; color: var(--text-secondary);">EX</div>
                <div>
                    <div class="text-sm font-bold">${names[i]}</div>
                    <div class="text-xs text-secondary">Comunidade</div>
                </div>
            </div>
            <div class="flex gap-2">
                <button class="action-btn" title="Enviar Mensagem"><i class="ph ph-chat-circle-text"></i></button>
                <button class="action-btn danger" title="Remover"><i class="ph ph-trash"></i></button>
            </div>
        </div>`;
    }
    return html;
}