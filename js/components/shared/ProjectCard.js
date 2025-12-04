export function ProjectCardComponent(project) {
    const tagsHtml = project.tags.map(tag => 
        `<span class="badge ${tag.class}">${tag.label}</span>`
    ).join('');

    return `
    <div class="card project-card" data-id="${project.id}">
        <div class="project-img-container">
            <img src="${project.image}" alt="${project.title}" class="project-img">
        </div>
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <div class="project-tags">${tagsHtml}</div>
            <p class="project-desc">${project.description.substring(0, 100)}...</p>
        </div>
        <div class="project-actions">
            <button class="btn btn-primary w-full justify-center">
                Ver Detalhes
            </button>
            <button class="btn btn-outline w-full justify-center btn-message">Mensagem</button>
        </div>
    </div>
    `;
}