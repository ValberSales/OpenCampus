import { ProfessorHeaderComponent } from '../components/professor/ProfessorHeader.js';
import { ProfessorSidebarComponent } from '../components/professor/ProfessorSidebar.js';
import { FooterComponent } from '../components/shared/Footer.js';
import { CertificateValidationModal } from '../components/professor/CertificateValidationModal.js';
import { DatabaseService } from '../services/DatabaseService.js';

let certificates = [];

async function init() {
    await DatabaseService.init();

    document.getElementById('app-header').innerHTML = ProfessorHeaderComponent('validation');
    document.getElementById('app-sidebar-mobile').innerHTML = ProfessorSidebarComponent('validation');
    document.getElementById('app-footer').innerHTML = FooterComponent();

    loadCertificates();
    setupEventListeners();
}

function loadCertificates() {
    const storageKey = 'opencampus_pending_validations';
    const stored = localStorage.getItem(storageKey);

    if (stored) {
        certificates = JSON.parse(stored);
    } else {
        certificates = generateMockCertificates();
        localStorage.setItem(storageKey, JSON.stringify(certificates));
    }
    
    renderList();
}

function generateMockCertificates() {
    return [
        {
            id: 1,
            studentName: "Lucas Pereira",
            ra: "2345678", // NOVO
            studentAvatar: "https://ui-avatars.com/api/?name=Lucas+P&background=random",
            studentCourse: "Engenharia de Software",
            title: "Workshop de React Native",
            institution: "Udemy",
            hours: 20,
            date: "2025-10-15",
            image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=800&q=80",
            status: "pending"
        },
        {
            id: 2,
            studentName: "Fernanda Costa",
            ra: "1987654", // NOVO
            studentAvatar: "https://ui-avatars.com/api/?name=Fernanda+C&background=random",
            studentCourse: "Agronomia",
            title: "Simpósio de Tecnologia no Campo",
            institution: "Embrapa",
            hours: 8,
            date: "2025-11-02",
            image: "https://images.unsplash.com/photo-1589330694653-569e2a1daa60?auto=format&fit=crop&w=800&q=80",
            status: "pending"
        },
        {
            id: 3,
            studentName: "Rafael Santos",
            ra: "2233445", // NOVO
            studentAvatar: "https://ui-avatars.com/api/?name=Rafael+S&background=random",
            studentCourse: "Análise de Sistemas",
            title: "Semana Acadêmica de TI",
            institution: "UTFPR",
            hours: 40,
            date: "2025-09-20",
            image: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80",
            status: "pending"
        }
    ];
}

function renderList() {
    const container = document.getElementById('validation-list');
    const pending = certificates.filter(c => c.status === 'pending');

    if (pending.length === 0) {
        container.innerHTML = `
            <div class="card p-5 text-center">
                <div style="width: 60px; height: 60px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: #166534;">
                    <i class="ph ph-check" style="font-size: 2rem;"></i>
                </div>
                <h3 class="font-bold text-lg">Tudo limpo!</h3>
                <p class="text-secondary">Você validou todos os certificados pendentes.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = pending.map(c => `
        <div class="validation-card" data-id="${c.id}">
            <img src="${c.image}" alt="Certificado" class="val-cert-thumb">
            
            <div class="val-info">
                <div class="val-student-info">
                    <img src="${c.studentAvatar}" class="val-student-avatar">
                    <span class="text-xs font-bold text-secondary uppercase">${c.studentName}</span>
                    <span class="text-xs text-secondary">• RA ${c.ra}</span>
                </div>
                
                <h3 class="val-title">${c.title}</h3>
                
                <div class="val-meta">
                    <span class="flex align-center gap-1"><i class="ph ph-buildings"></i> ${c.institution}</span>
                    <span class="flex align-center gap-1"><i class="ph ph-clock"></i> ${c.hours}h</span>
                </div>
            </div>

            <div class="text-primary">
                <i class="ph ph-caret-right" style="font-size: 1.5rem;"></i>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.validation-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            const cert = certificates.find(c => c.id === id);
            openValidationModal(cert);
        });
    });
}

