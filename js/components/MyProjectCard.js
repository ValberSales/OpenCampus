export function MyProjectCardComponent(project) {
    const tagsHtml = project.tags.map(tag => 
        `<span class="badge ${tag.class}">${tag.label}</span>`
    ).join('');

    return `
    <div class="card my-project-card" data-id="${project.id}">
        <div class="my-project-img-container">
            <img src="${project.image}" alt="${project.title}" class="my-project-img">
        </div>
        
        <div class="my-project-content">
            <div class="flex gap-1 mb-2">${tagsHtml}</div>
            <h3 class="font-bold text-lg mb-2">${project.title}</h3>
            <p class="text-secondary text-sm" style="margin-bottom: 1rem;">
                <i class="ph ph-calendar-blank"></i> ${project.date.schedule}
            </p>
            <div class="professor-badge" style="padding: 0.5rem; background: transparent; margin: 0;">
                <img src="${project.professor.avatar}" class="prof-avatar" style="width: 30px; height: 30px;">
                <span class="text-sm font-bold">${project.professor.name}</span>
            </div>
        </div>

        <div class="my-project-footer">
            <button class="btn btn-primary btn-details">Mais Detalhes</button>
            <button class="btn btn-outline btn-message">Mensagem</button>
        </div>
    </div>
    `;
}