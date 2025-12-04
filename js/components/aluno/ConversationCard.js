export function ConversationCardComponent(conversation) {
    const lastMsg = conversation.messages[conversation.messages.length - 1];
    
    // Formata data simples
    const date = new Date(lastMsg.timestamp);
    const timeDisplay = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
    <div class="card conversation-card" data-project-id="${conversation.projectId}">
        <img src="${conversation.professorAvatar}" alt="${conversation.professorName}" class="conversation-avatar">
        
        <div class="conversation-info">
            <div class="conversation-header">
                <div class="font-bold">${conversation.professorName}</div>
                <div class="conversation-time">${timeDisplay}</div>
            </div>
            <div class="conversation-proj-title mb-2">${conversation.projectTitle}</div>
            
            <div class="conversation-last-msg">
                <i class="ph ph-check" style="font-size: 0.8rem"></i> ${lastMsg.text}
            </div>
        </div>
    </div>
    `;
}