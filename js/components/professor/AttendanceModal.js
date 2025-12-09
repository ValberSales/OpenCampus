import { DatabaseService } from '../../services/DatabaseService.js';

export function AttendanceFormModal(project, classData = null) {
    const today = new Date().toISOString().split('T')[0];
    const dateValue = classData ? classData.date : today;
    const descValue = classData ? classData.description : '';
    const titleText = classData ? 'Editar Chamada' : 'Nova Chamada';

    // 1. Busca ALUNOS reais
    const students = DatabaseService.getProjectStudents(project.id);
    
    // 2. Mock de EXTERNOS
    const externalParticipants = [
        { id: 'ext-1', name: 'Carlos Silva', role: 'Comunidade' },
        { id: 'ext-2', name: 'Maria Oliveira', role: 'Bairro Centro' },
        { id: 'ext-3', name: 'José Santos', role: 'Externo' }
    ];

    const renderRow = (person, type) => {
        let isChecked = true;
        if (classData) {
            const record = classData.attendance.find(r => r.studentId == person.id);
            if (record) isChecked = record.present;
        }
        
        const avatar = type === 'student' ? person.avatar : null;
        const subtext = type === 'student' ? person.course : person.role;
        const avatarHtml = avatar 
            ? `<img src="${avatar}" style="width: 32px; height: 32px; border-radius: 50%;">`
            : `<div style="width: 32px; height: 32px; border-radius: 50%; background: var(--bg-ground); display: flex; align-items: center; justify-content: center; font-weight: bold; color: var(--text-secondary); font-size: 0.7rem;">EX</div>`;

        return `
        <div class="attendance-row">
            <div class="flex align-center gap-3">
                ${avatarHtml}
                <div>
                    <div class="font-bold text-sm text-main">${person.name}</div>
                    <div class="text-xs text-secondary">${subtext}</div>
                </div>
            </div>
            <input type="checkbox" class="custom-checkbox attendance-check" data-id="${person.id}" data-type="${type}" ${isChecked ? 'checked' : ''}>
        </div>`;
    };

    return `
    <div class="modal-content" style="max-width: 500px; height: 85vh; display: flex; flex-direction: column; border-radius: 16px; overflow: hidden; background: var(--bg-card);">
        
        <div class="modal-header p-3 border-bottom flex justify-between align-center bg-card">
            <h3 class="font-bold text-lg">${titleText}</h3>
            <button class="btn-icon btn-close-secondary"><i class="ph ph-x"></i></button>
        </div>

        <form id="attendance-form" style="flex: 1; overflow-y: auto; background: var(--bg-ground);">
            <div class="p-3 bg-card mb-3 border-bottom">
                <input type="hidden" id="class-id" value="${classData ? classData.id : ''}">
                <div class="form-group mb-3">
                    <label class="filter-label">Data da Atividade</label>
                    <input type="date" id="class-date" class="form-input" value="${dateValue}" required>
                </div>
                <div class="form-group">
                    <label class="filter-label">Conteúdo / Descrição</label>
                    <input type="text" id="class-desc" class="form-input" value="${descValue}" placeholder="Ex: Introdução ao Módulo 2" required>
                </div>
            </div>

            <div style="padding: 0 1rem;">
                
                <div class="attendance-list-container">
                    <div class="attendance-section-header">
                        <span>Alunos Inscritos (${students.length})</span>
                        <button type="button" class="btn-mark-all btn-toggle-group" data-target="student">Marcar Todos</button>
                    </div>
                    <div style="background: var(--bg-card);">
                        ${students.length > 0 ? students.map(s => renderRow(s, 'student')).join('') : '<div class="p-3 text-secondary text-sm text-center">Nenhum aluno inscrito.</div>'}
                    </div>
                </div>

                <div class="attendance-list-container">
                    <div class="attendance-section-header">
                        <span>Comunidade Externa (${externalParticipants.length})</span>
                        <button type="button" class="btn-mark-all btn-toggle-group" data-target="external">Marcar Todos</button>
                    </div>
                    <div style="background: var(--bg-card);">
                        ${externalParticipants.map(e => renderRow(e, 'external')).join('')}
                    </div>
                </div>

            </div>
            
            <div style="height: 20px;"></div>
        </form>

        <div class="modal-footer flex justify-end gap-2 bg-card p-3 border-top">
            <button type="button" class="btn btn-outline btn-close-secondary">Cancelar</button>
            <button type="submit" form="attendance-form" class="btn btn-primary">
                <i class="ph ph-check"></i> Salvar Chamada
            </button>
        </div>
    </div>`;
}