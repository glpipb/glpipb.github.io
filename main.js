// =================================================================================
// === MAIN.JS - EL CEREBRO ÚNICO DE TODA LA APLICACIÓN TECHCONTROL ===
// =================================================================================

// --- 1. IMPORTACIONES Y CONFIGURACIÓN DE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyA5rVhtkVDeJPY0bEnLjk-_LMVN3d5pkIo",
  authDomain: "glpi-tecnologia.firebaseapp.com",
  projectId: "glpi-tecnologia",
  storageBucket: "glpi-tecnologia.firebasestorage.app",
  messagingSenderId: "195664374847",
  appId: "1:195664374847:web:88412be75b4ff8600adc8a",
  measurementId: "G-QJD3VS1V5Y"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const appContainer = document.getElementById('app-container');

// --- 2. PLANTILLAS HTML PARA CADA PÁGINA ---
// Guardamos el HTML de cada sección como una "plantilla de texto"
const templates = {
    dashboard: `
        <header class="main-header">
            <div class="breadcrumbs"><i class="fa-solid fa-house"></i> / <span>Activos</span></div>
            <div class="header-actions">
                <div class="search-bar"><input type="text" placeholder="Buscar..."><i class="fa-solid fa-magnifying-glass"></i></div>
                <div class="user-profile"><span>Super-Admin</span><div class="user-initials">JC</div></div>
            </div>
        </header>
        <section class="dashboard-controls"><div class="control-title"><h2>Activos</h2></div></section>
        <section class="dashboard-grid">
            <div class="card"><div class="card-content"><span class="card-number" id="total-computadoras">0</span><p class="card-title">Computadoras</p></div><i class="fa-solid fa-laptop card-icon"></i></div>
            <div class="card"><div class="card-content"><span class="card-number" id="total-monitores">0</span><p class="card-title">Monitores</p></div><i class="fa-solid fa-desktop card-icon"></i></div>
            <div class="card"><div class="card-content"><span class="card-number" id="total-telefonos">0</span><p class="card-title">Teléfonos</p></div><i class="fa-solid fa-phone card-icon"></i></div>
            <div class="card"><div class="card-content"><span class="card-number" id="total-impresoras">0</span><p class="card-title">Impresoras</p></div><i class="fa-solid fa-print card-icon"></i></div>
            <div class="card"><div class="card-content"><span class="card-number" id="total-dispositivos-red">0</span><p class="card-title">Dispositivos de red</p></div><i class="fa-solid fa-network-wired card-icon"></i></div>
            <div class="card"><div class="card-content"><span class="card-number" id="total-licencias">0</span><p class="card-title">Licencias</p></div><i class="fa-solid fa-key card-icon"></i></div>
            <div class="card chart-card"><h3>Computadoras por Marca</h3><canvas id="computadoras-chart"></canvas></div>
            <div class="card chart-card"><h3>Tickets por Estado</h3><canvas id="tickets-chart"></canvas></div>
        </section>
    `,
    tickets: `
        <header class="main-header">
            <div class="breadcrumbs"><i class="fa-solid fa-house"></i> / <span>Tickets</span></div>
            <div class="header-actions"><div class="search-bar"><input type="text" placeholder="Buscar ticket..."><i class="fa-solid fa-magnifying-glass"></i></div><div class="user-profile"><span>Super-Admin</span><div class="user-initials">JC</div></div></div>
        </header>
        <section class="dashboard-controls"><div class="control-title"><h2>Gestión de Tickets</h2><button class="add-button" id="open-modal-btn">+</button></div></section>
        <section class="content-area"><div class="card data-table-card"><table class="data-table"><thead><tr><th>Título</th><th>Usuario</th><th>Prioridad</th><th>Estado</th><th>Fecha de Creación</th></tr></thead><tbody id="tickets-table-body"></tbody></table></div></section>
        <div id="modal-container"></div>
    `,
    mantenimiento: `
        <header class="main-header">
            <div class="breadcrumbs"><i class="fa-solid fa-house"></i> / <span>Mantenimiento</span></div>
            <div class="header-actions"><div class="search-bar"><input type="text" placeholder="Buscar tarea..."><i class="fa-solid fa-magnifying-glass"></i></div><div class="user-profile"><span>Super-Admin</span><div class="user-initials">JC</div></div></div>
        </header>
        <section class="dashboard-controls"><div class="control-title"><h2>Plan de Mantenimiento</h2><button class="add-button" id="open-modal-btn">+</button></div></section>
        <section class="content-area"><div class="card data-table-card"><table class="data-table"><thead><tr><th>Activo</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th>Descripción</th></tr></thead><tbody id="maintenance-table-body"></tbody></table></div></section>
        <div id="modal-container"></div>
    `,
    kb: `
        <header class="main-header">
            <div class="breadcrumbs"><i class="fa-solid fa-house"></i> / <span>Base de Conocimiento</span></div>
            <div class="header-actions"><div class="search-bar"><input type="text" placeholder="Buscar nota..."><i class="fa-solid fa-magnifying-glass"></i></div><div class="user-profile"><span>Super-Admin</span><div class="user-initials">JC</div></div></div>
        </header>
        <section class="dashboard-controls"><div class="control-title"><h2>Notas Seguras</h2><button class="add-button" id="open-modal-btn">+</button></div></section>
        <section class="kb-grid" id="kb-grid-container"></section>
        <div id="modal-container"></div>
    `
};

