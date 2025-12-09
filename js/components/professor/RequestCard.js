export function RequestCardComponent(request) {
    const date = new Date(request.date);
    const timeDisplay = date.toLocaleDateString('pt-BR');

    // Avatar genérico com as iniciais
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(request.applicantName)}&background=random&color=fff`;

    return `
    <div class="card conversation-card request-card-trigger" data-id="${request.id}">
        <img src="${avatarUrl}" alt="${request.applicantName}" class="conversation-avatar">
        
        <div class="conversation-info">
            <div class="conversation-header">
                <div class="font-bold">${request.applicantName}</div>
                <div class="conversation-time">${timeDisplay}</div>
            </div>
            <div class="conversation-proj-title mb-1" style="color: var(--primary);">
                <i class="ph ph-folder-notch"></i> ${request.projectTitle}
            </div>
            
            <div class="conversation-last-msg">
                ${request.reason}
            </div>
        </div>
        
        <div style="width: 10px; height: 10px; background-color: var(--warning); border-radius: 50%; margin-left: 10px;"></div>
    </div>
    `;
}