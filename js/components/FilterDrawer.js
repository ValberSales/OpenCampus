export function FilterDrawerComponent() {
    return `
    <div class="drawer-header">
        <h3 class="font-bold text-lg"><i class="ph ph-funnel"></i> Filtrar Projetos</h3>
        <button class="btn-icon" id="btn-close-filter"><i class="ph ph-x"></i></button>
    </div>

    <form id="filter-form">
        
        <div class="filter-group">
            <label class="filter-label">Carga Horária Máxima</label>
            <div class="range-container">
                <input type="range" id="filter-hours" min="0" max="200" value="200" step="10" class="range-slider">
                <div class="range-value">Até <span id="hours-display">200</span>h</div>
            </div>
        </div>

        <div class="filter-group">
            <label class="filter-label">A partir da data</label>
            <input type="date" id="filter-date" class="form-input">
        </div>

        <div class="filter-group">
            <label class="filter-label">Turno</label>
            <div class="checkbox-group">
                <label class="checkbox-item"><input type="checkbox" name="shift" value="Matutino"> Matutino</label>
                <label class="checkbox-item"><input type="checkbox" name="shift" value="Vespertino"> Vespertino</label>
                <label class="checkbox-item"><input type="checkbox" name="shift" value="Noturno"> Noturno</label>
            </div>
        </div>

        <div class="filter-group">
            <label class="filter-label">Área de Interesse</label>
            <select id="filter-tag" class="form-select">
                <option value="">Todas as Áreas</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Social">Social</option>
                <option value="Educação">Educação</option>
                <option value="Meio Ambiente">Meio Ambiente</option>
                <option value="Saúde">Saúde</option>
                <option value="Direito">Direito</option>
            </select>
        </div>

        <div class="drawer-footer">
            <button type="button" id="btn-clear-filters" class="btn btn-outline w-full justify-center">Limpar</button>
            <button type="submit" class="btn btn-primary w-full justify-center">Aplicar</button>
        </div>
    </form>
    `;
}