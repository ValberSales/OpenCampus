export function ProfessorProjectCardComponent(project) {
    const totalStudents = project.vacancies.students.total;
    const availableStudents = project.vacancies.students.available;
    const enrolledStudents = totalStudents - availableStudents;

    return `
    <div class="card project-card cursor-pointer hover-scale" data-id="${project.id}" style="cursor: pointer; position: relative; transition: all 0.2s ease;">
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
            
            <h3 class="project-title mb-1">${project.title}</h3>
            
            <div class="flex gap-2 text-sm text-secondary mt-auto mb-3">
                <div><i class="ph ph-student"></i> <strong>${enrolledStudents}/${totalStudents}</strong> Alunos</div>
                ${project.openToCommunity ? `<div><i class="ph ph-users"></i> <strong>${project.vacancies.community.total - project.vacancies.community.available}</strong> Externos</div>` : ''}
            </div>

            <button class="btn btn-primary w-full justify-center">
                Gerenciar Projeto
            </button>
        </div>
    </div>
    `;
}