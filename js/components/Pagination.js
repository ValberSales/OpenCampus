export function PaginationComponent(currentPage, totalPages) {
    // Se só tiver 1 página, nem mostra a paginação
    if (totalPages <= 1) return '';

    const isFirst = currentPage === 1;
    const isLast = currentPage === totalPages;

    return `
    <div class="pagination-container">
        <button id="btn-prev" class="btn btn-outline" ${isFirst ? 'disabled' : ''}>
            <i class="ph ph-caret-left"></i> Anterior
        </button>
        
        <span class="page-info">
            Página <strong>${currentPage}</strong> de ${totalPages}
        </span>

        <button id="btn-next" class="btn btn-outline" ${isLast ? 'disabled' : ''}>
            Próxima <i class="ph ph-caret-right"></i>
        </button>
    </div>
    `;
}