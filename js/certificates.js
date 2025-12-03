import { HeaderComponent } from './components/Header.js';
import { SidebarComponent } from './components/Sidebar.js';
import { ProfileCardComponent } from './components/ProfileCard.js';
import { FooterComponent } from './components/Footer.js';
import { CertificateCardComponent } from './components/CertificateCard.js';
import { CertificateFormModal, CertificateDetailsModal } from './components/CertificateModal.js';

let certificates = [];

async function init() {
    document.getElementById('app-header').innerHTML = HeaderComponent('certificates');
    document.getElementById('app-sidebar-mobile').innerHTML = SidebarComponent('certificates');
    
    // Renderiza o profile inicial (vai ser atualizado depois de add certificado)
    renderProfile();
    document.getElementById('app-footer').innerHTML = FooterComponent();

    loadCertificates();
    setupEventListeners();
    setupPageEvents();
    setupProfileEvents();
    loadTheme();
}

function renderProfile() {
    document.getElementById('profile-container').innerHTML = ProfileCardComponent();
}

function loadCertificates() {
    certificates = JSON.parse(localStorage.getItem('opencampus_certificates')) || [];
    // Ordena do mais recente para o mais antigo
    certificates.sort((a, b) => b.id - a.id);
    renderList();
}

function renderList() {
    const container = document.getElementById('certificates-container');
    
    if (certificates.length === 0) {
        container.innerHTML = `
            <div class="card p-3 text-center">
                <p class="text-secondary mb-2">Você ainda não enviou nenhum certificado.</p>
                <button id="btn-empty-add" class="btn btn-outline">Enviar o primeiro</button>
            </div>
        `;
        document.getElementById('btn-empty-add')?.addEventListener('click', openFormModal);
        return;
    }

    container.innerHTML = certificates.map(c => CertificateCardComponent(c)).join('');
    
    // Click para ver detalhes
    document.querySelectorAll('.cert-card-full').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.id);
            const cert = certificates.find(c => c.id === id);
            openDetailsModal(cert);
        });
    });
}

// --- MODAL DE FORMULÁRIO ---
function openFormModal() {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = CertificateFormModal();
    requestAnimationFrame(() => overlay.classList.add('active'));

    // Fechar
    document.getElementById('btn-close-form').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-form').addEventListener('click', closeModal);

    // Lógica do Checkbox de Data
    const checkSingle = document.getElementById('cert-single-day');
    const groupEnd = document.getElementById('end-date-group');
    checkSingle.addEventListener('change', (e) => {
        if(e.target.checked) {
            groupEnd.style.display = 'none';
            document.getElementById('cert-end').required = false;
        } else {
            groupEnd.style.display = 'block';
            document.getElementById('cert-end').required = true;
        }
    });

    // Lógica de Upload de Imagem (Base64)
    const fileInput = document.getElementById('cert-file');
    const trigger = document.getElementById('upload-trigger');
    const preview = document.getElementById('cert-preview');
    let imageBase64 = null;

    trigger.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                imageBase64 = reader.result;
                preview.src = imageBase64;
                preview.style.display = 'block';
                trigger.style.display = 'none';
            };
            // Tenta ler. Se for muito grande, o LocalStorage pode falhar depois, 
            // mas para demo ok.
            reader.readAsDataURL(file);
        }
    });

    // Submit
    document.getElementById('cert-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newCert = {
            id: Date.now(),
            title: document.getElementById('cert-title').value,
            institution: document.getElementById('cert-inst').value,
            hours: parseInt(document.getElementById('cert-hours').value),
            isSingleDay: checkSingle.checked,
            startDate: document.getElementById('cert-start').value,
            endDate: checkSingle.checked ? null : document.getElementById('cert-end').value,
            image: imageBase64,
            status: 'approved' // Simulação de aprovação imediata
        };

        saveCertificate(newCert);
    });

    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

function saveCertificate(cert) {
    try {
        certificates.unshift(cert); // Adiciona no início
        localStorage.setItem('opencampus_certificates', JSON.stringify(certificates));
        
        alert("Certificado enviado e aprovado com sucesso!");
        closeModal();
        loadCertificates(); // Atualiza a lista
        renderProfile();    // Atualiza o card da esquerda (gráfico e lista)
    } catch (e) {
        alert("Erro ao salvar! A imagem pode ser muito grande para o navegador.");
        console.error(e);
    }
}

// --- MODAL DE DETALHES ---
function openDetailsModal(cert) {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = CertificateDetailsModal(cert);
    requestAnimationFrame(() => overlay.classList.add('active'));

    document.getElementById('btn-modal-close').addEventListener('click', closeModal);
    document.getElementById('btn-modal-close-action').addEventListener('click', closeModal);
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.classList.remove('active');
    setTimeout(() => overlay.innerHTML = '', 300);
}

function setupPageEvents() {
    document.getElementById('btn-add-cert').addEventListener('click', openFormModal);
}

// Utils (Menu/Theme) - Copiados dos outros arquivos
function setupEventListeners() {
    const btnMenu = document.getElementById('btn-menu-toggle');
    const overlay = document.getElementById('overlay');
    if(btnMenu) btnMenu.addEventListener('click', toggleMenu);
    if(overlay) overlay.addEventListener('click', toggleMenu);
    document.getElementById('btn-close-sidebar').addEventListener('click', toggleMenu);

    const btnThemeHeader = document.getElementById('header-theme-btn');
    if(btnThemeHeader) btnThemeHeader.addEventListener('click', toggleTheme);

    const btnThemeSidebar = document.getElementById('sidebar-theme-btn');
    if(btnThemeSidebar) btnThemeSidebar.addEventListener('click', () => {
        toggleTheme();
        toggleMenu();
    });
}

function setupProfileEvents() {
    const profileCard = document.getElementById('profile-card-component');
    if (profileCard) {
        profileCard.addEventListener('click', () => {
            if (window.innerWidth <= 1024) profileCard.classList.toggle('expanded');
        });
    }
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
    updateThemeIcon(newTheme);
}

function loadTheme() {
    const saved = localStorage.getItem('opencampus-theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
        updateThemeIcon(saved);
    }
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
    const iconHeader = document.getElementById('theme-icon-header');
    if (iconHeader) iconHeader.className = iconClass;
    const iconSidebar = document.getElementById('theme-icon-sidebar');
    if (iconSidebar) iconSidebar.className = iconClass;
}

document.addEventListener('DOMContentLoaded', init);