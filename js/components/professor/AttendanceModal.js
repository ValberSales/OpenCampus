import { DatabaseService } from '../../services/DatabaseService.js';

// --- VISÃO 1: LISTA DE HISTÓRICO (DIÁRIO) ---
export function ClassLogModal(project) {
    const classes = DatabaseService.getProjectClasses(project.id);
    
    const listHtml = classes.length > 0 
        ? classes.map(c => renderClassItem(c)).join('')
        : `<div class="text-center p-4 text-secondary">Nenhuma aula registrada ainda.</div>`;

    return `
    <div class="modal-content" style="max-width: 600px; height: 80vh; display: flex; flex-direction: column;">
        <div class="modal-header flex justify-between align-center p-3 border-bottom" style="background: var(--bg-card);">
            <div>
                <h3 class="font-bold text-lg">Diário de Classe</h3>
                <span class="text-xs text-secondary">${project.title}</span>
            </div>
            <button class="btn-icon btn-close-secondary"><i class="ph ph-x"></i></button>
        </div>

        <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 1.5rem;">
            <div class="flex justify-between align-center mb-4">
                <h4 class="font-bold">Histórico de Aulas</h4>
                <button class="btn btn-primary btn-sm" id="btn-new-class">
                    <i class="ph ph-plus"></i> Registrar Aula
                </button>
            </div>
            
            <div class="class-log-list">
                ${listHtml}
            </div>
        </div>
    </div>`;
}

function renderClassItem(classItem) {
    const dateObj = new Date(classItem.date + 'T12:00:00'); // Hack para fuso horario simples
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = dateObj.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');

    // Calcula presença
    const total = classItem.attendance.length;
    const present = classItem.attendance.filter(a => a.present).length;

    return `
    <div class="class-log-item">
        <div class="flex align-center gap-2">
            <div class="date-box">
                <div class="date-day">${day}</div>
                <div class="date-month">${month}</div>
            </div>
            <div>
                <div class="font-bold text-sm">${classItem.description}</div>
                <div class="text-xs text-secondary">${present}/${total} Presentes</div>
            </div>
        </div>
        <button class="btn-icon btn-edit-class" data-id="${classItem.id}"><i class="ph ph-pencil-simple"></i></button>
    </div>`;
}

// --- VISÃO 2: FORMULÁRIO DE CHAMADA ---
export function AttendanceFormModal(project, classData = null) {
    // Se for edição, usa a data existente, senão hoje
    const today = new Date().toISOString().split('T')[0];
    const dateValue = classData ? classData.date : today;
    const descValue = classData ? classData.description : '';
    const titleText = classData ? 'Editar Chamada' : 'Nova Chamada';

    // Gera lista de alunos (Mock ou dados reais se tivermos)
    // Aqui misturamos alunos e comunidade numa lista única para a chamada
    const students = [
        { id: 1, name: 'João Silva', type: 'Aluno' },
        { id: 2, name: 'Maria Oliveira', type: 'Aluno' },
        { id: 3, name: 'Sr. José', type: 'Externo' },
        { id: 4, name: 'Dona Lourdes', type: 'Externo' }
    ];

    const listHtml = students.map(student => {
        // Se for edição, verifica se estava presente
        let isChecked = true; // Padrão presente
        if (classData) {
            const record = classData.attendance.find(r => r.studentId === student.id);
            if (record) isChecked = record.present;
        }

        return `
        <div class="user-item">
            <div class="user-info">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random" class="user-avatar">
                <div>
                    <div class="font-bold text-sm">${student.name}</div>
                    <div class="text-xs text-secondary">${student.type}</div>
                </div>
            </div>
            <label class="attendance-toggle">
                <input type="checkbox" class="attendance-check" data-id="${student.id}" ${isChecked ? 'checked' : ''}>
            </label>
        </div>`;
    }).join('');

    return `
    <div class="modal-content" style="max-width: 600px; height: 90vh; display: flex; flex-direction: column;">
        <div class="modal-header flex justify-between align-center p-3 border-bottom" style="background: var(--bg-card);">
            <div class="flex align-center gap-2">
                <button class="btn-icon" id="btn-back-to-log"><i class="ph ph-arrow-left"></i></button>
                <h3 class="font-bold text-lg">${titleText}</h3>
            </div>
            <button class="btn-icon btn-close-secondary"><i class="ph ph-x"></i></button>
        </div>

        <form id="attendance-form" class="attendance-scroll-area">
            <input type="hidden" id="class-id" value="${classData ? classData.id : ''}">
            
            <div class="flex gap-2 mb-3">
                <div style="flex: 1;">
                    <label class="filter-label">Data</label>
                    <input type="date" id="class-date" class="form-input" value="${dateValue}" required>
                </div>
                <div style="flex: 2;">
                    <label class="filter-label">Atividade / Conteúdo</label>
                    <input type="text" id="class-desc" class="form-input" value="${descValue}" placeholder="Ex: Aula prática de soldagem" required>
                </div>
            </div>

            <div class="mb-2 flex justify-between align-end">
                <label class="filter-label">Lista de Presença</label>
                <button type="button" class="text-xs text-primary font-bold" id="btn-toggle-all">Marcar Todos</button>
            </div>
            
            <div class="user-list">
                ${listHtml}
            </div>
        </form>

        <div class="sticky-form-footer">
            <span class="text-xs text-secondary" id="count-display">Calculando...</span>
            <button type="submit" form="attendance-form" class="btn btn-success">
                <i class="ph ph-check"></i> Confirmar Aula
            </button>
        </div>
    </div>`;
}