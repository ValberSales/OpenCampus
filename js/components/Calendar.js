export function CalendarComponent() {
    // Dados simulados de eventos para Dezembro
    const events = [
        { day: '03', month: 'DEZ', title: 'Reunião Robótica', time: '14:00 - Lab 03' },
        { day: '05', month: 'DEZ', title: 'Entrega Relatório', time: 'Horta Comunitária' },
        { day: '09', month: 'DEZ', title: 'Workshop UX', time: '09:00 - Auditório' },
        { day: '12', month: 'DEZ', title: 'Encerramento', time: 'Projeto Inclusão' }
    ];

    // Gera a lista de eventos HTML
    const eventsHtml = events.map(evt => `
        <div class="event-item">
            <div class="event-date-box">
                <span class="event-day">${evt.day}</span>
                <span class="event-month">${evt.month}</span>
            </div>
            <div>
                <div class="font-bold text-sm">${evt.title}</div>
                <div class="text-secondary text-sm">${evt.time}</div>
            </div>
        </div>
    `).join('');

    return `
    <div class="card">
        <div class="flex justify-between align-center mb-4">
            <h3 class="font-bold">Dezembro 2025</h3>
            <div class="flex gap-1">
                <button class="btn-icon"><i class="ph ph-caret-left"></i></button>
                <button class="btn-icon"><i class="ph ph-caret-right"></i></button>
            </div>
        </div>

        <div class="calendar-grid">
            <div class="cal-header">D</div><div class="cal-header">S</div><div class="cal-header">T</div><div class="cal-header">Q</div><div class="cal-header">Q</div><div class="cal-header">S</div><div class="cal-header">S</div>
            
            <div class="cal-day text-secondary" style="opacity: 0.5">30</div> <div class="cal-day">1</div>
            <div class="cal-day">2</div>
            <div class="cal-day today has-event">3</div>
            <div class="cal-day">4</div>
            <div class="cal-day has-event">5</div>
            <div class="cal-day">6</div>
            <div class="cal-day">7</div>
            <div class="cal-day">8</div>
            <div class="cal-day has-event">9</div>
            <div class="cal-day">10</div>
            <div class="cal-day">11</div>
            <div class="cal-day has-event">12</div>
            <div class="cal-day">13</div>
            <div class="cal-day">14</div>
            <div class="cal-day">15</div>
            <div class="cal-day">16</div>
            <div class="cal-day">17</div>
            <div class="cal-day">18</div>
            <div class="cal-day">19</div>
            <div class="cal-day">20</div>
            <div class="cal-day">21</div>
            <div class="cal-day">22</div>
            <div class="cal-day">23</div>
            <div class="cal-day">24</div>
            <div class="cal-day text-danger" title="Natal">25</div>
            <div class="cal-day">26</div>
            <div class="cal-day">27</div>
            <div class="cal-day">28</div>
            <div class="cal-day">29</div>
            <div class="cal-day">30</div>
            <div class="cal-day">31</div>
            <div class="cal-day text-secondary" style="opacity: 0.5">1</div> <div class="cal-day text-secondary" style="opacity: 0.5">2</div>
            <div class="cal-day text-secondary" style="opacity: 0.5">3</div>
        </div>

        <div class="events-list">
            <h3 class="font-bold mb-3 mt-4 text-sm text-secondary uppercase">Próximos Compromissos</h3>
            ${eventsHtml}
        </div>
    </div>
    `;
}