function openValidationModal(cert) {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = CertificateValidationModal(cert);
    requestAnimationFrame(() => overlay.classList.add('active'));

    const closeModal = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.innerHTML = '', 300);
    };

    document.getElementById('btn-close-val').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-val').addEventListener('click', closeModal);

    document.getElementById('btn-approve').addEventListener('click', () => {
        handleDecision(cert.id, 'approved');
        closeModal();
    });

    // MUDANÇA: Agora abre o modal de motivo em vez de rejeitar direto
    document.getElementById('btn-reject').addEventListener('click', () => {
        openRejectionModal(cert);
    });

    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

// NOVO: Modal de Confirmação de Rejeição
function openRejectionModal(cert) {
    const overlay = document.getElementById('modal-overlay-container');
    
    // Substitui o conteúdo do overlay pelo modal de rejeição
    overlay.innerHTML = `
    <div class="modal-content" style="max-width: 450px;">
        <div class="modal-header p-3 border-bottom">
            <h3 class="font-bold text-lg text-danger">Rejeitar Certificado</h3>
        </div>
        <div class="modal-body p-4">
            <p class="text-sm text-secondary mb-3">
                Você está prestes a rejeitar o certificado de <strong>${cert.studentName}</strong>. 
                Por favor, informe o motivo para que o aluno possa corrigir.
            </p>
            <div class="form-group">
                <label class="filter-label">Motivo da Devolução</label>
                <textarea id="reject-reason" class="form-input" rows="4" placeholder="Ex: A carga horária não corresponde ao documento; Assinatura ilegível..." autofocus></textarea>
            </div>
        </div>
        <div class="modal-footer p-3 bg-ground border-top flex justify-end gap-2">
            <button class="btn btn-outline" id="btn-back-to-val">Voltar</button>
            <button class="btn btn-primary" id="btn-confirm-reject" style="background-color: var(--danger); border-color: var(--danger);">
                Confirmar Rejeição
            </button>
        </div>
    </div>
    `;

    // Botão Voltar: Reabre o modal do certificado
    document.getElementById('btn-back-to-val').addEventListener('click', () => {
        openValidationModal(cert);
    });

    // Botão Confirmar
    document.getElementById('btn-confirm-reject').addEventListener('click', () => {
        const reason = document.getElementById('reject-reason').value;
        if (!reason.trim()) {
            alert("Por favor, informe um motivo.");
            return;
        }
        handleDecision(cert.id, 'rejected', reason);
        // Fecha tudo
        overlay.classList.remove('active');
        setTimeout(() => overlay.innerHTML = '', 300);
    });
}

function handleDecision(id, status, reason = null) {
    const idx = certificates.findIndex(c => c.id === id);
    if (idx !== -1) {
        certificates[idx].status = status;
        if (reason) certificates[idx].rejectReason = reason; // Salva o motivo
        
        localStorage.setItem('opencampus_pending_validations', JSON.stringify(certificates));
        
        const msg = status === 'approved' 
            ? 'Certificado validado com sucesso!' 
            : `Certificado rejeitado.\nMotivo: "${reason}"`;
        
        alert(msg);
        renderList();
    }
}

function setupEventListeners() {
    const btnMenu = document.getElementById('btn-menu-toggle');
    const overlay = document.getElementById('overlay');
    if (btnMenu) btnMenu.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);
    document.getElementById('btn-close-sidebar')?.addEventListener('click', toggleMenu);
    document.getElementById('header-theme-btn')?.addEventListener('click', toggleTheme);
    document.getElementById('sidebar-theme-btn')?.addEventListener('click', toggleTheme);
    loadTheme();
}

function toggleMenu() { 
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if(sidebar) sidebar.classList.toggle('active');
    if(overlay) overlay.classList.toggle('active');
}
function toggleTheme() {
    const html = document.documentElement;
    const newTheme = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('opencampus-theme', newTheme);
}
function loadTheme() { const saved = localStorage.getItem('opencampus-theme'); if (saved) document.documentElement.setAttribute('data-theme', saved); }

document.addEventListener('DOMContentLoaded', init);