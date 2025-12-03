export function ProfileCardComponent() {
    return `
    <div class="card profile-card">
        <img src="https://ui-avatars.com/api/?name=Valber+Sales&background=random&size=200" alt="Valber Sales" class="profile-img">
        <h2 class="font-bold" style="font-size: 1.25rem;">Valber Sales</h2>
        <p class="text-secondary text-sm">Análise e Des. de Sistemas</p>
        <p class="text-secondary text-sm">UTFPR - Pato Branco</p>

        <div class="circular-chart">
            <div class="chart-content">
                <span class="chart-percentage">75%</span>
                <div class="chart-label">150h / 200h</div>
            </div>
        </div>
        <p class="text-sm font-bold mt-2 text-secondary uppercase">Horas de Extensão</p>

        <div class="badges-grid mb-4">
            <div class="badge-icon" title="Iniciante"><i class="ph ph-star"></i></div>
            <div class="badge-icon" title="Extensionista 50h"><i class="ph ph-medal"></i></div>
            <div class="badge-icon" title="Monitor"><i class="ph ph-chalkboard-teacher"></i></div>
            <div class="badge-icon" title="Líder de Equipe"><i class="ph ph-crown"></i></div>
        </div>

        <div class="divider"></div>

        <h3 class="font-bold mb-3 text-sm text-secondary uppercase text-left">Últimos Certificados</h3>
        <div class="cert-list">
             <div class="cert-item">
                <i class="ph ph-check-circle cert-icon"></i>
                <div>
                    <div class="font-bold text-sm">Curso de React Avançado</div>
                    <div class="text-secondary" style="font-size: 0.7rem;">Validado em 20/10/2025</div>
                </div>
            </div>
            <div class="cert-item">
                <i class="ph ph-check-circle cert-icon"></i>
                <div>
                    <div class="font-bold text-sm">Hackathon UTFPR</div>
                    <div class="text-secondary" style="font-size: 0.7rem;">Validado em 15/09/2025</div>
                </div>
            </div>
        </div>
        <button class="btn btn-outline w-full justify-center mt-3 text-sm p-3">Ver Todos</button>
    </div>
    `;
}