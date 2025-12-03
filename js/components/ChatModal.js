export function ChatModalComponent(conversation) {
    return `
    <div class="chat-modal-content">
        <div class="chat-header">
            <div class="flex align-center gap-2">
                <img src="${conversation.professorAvatar}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                <div>
                    <div class="font-bold line-height-1">${conversation.professorName}</div>
                    <div class="text-xs text-secondary">${conversation.projectTitle}</div>
                </div>
            </div>
            <button class="btn-icon" id="btn-close-chat"><i class="ph ph-x"></i></button>
        </div>

        <div class="chat-body" id="chat-messages-container">
            </div>

        <div class="chat-footer">
            <input type="text" id="chat-input" class="form-input" placeholder="Digite sua mensagem..." autocomplete="off">
            <button class="btn btn-primary btn-icon" id="btn-send-chat" style="width: 45px; height: 45px; display: flex; align-items: center; justify-content: center;">
                <i class="ph ph-paper-plane-right" style="font-size: 1.2rem;"></i>
            </button>
        </div>
    </div>
    `;
}

// Helper para criar o HTML de uma única mensagem (Bubble)
export function ChatBubbleComponent(msg) {
    const isStudent = msg.sender === 'student';
    const msgClass = isStudent ? 'msg-sent' : 'msg-received';
    
    // Formata hora
    const date = new Date(msg.timestamp);
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
    <div class="message-bubble ${msgClass}">
        ${msg.text}
        <span class="msg-time">${time}</span>
    </div>
    `;
}