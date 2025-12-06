export function BadgeModalComponent(level) {
    // Configuração dos Troféus
    const badges = {
        bronze: {
            title: "Nível Bronze",
            image: "./../../data/images/bronze.webp",
            hours: 10,
            message: "Parabéns! Você deu o pontapé inicial e completou suas primeiras 10 horas de extensão. O caminho é longo, mas você já começou!"
        },
        silver: {
            title: "Nível Prata",
            image: "./../../data/images/prata.webp",
            hours: 50,
            message: "Muito bem! Você já acumulou 50 horas de atividades. Seu engajamento com a comunidade está fazendo a diferença."
        },
        gold: {
            title: "Nível Ouro",
            image: "./../../data/images/ouro.webp",
            hours: 100,
            message: "Incrível! Você atingiu a marca de 100 horas. Você já é uma referência em extensão universitária."
        },
        platinum: {
            title: "Nível Platina",
            image: "./../../data/images/platina.webp",
            hours: 200,
            message: "Extraordinário! Você completou 200 horas.<br><br><strong>Parabéns! Você cumpriu integralmente a carga horária de extensão exigida para o seu curso.</strong>"
        }
    };

    const data = badges[level];

    if (!data) return '';

    // Lógica para definir o texto do botão
    const isFinalLevel = level === 'platinum';
    const buttonText = isFinalLevel ? 'Missão Cumprida!' : 'Que venha o próximo!';

    return `
    <div class="modal-content" style="max-width: 400px; text-align: center;">
        <button class="btn-close-modal" id="btn-modal-close"><i class="ph ph-x"></i></button>
        
        <div class="modal-body" style="padding: 2.5rem 2rem;">
            
            <div style="margin-bottom: 1.5rem; position: relative; display: inline-block;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 120px; height: 120px; background: radial-gradient(circle, var(--primary) 0%, transparent 70%); opacity: 0.2; border-radius: 50%;"></div>
                <img src="${data.image}" alt="${data.title}" style="width: 120px; height: auto; position: relative; z-index: 2; drop-shadow: 0 10px 15px rgba(0,0,0,0.1);">
            </div>

            <h2 class="modal-title" style="color: var(--primary); margin-bottom: 0.5rem;">${data.title}</h2>
            <div class="badge badge-tech" style="display: inline-block; margin-bottom: 1.5rem; font-size: 0.9rem;">
                ${data.hours}+ Horas
            </div>

            <p style="line-height: 1.6; color: var(--text-secondary); font-size: 1rem;">
                ${data.message}
            </p>
        </div>

        <div class="modal-footer" style="justify-content: center;">
            <button class="btn btn-primary w-full justify-center" id="btn-modal-close-action">${buttonText}</button>
        </div>
    </div>
    `;
}