// --- 3. LÓGICA ESPECÍFICA PARA CADA PÁGINA ---
const pageLogic = {
    // ---- LÓGICA DEL DASHBOARD ----
    dashboard: async () => {
        const activosSnap = await getDocs(collection(db, "activos"));
        const contadores = { 'Computadoras': 0, 'Monitores': 0, 'Telefonos': 0, 'Impresoras': 0, 'Dispositivos de red': 0, 'Licencias': 0 };
        const marcasComputadoras = {};
        activosSnap.forEach(doc => {
            const activo = doc.data();
            if (activo.tipo && contadores.hasOwnProperty(activo.tipo)) contadores[activo.tipo]++;
            if (activo.tipo === 'Computadoras' && activo.marca) marcasComputadoras[activo.marca] = (marcasComputadoras[activo.marca] || 0) + 1;
        });
        Object.keys(contadores).forEach(key => {
            const element = document.getElementById(`total-${key.toLowerCase().replace(/ /g, '-')}`);
            if (element) element.textContent = contadores[key];
        });
        const ticketsSnap = await getDocs(collection(db, "tickets"));
        const estadosTickets = { 'Abierto': 0, 'Cerrado': 0 };
        ticketsSnap.forEach(doc => { const t = doc.data(); if(t.estado) estadosTickets[t.estado]++; });
        renderizarGrafico('computadoras-chart', 'pie', Object.keys(marcasComputadoras), Object.values(marcasComputadoras), 'Computadoras por Marca');
        renderizarGrafico('tickets-chart', 'doughnut', Object.keys(estadosTickets), Object.values(estadosTickets), 'Tickets por Estado');
    },

    // ---- LÓGICA DE TICKETS ----
    tickets: async () => {
        renderModal('tickets');
        const cargar = async () => {
            const tbody = document.getElementById('tickets-table-body');
            tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
            const q = query(collection(db, "tickets"), orderBy("fechaCreacion", "desc"));
            const snap = await getDocs(q);
            tbody.innerHTML = snap.empty ? '<tr><td colspan="5">No hay tickets. 🎉</td></tr>' : snap.docs.map(doc => {
                const t = doc.data(), fecha = t.fechaCreacion ? new Date(t.fechaCreacion.seconds * 1000).toLocaleString() : 'N/A';
                return `<tr><td>${t.titulo}</td><td>${t.usuario}</td><td class="priority-${t.prioridad.toLowerCase()}">${t.prioridad}</td><td class="status-${t.estado.toLowerCase()}">${t.estado}</td><td>${fecha}</td></tr>`;
            }).join('');
        };
        await cargar();
        document.getElementById('add-form').addEventListener('submit', async e => {
            e.preventDefault(); const form = e.target;
            await addDoc(collection(db, 'tickets'), { titulo: form['field1'].value, usuario: form['field2'].value, prioridad: form['field3'].value, estado: 'Abierto', fechaCreacion: serverTimestamp() });
            closeModal(); await cargar();
        });
    },

    // ---- LÓGICA DE MANTENIMIENTO ----
    mantenimiento: async () => {
        renderModal('mantenimiento');
        const cargar = async () => {
            const tbody = document.getElementById('maintenance-table-body');
            tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
            const q = query(collection(db, "mantenimientos"), orderBy("fechaProgramada", "asc"));
            const snap = await getDocs(q);
            tbody.innerHTML = snap.empty ? '<tr><td colspan="5">No hay tareas programadas.</td></tr>' : snap.docs.map(doc => {
                const t = doc.data(), fecha = t.fechaProgramada ? new Date(t.fechaProgramada.seconds * 1000).toLocaleDateString() : 'N/A';
                return `<tr><td>${t.activo}</td><td>${t.tipo}</td><td>${fecha}</td><td class="status-${t.estado.toLowerCase()}">${t.estado}</td><td>${t.descripcion}</td></tr>`;
            }).join('');
        };
        await cargar();
        document.getElementById('add-form').addEventListener('submit', async e => {
            e.preventDefault(); const form = e.target;
            await addDoc(collection(db, 'mantenimientos'), { activo: form['field1'].value, tipo: form['field2'].value, fechaProgramada: new Date(form['field3'].value), descripcion: form['field4'].value, estado: 'Pendiente', fechaCreacion: serverTimestamp() });
            closeModal(); await cargar();
        });
    },

    // ---- LÓGICA DE BASE DE CONOCIMIENTO ----
    kb: async () => {
        renderModal('kb');
        const cargar = async () => {
            const grid = document.getElementById('kb-grid-container');
            grid.innerHTML = '<p>Cargando notas...</p>';
            const q = query(collection(db, "conocimiento"), orderBy("fechaCreacion", "desc"));
            const snap = await getDocs(q);
            grid.innerHTML = snap.empty ? '<p>No hay notas guardadas.</p>' : snap.docs.map(doc => {
                const n = doc.data();
                return `<div class="card kb-card"><h3>${n.titulo}</h3><span class="category">${n.categoria}</span><div class="content">${n.contenido}</div></div>`;
            }).join('');
        };
        await cargar();
        document.getElementById('add-form').addEventListener('submit', async e => {
            e.preventDefault(); const form = e.target;
            await addDoc(collection(db, 'conocimiento'), { titulo: form['field1'].value, categoria: form['field2'].value, contenido: form['field3'].value, fechaCreacion: serverTimestamp() });
            closeModal(); await cargar();
        });
    },
};

