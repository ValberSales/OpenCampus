/* js/components/shared/ConversationCard.js */

export function ConversationCardComponent(conversation) {
    const lastMsg = conversation.messages[conversation.messages.length - 1];
    
    // Formata data simples
    const date = new Date(lastMsg.timestamp);
    const timeDisplay = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Determina quem é o "outro" lado
    const name = conversation.studentName || conversation.professorName;
    const avatar = conversation.studentAvatar || conversation.professorAvatar;
    
    // Ícone de "enviado"
    const isMe = (conversation.studentName && lastMsg.sender === 'professor') || 
                 (!conversation.studentName && lastMsg.sender === 'student');
    
    const iconHtml = isMe ? '<i class="ph ph-arrow-u-up-right"></i>' : '';

    // ID para deleção
    const deleteId = conversation.id || conversation.projectId;

    // ALTERAÇÃO: Adicionada a classe 'card' para herdar sombra e estilos base
    return `
    <div class="card conversation-card" data-id="${deleteId}">
        <img src="${avatar}" alt="${name}" class="conversation-avatar">
        
        <div class="conversation-info">
            <div class="conversation-header">
                <span class="font-bold text-main">${name}</span>
                <span class="conversation-time">${timeDisplay}</span>
            </div>
            <div class="conversation-proj-title">${conversation.projectTitle}</div>
            
            <div class="conversation-last-msg">
                ${iconHtml} ${lastMsg.text}
            </div>
        </div>

        <button class="btn-delete-conv" title="Excluir conversa" data-delete-id="${deleteId}">
            <i class="ph ph-trash"></i>
        </button>
    </div>
    `;
}