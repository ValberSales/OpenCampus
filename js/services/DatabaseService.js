// js/services/DatabaseService.js

const DB_KEYS = {
    PROJECTS: 'opencampus_projects',
    USERS: 'opencampus_users',
    CERTIFICATES: 'opencampus_certificates',
    CONVERSATIONS: 'opencampus_conversations',
    SUBSCRIPTIONS: 'opencampus_subscriptions',
    CURRENT_USER: 'opencampus_current_user'
};

export const DatabaseService = {
    
    // --- INICIALIZAÇÃO (SEED) ---
    async init() {
        if (!localStorage.getItem(DB_KEYS.PROJECTS)) {
            console.log('⚡ Inicializando banco de dados...');
            try {
                // DETECÇÃO DE CAMINHO AJUSTADA PARA A PASTA 'PAGES'
                let path = './data/projects.json'; // Padrão (raiz)
                
                // Se estiver dentro de pages/aluno/ ou pages/professor/
                if (window.location.pathname.includes('/pages/')) {
                    path = '../../data/projects.json';
                } 
                // Fallback: se estiver só em /aluno/ (caso mova depois)
                else if (window.location.pathname.includes('/aluno/')) {
                    path = '../data/projects.json';
                }

                const response = await fetch(path);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const projects = await response.json();
                localStorage.setItem(DB_KEYS.PROJECTS, JSON.stringify(projects));
                console.log('✅ Banco de dados inicializado.');
            } catch (error) {
                console.error('Erro ao buscar JSON inicial:', error);
                localStorage.setItem(DB_KEYS.PROJECTS, JSON.stringify([]));
            }
        }
    },

    // ... (MANTENHA O RESTANTE DO ARQUIVO IGUAL: getAllProjects, getCurrentUser, etc.)
    getAllProjects() {
        const data = localStorage.getItem(DB_KEYS.PROJECTS);
        return data ? JSON.parse(data) : [];
    },

    getProjectById(id) {
        return this.getAllProjects().find(p => p.id === id);
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER));
    },

    login(user) {
        localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
    },

    logout() {
        localStorage.removeItem(DB_KEYS.CURRENT_USER);
    },

    getSubscriptions() {
        return JSON.parse(localStorage.getItem(DB_KEYS.SUBSCRIPTIONS)) || [];
    },

    toggleSubscription(projectId) {
        let subs = this.getSubscriptions();
        if (subs.includes(projectId)) {
            subs = subs.filter(id => id !== projectId);
        } else {
            subs.push(projectId);
        }
        localStorage.setItem(DB_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
        return subs;
    },
    
    getCertificates() {
        return JSON.parse(localStorage.getItem(DB_KEYS.CERTIFICATES)) || [];
    }
};