// --- 4. HELPERS Y FUNCIONES GLOBALES (Modales, Gráficos) ---
const modalTemplates = {
    tickets: { title: 'Nuevo Ticket', fields: [ {label: 'Título', id: 'field1', type: 'text'}, {label: 'Usuario', id: 'field2', type: 'text'}, {label: 'Prioridad', id: 'field3', type: 'select', options: ['Baja', 'Media', 'Alta']} ] },
    mantenimiento: { title: 'Programar Mantenimiento', fields: [ {label: 'Activo Afectado', id: 'field1', type: 'text'}, {label: 'Tipo', id: 'field2', type: 'select', options: ['Preventivo', 'Correctivo']}, {label: 'Fecha', id: 'field3', type: 'date'}, {label: 'Descripción', id: 'field4', type: 'textarea'} ] },
    kb: { title: 'Nueva Nota', fields: [ {label: 'Título', id: 'field1', type: 'text'}, {label: 'Categoría', id: 'field2', type: 'text'}, {label: 'Contenido', id: 'field3', type: 'textarea'} ] }
};
function renderModal(type) {
    const template = modalTemplates[type];
    const fieldsHTML = template.fields.map(f => {
        if (f.type === 'select') return `<div class="form-group"><label>${f.label}</label><select id="${f.id}">${f.options.map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>`;
        if (f.type === 'textarea') return `<div class="form-group"><label>${f.label}</label><textarea id="${f.id}" rows="4"></textarea></div>`;
        return `<div class="form-group"><label>${f.label}</label><input type="${f.type}" id="${f.id}"></div>`;
    }).join('');
    document.getElementById('modal-container').innerHTML = `
        <div id="modal" class="modal"><div class="modal-content"><span class="close-btn">×</span><h2>${template.title}</h2>
        <form id="add-form">${fieldsHTML}<button type="submit" class="submit-btn">Guardar</button></form></div></div>`;
    document.getElementById('open-modal-btn').onclick = () => document.getElementById('modal').style.display = 'block';
    document.querySelector('.close-btn').onclick = closeModal;
}
function closeModal() { document.getElementById('modal').style.display = 'none'; }
let charts = {};
function renderizarGrafico(id, tipo, labels, data, titulo) {
    const ctx = document.getElementById(id); if (!ctx) return;
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(ctx, { type: tipo, data: { labels, datasets: [{ label: titulo, data, borderWidth: 1, backgroundColor: ['#e5383b','#fca311','#adb5bd','#495057','#f8f9fa'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'white' } } } } });
}

// --- 5. ROUTER: EL DIRECTOR DE ORQUESTA ---
const router = async () => {
    const route = window.location.hash.substring(1) || 'dashboard'; // Ruta por defecto es #dashboard
    // Carga el template HTML en el contenedor
    if (templates[route]) {
        appContainer.innerHTML = templates[route];
        // Ejecuta la lógica JavaScript para esa página
        if (pageLogic[route]) {
            try { await pageLogic[route](); } 
            catch (error) { console.error(`Error al cargar la lógica para la ruta #${route}:`, error); appContainer.innerHTML = `<p style="color:red;">Error cargando esta sección.</p>`; }
        }
        // Actualiza la clase 'active' en la barra lateral
        document.querySelectorAll('.sidebar-menu li').forEach(li => {
            li.classList.toggle('active', li.dataset.route === route);
        });
    } else {
        appContainer.innerHTML = '<h2>Error 404: Página no encontrada</h2>';
    }
};

// --- 6. EVENT LISTENERS INICIALES ---
window.addEventListener('hashchange', router); // Escucha cambios en la URL (ej: #tickets)
window.addEventListener('load', router); // Carga la ruta inicial cuando la página carga por primera vez
