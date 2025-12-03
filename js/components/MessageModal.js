export function MessageModalComponent(project) {
    return `
    <div class="modal-content" style="max-width: 500px;">
        <div class="modal-header" style="padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <h3 class="font-bold text-lg">Nova Mensagem</h3>
            <button class="btn-icon" id="btn-close-msg-modal"><i class="ph ph-x"></i></button>
        </div>
        
        <div class="modal-body">
            <div class="professor-badge" style="margin-bottom: 1rem;">
                <img src="${project.professor.avatar}" alt="${project.professor.name}" class="prof-avatar">
                <div>
                    <div class="text-sm text-secondary uppercase font-bold">Para</div>
                    <div class="font-bold">${project.professor.name}</div>
                    <div class="text-sm text-secondary">Projeto: ${project.title}</div>
                </div>
            </div>

            <div class="form-group">
                <label class="filter-label" for="message-text">Sua mensagem</label>
                <textarea id="message-text" rows="5" class="form-input" placeholder="Olá professor, gostaria de saber mais sobre..."></textarea>
            </div>
        </div>

        <div class="modal-footer">
            <button class="btn btn-outline" id="btn-cancel-msg">Cancelar</button>
            <button class="btn btn-primary" id="btn-send-msg" data-project-id="${project.id}">
                <i class="ph ph-paper-plane-right"></i> Enviar
            </button>
        </div>
    </div>
    `;
}