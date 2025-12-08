const DB_KEYS = {
    PROJECTS: 'opencampus_projects',
    USERS: 'opencampus_users',
    ENROLLMENTS: 'opencampus_enrollments',
    CERTIFICATES: 'opencampus_certificates',
    CONVERSATIONS: 'opencampus_conversations',
    CURRENT_USER: 'opencampus_current_user',
    COMMUNITY_REQUESTS: 'opencampus_community_requests',
    PARTNERSHIP_REQUESTS: 'opencampus_partnership_requests',
    CLASSES: 'opencampus_classes'
};

export const DatabaseService = {
    
    // --- INICIALIZAÇÃO ---
    async init() {
        let basePath = './data/';
        if (window.location.pathname.includes('/pages/')) {
            basePath = '../../data/';
        } else if (window.location.pathname.includes('/aluno/') || window.location.pathname.includes('/professor/')) {
            basePath = '../data/';
        }

        // Carrega USERS
        if (!localStorage.getItem(DB_KEYS.USERS)) {
            try {
                const res = await fetch(`${basePath}users.json`);
                const users = await res.json();
                localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
            } catch (e) { console.error('Erro ao carregar users:', e); }
        }

        // Carrega PROJECTS
        if (!localStorage.getItem(DB_KEYS.PROJECTS)) {
            try {
                const res = await fetch(`${basePath}projects.json`);
                const projects = await res.json();
                localStorage.setItem(DB_KEYS.PROJECTS, JSON.stringify(projects));
            } catch (e) { console.error('Erro ao carregar projects:', e); }
        }

        // Inicializa ENROLLMENTS vazio
        if (!localStorage.getItem(DB_KEYS.ENROLLMENTS)) {
            localStorage.setItem(DB_KEYS.ENROLLMENTS, JSON.stringify([]));
        }
    },

    // --- QUERY ---
    getAllProjects() {
        const projects = JSON.parse(localStorage.getItem(DB_KEYS.PROJECTS)) || [];
        const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];

        // Join manual para trazer dados do professor
        return projects.map(p => {
            const prof = users.find(u => u.id === p.professorId) || { name: "Desconhecido", avatar: "", email: "" };
            return {
                ...p,
                professor: {
                    id: prof.id,
                    name: prof.name,
                    email: prof.email,
                    avatar: prof.avatar
                }
            };
        });
    },

    getProjectById(id) {
        return this.getAllProjects().find(p => p.id === id);
    },

    // --- AUTH ---
    getCurrentUser() {
        return JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER));
    },

    login(credentials) {
        const allUsers = JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
        
        // CORREÇÃO: Comparação Flexível
        // Verifica se o nome digitado está contido no nome do banco (ex: "Ana" em "Dra. Ana Souza")
        // E verifica se a role (papel) é a mesma (professor ou student)
        let user = allUsers.find(u => 
            u.name.toLowerCase().includes(credentials.name.toLowerCase()) && 
            u.role === credentials.role
        );

        // Se não achar e for aluno, cadastra automaticamente (Simulação)
        if (!user && credentials.role === 'student') {
            user = {
                id: Date.now(),
                name: credentials.name,
                role: 'student',
                course: credentials.course,
                avatar: credentials.avatar
            };
            allUsers.push(user);
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(allUsers));
        }

        // Se não achar e for professor, bloqueia
        if (!user && credentials.role === 'professor') {
            alert("Professor não encontrado. Verifique se o nome corresponde ao cadastro (ex: 'Ana Souza' ou 'Carlos Mendez').");
            return false;
        }

        // Salva sessão
        localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
        return true; 
    },

    logout() {
        localStorage.removeItem(DB_KEYS.CURRENT_USER);
    },

    // --- ENROLLMENTS (Inscrições) ---
    getSubscriptions() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return [];
        const enrollments = JSON.parse(localStorage.getItem(DB_KEYS.ENROLLMENTS)) || [];
        return enrollments.filter(e => e.userId === currentUser.id).map(e => e.projectId);
    },

    toggleSubscription(projectId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return;
        let enrollments = JSON.parse(localStorage.getItem(DB_KEYS.ENROLLMENTS)) || [];
        const existingIndex = enrollments.findIndex(e => e.userId === currentUser.id && e.projectId === projectId);

        if (existingIndex !== -1) {
            enrollments.splice(existingIndex, 1);
        } else {
            enrollments.push({
                id: Date.now(),
                userId: currentUser.id,
                projectId: projectId,
                date: new Date().toISOString(),
                status: 'active'
            });
        }
        localStorage.setItem(DB_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
    },
    
    // --- CERTIFICADOS ---
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
        apps.push(application);
        localStorage.setItem(DB_KEYS.COMMUNITY_REQUESTS, JSON.stringify(apps));
        return true;
    },
    savePartnershipRequest(request) {
        const reqs = JSON.parse(localStorage.getItem(DB_KEYS.PARTNERSHIP_REQUESTS)) || [];
        request.id = Date.now();
        reqs.push(request);
        localStorage.setItem(DB_KEYS.PARTNERSHIP_REQUESTS, JSON.stringify(reqs));
        return true;
    },

    // --- DIÁRIO DE CLASSE ---
    getProjectClasses(projectId) {
        const allClasses = JSON.parse(localStorage.getItem(DB_KEYS.CLASSES)) || [];
        return allClasses.filter(c => c.projectId === projectId).sort((a, b) => new Date(b.date) - new Date(a.date));
    },
    saveProjectClass(classData) {
        const key = DB_KEYS.CLASSES;
        let allClasses = JSON.parse(localStorage.getItem(key)) || [];
        if (classData.id) {
            const index = allClasses.findIndex(c => c.id === classData.id);
            if (index !== -1) allClasses[index] = classData;
        } else {
            classData.id = Date.now();
            allClasses.push(classData);
        }
        localStorage.setItem(key, JSON.stringify(allClasses));
        return true;
    }
};