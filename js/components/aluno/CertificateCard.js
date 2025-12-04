export function CertificateCardComponent(cert) {
    // Formatação de data
    let dateDisplay = cert.isSingleDay 
        ? new Date(cert.startDate).toLocaleDateString('pt-BR') 
        : `${new Date(cert.startDate).toLocaleDateString('pt-BR')} - ${new Date(cert.endDate).toLocaleDateString('pt-BR')}`;

    // Imagem (se não tiver, usa placeholder)
    const imageSrc = cert.image || "https://placehold.co/100x80/e2e8f0/64748b?text=Certificado";

    return `
    <div class="card cert-card-full" data-id="${cert.id}">
        <img src="${imageSrc}" alt="Certificado" class="cert-thumb">
        
        <div class="cert-info">
            <h3 class="cert-title">${cert.title}</h3>
            <div class="cert-org">
                <i class="ph ph-buildings"></i> ${cert.institution}
            </div>
        </div>

        <div class="cert-meta">
            <span class="cert-hours">${cert.hours} Horas</span>
            <span class="cert-date">${dateDisplay}</span>
            <span class="badge badge-env" style="font-size: 0.65rem; margin-top: 4px;">Aprovado</span>
        </div>
    </div>
    `;
}