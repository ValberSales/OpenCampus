import { HeaderComponent } from '../components/Header.js';
import { SidebarComponent } from '../components/Sidebar.js';
import { ProfileCardComponent } from '../components/ProfileCard.js';
import { FooterComponent } from '../components/Footer.js';
import { CertificateCardComponent } from '../components/CertificateCard.js';
import { CertificateFormModal, CertificateDetailsModal } from '../components/CertificateModal.js';
import { BadgeModalComponent } from '../components/BadgeModal.js';

let certificates = [];

async function init() {
    document.getElementById('app-header').innerHTML = HeaderComponent('certificates');
    document.getElementById('app-sidebar-mobile').innerHTML = SidebarComponent('certificates');
    
    renderProfile();
    document.getElementById('app-footer').innerHTML = FooterComponent();

    loadCertificates();
    setupEventListeners();
    setupPageEvents();
    setupProfileEvents(); 
    setupProfileCertClicks(); // <--- IMPORTANTE: Conecta o clique lateral
    setupBadgeEvents();
    loadTheme();
}

function renderProfile() {
    document.getElementById('profile-container').innerHTML = ProfileCardComponent();
}

function loadCertificates() {
    certificates = JSON.parse(localStorage.getItem('opencampus_certificates')) || [];
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
        const btnEmpty = document.getElementById('btn-empty-add');
        if(btnEmpty) btnEmpty.addEventListener('click', openFormModal);
        return;
    }

    container.innerHTML = certificates.map(c => CertificateCardComponent(c)).join('');
    
    // Click na lista principal
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

    document.getElementById('btn-close-form').addEventListener('click', closeModal);
    document.getElementById('btn-cancel-form').addEventListener('click', closeModal);

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
            reader.readAsDataURL(file);
        }
    });

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
            status: 'approved' 
        };

        saveCertificate(newCert);
    });

    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

function saveCertificate(cert) {
    try {
        certificates.unshift(cert);
        localStorage.setItem('opencampus_certificates', JSON.stringify(certificates));
        
        alert("Certificado enviado e aprovado com sucesso!");
        closeModal();
        loadCertificates(); 
        renderProfile();    
        // Re-conecta os eventos do perfil após renderizar novamente
        setupProfileCertClicks();
        setupProfileEvents();
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

    const btnClose = document.getElementById('btn-modal-close');
    const btnAction = document.getElementById('btn-modal-close-action');
    
    if(btnClose) btnClose.addEventListener('click', closeModal);
    if(btnAction) btnAction.addEventListener('click', closeModal);
    
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

// --- EVENTOS ---
function setupPageEvents() {
    const btnAdd = document.getElementById('btn-add-cert');
    if(btnAdd) btnAdd.addEventListener('click', openFormModal);
}

function setupProfileCertClicks() {
    const certItems = document.querySelectorAll('.profile-card .cert-item');
    
    certItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(item.dataset.id);
            // Recarrega do storage para garantir dados frescos
            const savedCerts = JSON.parse(localStorage.getItem('opencampus_certificates')) || [];
            const cert = savedCerts.find(c => c.id === id);
            
            if (cert) {
                openDetailsModal(cert);
            }
        });
    });
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.classList.remove('active');
    setTimeout(() => overlay.innerHTML = '', 300);
}

// Utils (Menu/Theme)
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

function setupBadgeEvents() {
    const badges = document.querySelectorAll('.trophy-trigger');
    
    badges.forEach(badge => {
        badge.addEventListener('click', (e) => {
            e.stopPropagation(); // Evita expandir perfil no mobile
            const level = badge.dataset.level;
            openBadgeModal(level);
        });
    });
}

function openBadgeModal(level) {
    const overlay = document.getElementById('modal-overlay-container');
    overlay.innerHTML = BadgeModalComponent(level);
    requestAnimationFrame(() => overlay.classList.add('active'));

    const btnClose = document.getElementById('btn-modal-close');
    const btnAction = document.getElementById('btn-modal-close-action');
    
    if(btnClose) btnClose.addEventListener('click', closeModal);
    if(btnAction) btnAction.addEventListener('click', closeModal);
    
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
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
    const iconClass = theme === 'dark' ? 'ph ph-sun' : 'ph ph-moon';
    const iconHeader = document.getElementById('theme-icon-header');
    if (iconHeader) iconHeader.className = iconClass;
    const iconSidebar = document.getElementById('theme-icon-sidebar');
    if (iconSidebar) iconSidebar.className = iconClass;
}

document.addEventListener('DOMContentLoaded', init);