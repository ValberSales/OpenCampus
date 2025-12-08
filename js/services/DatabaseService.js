const DB_KEYS = {
    PROJECTS: 'opencampus_projects',
    USERS: 'opencampus_users',
    CERTIFICATES: 'opencampus_certificates',
    CONVERSATIONS: 'opencampus_conversations',
    SUBSCRIPTIONS: 'opencampus_subscriptions',
    CURRENT_USER: 'opencampus_current_user',
    COMMUNITY_REQUESTS: 'opencampus_community_requests',
    PARTNERSHIP_REQUESTS: 'opencampus_partnership_requests'
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
                // Fallback
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

    // --- PROJETOS ---
    getAllProjects() {
        const data = localStorage.getItem(DB_KEYS.PROJECTS);
        return data ? JSON.parse(data) : [];
    },

    getProjectById(id) {
        return this.getAllProjects().find(p => p.id === id);
    },

    // --- USUÁRIO ---
    getCurrentUser() {
        return JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER));
    },

    login(user) {
        localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
    },

    logout() {
        localStorage.removeItem(DB_KEYS.CURRENT_USER);
    },

    // --- INSCRIÇÕES ALUNO ---
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
    },

    saveCertificate(cert) {
        const list = this.getCertificates();
        list.unshift(cert);
        localStorage.setItem(DB_KEYS.CERTIFICATES, JSON.stringify(list));
        return true;
    },

    // --- COMUNIDADE ---
    saveCommunityApplication(application) {
        const apps = JSON.parse(localStorage.getItem(DB_KEYS.COMMUNITY_REQUESTS)) || [];
        application.id = Date.now();
        application.status = 'pending'; 
        application.date = new Date().toISOString();
        
        apps.push(application);
        localStorage.setItem(DB_KEYS.COMMUNITY_REQUESTS, JSON.stringify(apps));
        console.log("✅ Inscrição da comunidade salva:", application);
        return true;
    },

    savePartnershipRequest(request) {
        const reqs = JSON.parse(localStorage.getItem(DB_KEYS.PARTNERSHIP_REQUESTS)) || [];
        request.id = Date.now();
        request.date = new Date().toISOString();
        
        reqs.push(request);
        localStorage.setItem(DB_KEYS.PARTNERSHIP_REQUESTS, JSON.stringify(reqs));
        console.log("✅ Solicitação de parceria salva:", request);
        return true;
    },

    getProjectClasses(projectId) {
        const key = 'opencampus_classes';
        const allClasses = JSON.parse(localStorage.getItem(key)) || [];
        // Filtra aulas deste projeto e ordena por data (mais recente primeiro)
        return allClasses
            .filter(c => c.projectId === projectId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    saveProjectClass(classData) {
        const key = 'opencampus_classes';
        let allClasses = JSON.parse(localStorage.getItem(key)) || [];
        
        if (classData.id) {
            // Edição
            const index = allClasses.findIndex(c => c.id === classData.id);
            if (index !== -1) allClasses[index] = classData;
        } else {
            // Criação
            classData.id = Date.now();
            allClasses.push(classData);
        }
        
        localStorage.setItem(key, JSON.stringify(allClasses));
        return true;
    }
};