// js/components/professor/CreateProjectModal.js

export function CreateProjectModal() {
    return `
    <div class="modal-content create-modal-content">
        
        <div class="modal-header create-modal-header">
            <h3 class="font-bold text-lg">Criar Novo Projeto</h3>
            <button class="btn-icon" id="btn-close-create"><i class="ph ph-x"></i></button>
        </div>
        
        <form id="create-project-form" class="modal-body create-modal-body">
            
            <div class="form-group mb-4">
                <label class="filter-label">Capa do Projeto</label>
                <div class="pm-img-edit create-img-upload-box" id="create-img-trigger">
                    <img id="create-img-preview" class="create-img-preview">
                    <div class="pm-img-edit-overlay create-img-placeholder" id="create-img-placeholder">
                        <i class="ph ph-camera" style="font-size: 2rem;"></i>
                        <span class="text-sm">Clique para enviar uma imagem</span>
                    </div>
                    <input type="file" id="create-img-input" style="display: none;" accept="image/*" required>
                </div>
            </div>

            <div class="form-group mb-3">
                <label class="filter-label">Título do Projeto</label>
                <input type="text" id="create-title" class="form-input" placeholder="Ex: Inclusão Digital" required>
            </div>

            <div class="form-group mb-3">
                <label class="filter-label">Descrição Completa</label>
                <textarea id="create-desc" class="form-input" rows="4" placeholder="Descreva os objetivos e atividades..." required style="resize: vertical;"></textarea>
            </div>

            <div class="form-grid-row">
                <div class="form-group">
                    <label class="filter-label">Data de Início</label>
                    <input type="date" id="create-start" class="form-input" required>
                </div>
                <div class="form-group">
                    <label class="filter-label">Data de Término</label>
                    <input type="date" id="create-end" class="form-input" required>
                </div>
            </div>

            <div class="form-grid-row">
                <div class="form-group">
                    <label class="filter-label">Horário / Escala</label>
                    <input type="text" id="create-schedule" class="form-input" placeholder="Ex: Seg e Qua, 14h" required>
                </div>
                <div class="form-group">
                    <label class="filter-label">Carga Horária (h)</label>
                    <input type="number" id="create-hours" class="form-input" placeholder="Ex: 40" required>
                </div>
            </div>

            <div class="form-group mb-3">
                <label class="filter-label">Localização</label>
                <input type="text" id="create-location" class="form-input" placeholder="Ex: Lab 03 - Bloco C" required>
            </div>

            <div class="card p-3 mb-3 vagas-card">
                <h4 class="font-bold text-sm mb-3 uppercase text-secondary">Configuração de Vagas</h4>
                <div class="flex gap-3">
                    <div class="w-full">
                        <label class="filter-label">Vagas Alunos</label>
                        <input type="number" id="create-v-students" class="form-input" value="10" min="1" required>
                    </div>
                    <div class="w-full">
                        <label class="filter-label">Vagas Externos</label>
                        <input type="number" id="create-v-community" class="form-input" value="0" min="0" required>
                    </div>
                </div>
            </div>

            <div class="form-group mb-3">
                <label class="filter-label">Área Principal</label>
                <select id="create-category" class="form-select">
                    <option value="Tecnologia">Tecnologia</option>
                    <option value="Social">Social</option>
                    <option value="Educação">Educação</option>
                    <option value="Meio Ambiente">Meio Ambiente</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Cultura">Cultura</option>
                    <option value="Agronomia">Agronomia</option>
                    <option value="Artes">Artes</option>
                </select>
            </div>

            <div class="form-group">
                <label class="checkbox-wrapper">
                    <input type="checkbox" id="create-open" class="checkbox-custom"> 
                    <span class="font-bold">Abrir para Comunidade Externa?</span>
                </label>
                <p class="text-xs text-secondary pl-4 mt-1">Se marcado, o projeto aparecerá na vitrine pública para inscrições externas.</p>
            </div>

        </form>

        <div class="create-modal-footer">
            <button type="button" class="btn btn-outline" id="btn-cancel-create">Cancelar</button>
            <button type="submit" form="create-project-form" class="btn btn-primary">
                <i class="ph ph-plus-circle"></i> Criar Projeto
            </button>
        </div>
    </div>
    `;
}