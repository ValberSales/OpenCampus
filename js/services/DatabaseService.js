// js/services/DatabaseService.js

const DB_KEYS = {
    PROJECTS: 'opencampus_projects',
    USERS: 'opencampus_users',
    ENROLLMENTS: 'opencampus_enrollments',
    CERTIFICATES: 'opencampus_certificates',
    CONVERSATIONS: 'opencampus_conversations', // Aluno
    PROF_CONVERSATIONS: 'opencampus_prof_conversations', // Professor (NOVO)
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

        // Carrega ENROLLMENTS
        if (!localStorage.getItem(DB_KEYS.ENROLLMENTS)) {
            try {
                const res = await fetch(`${basePath}enrollments.json`);
                if(res.ok) {
                    const enrollments = await res.json();
                    localStorage.setItem(DB_KEYS.ENROLLMENTS, JSON.stringify(enrollments));
                } else {
                    localStorage.setItem(DB_KEYS.ENROLLMENTS, JSON.stringify([]));
                }
            } catch (e) { 
                console.error('Erro ao carregar enrollments:', e);
                localStorage.setItem(DB_KEYS.ENROLLMENTS, JSON.stringify([]));
            }
        }
    },

    // --- QUERY ---
    getAllProjects() {
        const projects = JSON.parse(localStorage.getItem(DB_KEYS.PROJECTS)) || [];
        const users = JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];

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

    createProject(projectData) {
        try {
            const rawProjects = JSON.parse(localStorage.getItem(DB_KEYS.PROJECTS)) || [];
            const newId = rawProjects.length > 0 ? Math.max(...rawProjects.map(p => p.id)) + 1 : 1;
            const currentUser = this.getCurrentUser();
            
            if (!currentUser) {
                alert("Erro: Você precisa estar logado para criar um projeto.");
                return false;
            }

            const newProject = {
                id: newId,
                professorId: currentUser.id,
                title: projectData.title,
                description: projectData.description,
                image: projectData.image,
                date: projectData.date,
                location: projectData.location,
                hours: projectData.hours,
                tags: projectData.tags,
                openToCommunity: projectData.openToCommunity,
                shifts: ["Matutino"],
                vacancies: {
                    students: { 
                        total: parseInt(projectData.vacancies.students), 
                        available: parseInt(projectData.vacancies.students) 
                    },
                    community: { 
                        total: parseInt(projectData.vacancies.community), 
                        available: parseInt(projectData.vacancies.community) 
                    }
                }
            };

            rawProjects.push(newProject);
            localStorage.setItem(DB_KEYS.PROJECTS, JSON.stringify(rawProjects));
            return true;

        } catch (e) {
            console.error("Erro ao salvar projeto:", e);
            alert("Ocorreu um erro ao salvar o projeto.");
            return false;
        }
    },
    
    getUsers() {
        return JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER));
    },

    login(credentials) {
        const allUsers = JSON.parse(localStorage.getItem(DB_KEYS.USERS)) || [];
        let user = allUsers.find(u => 
            u.name.toLowerCase().includes(credentials.name.toLowerCase()) && 
            u.role === credentials.role
        );

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

        if (!user && credentials.role === 'professor') {
            alert("Professor não encontrado. Tente 'Dr. Ana Souza' ou verifique users.json");
            return false;
        }

        localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
        return true; 
    },

    logout() {
        localStorage.removeItem(DB_KEYS.CURRENT_USER);
    },

    // --- ENROLLMENTS ---
    getSubscriptions() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return [];
        const enrollments = JSON.parse(localStorage.getItem(DB_KEYS.ENROLLMENTS)) || [];
        return enrollments.filter(e => e.userId === currentUser.id).map(e => e.projectId);
    },

    getProjectStudents(projectId) {
        const enrollments = JSON.parse(localStorage.getItem(DB_KEYS.ENROLLMENTS)) || [];
        const users = this.getUsers();
        const projectEnrollments = enrollments.filter(e => e.projectId === projectId);
        
        return projectEnrollments.map(e => {
            return users.find(u => u.id === e.userId);
        }).filter(u => u !== undefined);
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
    
    // --- CONVERSATIONS (STUDENT) ---
    getStudentConversations() {
        return JSON.parse(localStorage.getItem(DB_KEYS.CONVERSATIONS)) || [];
    },

    deleteStudentConversation(projectId) {
        let conversations = this.getStudentConversations();
        conversations = conversations.filter(c => c.projectId !== projectId);
        localStorage.setItem(DB_KEYS.CONVERSATIONS, JSON.stringify(conversations));
        return conversations;
    },

    // --- CONVERSATIONS (PROFESSOR) ---
    // Métodos novos adicionados para o professor
    getProfessorConversations() {
        return JSON.parse(localStorage.getItem(DB_KEYS.PROF_CONVERSATIONS)) || [];
    },

    deleteProfessorConversation(id) {
        let conversations = this.getProfessorConversations();
        conversations = conversations.filter(c => c.id !== id);
        localStorage.setItem(DB_KEYS.PROF_CONVERSATIONS, JSON.stringify(conversations));
        return conversations;
    },

    // --- OUTROS ---
    getCertificates() { return JSON.parse(localStorage.getItem(DB_KEYS.CERTIFICATES)) || []; },
    saveCertificate(cert) { 
        const certs = this.getCertificates();
        certs.unshift(cert);
        localStorage.setItem(DB_KEYS.CERTIFICATES, JSON.stringify(certs));
        return true; 
    },
    saveCommunityApplication(application) { 
        const apps = JSON.parse(localStorage.getItem(DB_KEYS.COMMUNITY_REQUESTS)) || [];
        application.status = 'pending';
        apps.push(application);
        localStorage.setItem(DB_KEYS.COMMUNITY_REQUESTS, JSON.stringify(apps));
        return true; 
    },
    savePartnershipRequest(request) { 
        const reqs = JSON.parse(localStorage.getItem(DB_KEYS.PARTNERSHIP_REQUESTS)) || [];
        reqs.push(request);
        localStorage.setItem(DB_KEYS.PARTNERSHIP_REQUESTS, JSON.stringify(reqs));
        return true; 
    },
    
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