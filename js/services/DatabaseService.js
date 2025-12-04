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
        // Verifica se já temos projetos no banco local
        if (!localStorage.getItem(DB_KEYS.PROJECTS)) {
            console.log('⚡ Inicializando banco de dados...');
            try {
                // Tenta ajustar o caminho dependendo de onde o script é chamado
                // Se estamos em /aluno/, o json está em ../data/
                // Se estamos na raiz, está em ./data/
                const path = window.location.pathname.includes('/aluno/') || window.location.pathname.includes('/professor/') 
                    ? '../data/projects.json' 
                    : './data/projects.json';

                const response = await fetch(path);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const projects = await response.json();
                
                // Salva no LocalStorage
                localStorage.setItem(DB_KEYS.PROJECTS, JSON.stringify(projects));
                console.log('✅ Banco de dados inicializado com sucesso.');
            } catch (error) {
                console.error('Erro ao buscar JSON inicial:', error);
                // Fallback para evitar quebrar a tela
                localStorage.setItem(DB_KEYS.PROJECTS, JSON.stringify([]));
            }
        }
    },

    // --- PROJETOS ---
    getAllProjects() {
        const data = localStorage.getItem(DB_KEYS.PROJECTS);
        return data ? JSON.parse(data) : [];
    },

    getProjectById(id) {
        return this.getAllProjects().find(p => p.id === id);
    },

    // --- USUÁRIO (CONTEXTO) ---
    getCurrentUser() {
        return JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER));
    },

    login(user) {
        localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
    },

    logout() {
        localStorage.removeItem(DB_KEYS.CURRENT_USER);
    },

    // --- INSCRIÇÕES ---
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
    
    // --- CERTIFICADOS ---
    getCertificates() {
        return JSON.parse(localStorage.getItem(DB_KEYS.CERTIFICATES)) || [];
    }
};