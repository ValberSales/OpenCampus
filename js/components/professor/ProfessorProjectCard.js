export function ProfessorProjectCardComponent(project) {
    const tagsHtml = project.tags.map(tag => 
        `<span class="badge ${tag.class}">${tag.label}</span>`
    ).join('');

    // Calcula totais para exibir no card
    const totalStudents = project.vacancies.students.total;
    const availableStudents = project.vacancies.students.available;
    const enrolledStudents = totalStudents - availableStudents;

    return `
    <div class="card project-card" data-id="${project.id}">
        <div class="project-img-container">
            <img src="${project.image}" alt="${project.title}" class="project-img">
        </div>
        
        <div class="project-content">
            <div class="flex justify-between align-center mb-2">
                <span class="text-xs font-bold text-secondary uppercase">ID: #${project.id}</span>
                <span class="badge ${project.openToCommunity ? 'badge-env' : 'badge-art'}">
                    ${project.openToCommunity ? 'Aberto à Comunidade' : 'Interno'}
                </span>
            </div>
            
            <h3 class="project-title">${project.title}</h3>
            <div class="project-tags mb-2">${tagsHtml}</div>
            
            <div class="flex gap-2 text-sm text-secondary mt-auto">
                <div><i class="ph ph-student"></i> <strong>${enrolledStudents}</strong> Alunos</div>
                <div><i class="ph ph-users"></i> <strong>${project.vacancies.community.total - project.vacancies.community.available}</strong> Externos</div>
            </div>
        </div>

        <div class="project-actions">
            <button class="btn btn-primary w-full justify-center btn-manage">
                <i class="ph ph-gear"></i> Gerenciar
            </button>
            <button class="btn btn-outline w-full justify-center btn-edit">
                <i class="ph ph-pencil-simple"></i> Editar
            </button>
        </div>
    </div>
    `;
}