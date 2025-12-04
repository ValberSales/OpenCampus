export function PaginationComponent(currentPage, totalPages) {
    if (totalPages <= 1) return '';

    const isFirst = currentPage === 1;
    const isLast = currentPage === totalPages;

    return `
    <div class="pagination-container">
        <button type="button" id="btn-prev" class="btn btn-outline" ${isFirst ? 'disabled' : ''}>
            <i class="ph ph-caret-left"></i> Anterior
        </button>
        
        <span class="page-info">
            <strong>${currentPage}</strong> de ${totalPages}
        </span>

        <button type="button" id="btn-next" class="btn btn-outline" ${isLast ? 'disabled' : ''}>
            Próxima <i class="ph ph-caret-right"></i>
        </button>
    </div>
    `;
}