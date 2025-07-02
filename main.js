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

// --- 2. PLANTILLAS HTML PARA CADA SECCIÓN ---
const templates = {
    dashboard: `
        <header class="main-header"><div class="breadcrumbs"><i class="fa-solid fa-house"></i> / <span>Activos</span></div></header>
        <section class="dashboard-controls"><div class="control-title"><h2>Activos</h2></div></section>
        <section class="dashboard-grid">
            <div class="card"><div class="card-content"><div><span class="card-number" id="total-computadoras">0</span><p class="card-title">Computadoras</p></div><i class="fa-solid fa-laptop card-icon"></i></div></div>
            <div class="card"><div class="card-content"><div><span class="card-number" id="total-monitores">0</span><p class="card-title">Monitores</p></div><i class="fa-solid fa-desktop card-icon"></i></div></div>
            <div class="card"><div class="card-content"><div><span class="card-number" id="total-telefonos">0</span><p class="card-title">Teléfonos</p></div><i class="fa-solid fa-phone card-icon"></i></div></div>
            <div class="card"><div class="card-content"><div><span class="card-number" id="total-impresoras">0</span><p class="card-title">Impresoras</p></div><i class="fa-solid fa-print card-icon"></i></div></div>
            <div class="card"><div class="card-content"><div><span class="card-number" id="total-dispositivos-red">0</span><p class="card-title">Dispositivos de red</p></div><i class="fa-solid fa-network-wired card-icon"></i></div></div>
            <div class="card"><div class="card-content"><div><span class="card-number" id="total-licencias">0</span><p class="card-title">Licencias</p></div><i class="fa-solid fa-key card-icon"></i></div></div>
            <div class="card chart-card"><h3>Computadoras por Marca</h3><canvas id="computadoras-chart"></canvas></div>
            <div class="card chart-card"><h3>Tickets por Estado</h3><canvas id="tickets-chart"></canvas></div>
        </section>
    `,
    tickets: `
        <header class="main-header"><div class="breadcrumbs"><i class="fa-solid fa-house"></i> / <span>Tickets</span></div></header>
        <section class="dashboard-controls"><div class="control-title"><h2>Gestión de Tickets</h2><button class="add-button" id="open-modal-btn">+</button></div></section>
        <section class="content-area"><div class="card data-table-card"><table class="data-table"><thead><tr><th>Título</th><th>Usuario</th><th>Prioridad</th><th>Estado</th><th>Fecha</th></tr></thead><tbody id="tickets-table-body"></tbody></table></div></section>
        <div id="modal-container"></div>
    `,
    mantenimiento: `
        <header class="main-header"><div class="breadcrumbs"><i class="fa-solid fa-house"></i> / <span>Mantenimiento</span></div></header>
        <section class="dashboard-controls"><div class="control-title"><h2>Plan de Mantenimiento</h2><button class="add-button" id="open-modal-btn">+</button></div></section>
        <section class="content-area"><div class="card data-table-card"><table class="data-table"><thead><tr><th>Activo</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th>Descripción</th></tr></thead><tbody id="maintenance-table-body"></tbody></table></div></section>
        <div id="modal-container"></div>
    `,
    kb: `
        <header class="main-header"><div class="breadcrumbs"><i class="fa-solid fa-house"></i> / <span>Base de Conocimiento</span></div></header>
        <section class="dashboard-controls"><div class="control-title"><h2>Notas Seguras</h2><button class="add-button" id="open-modal-btn">+</button></div></section>
        <section class="kb-grid" id="kb-grid-container"></section>
        <div id="modal-container"></div>
    `
};

// --- 3. LÓGICA PARA CADA SECCIÓN ---
const pageLogic = {
    // ---- LÓGICA DEL DASHBOARD (VERSIÓN A PRUEBA DE FALLOS) ----
    dashboard: async () => {
        // --- Cargar y renderizar datos de Activos ---
        try {
            const activosSnap = await getDocs(collection(db, "activos"));
            const contadores = { 'Computadoras': 0, 'Monitores': 0, 'Telefonos': 0, 'Impresoras': 0, 'Dispositivos de red': 0, 'Licencias': 0 };
            const marcas = {};
            
            activosSnap.forEach(doc => {
                const a = doc.data();
                if (a.tipo && contadores.hasOwnProperty(a.tipo)) contadores[a.tipo]++;
                if (a.tipo === 'Computadoras' && a.marca) marcas[a.marca] = (marcas[a.marca] || 0) + 1;
            });

            Object.keys(contadores).forEach(k => {
                const elId = `total-${k.toLowerCase().replace(/ /g, '-')}`;
                const el = document.getElementById(elId);
                if (el) el.textContent = contadores[k];
            });

            renderizarGrafico('computadoras-chart', 'pie', Object.keys(marcas), Object.values(marcas));
            console.log("Datos de Activos cargados y renderizados.");

        } catch (error) {
            console.error("Error al cargar datos de ACTIVOS:", error);
            // Opcional: mostrar un mensaje en la UI
        }

        // --- Cargar y renderizar datos de Tickets para el gráfico ---
        try {
            const ticketsSnap = await getDocs(collection(db, "tickets"));
            const estados = { 'Abierto': 0, 'Cerrado': 0 };

            ticketsSnap.forEach(doc => {
                const t = doc.data();
                if (t.estado && estados.hasOwnProperty(t.estado)) estados[t.estado]++;
            });

            renderizarGrafico('tickets-chart', 'doughnut', Object.keys(estados), Object.values(estados));
            console.log("Datos de Tickets cargados y renderizados para el gráfico.");

        } catch (error) {
            console.error("Error al cargar datos de TICKETS para el gráfico:", error);
        }
    },
    // ---- LÓGICA DE TICKETS ----
    tickets: async () => {
        renderModal('tickets');
        const cargar = async () => {
            const tbody = document.getElementById('tickets-table-body'); tbody.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;
            const q = query(collection(db, "tickets"), orderBy("fechaCreacion", "desc"));
            const snap = await getDocs(q);
            tbody.innerHTML = snap.empty ? `<tr><td colspan="5">No hay tickets.</td></tr>` : snap.docs.map(doc => {
                const t = doc.data(), f = t.fechaCreacion ? new Date(t.fechaCreacion.seconds * 1000).toLocaleString() : 'N/A';
                return `<tr><td>${t.titulo}</td><td>${t.usuario}</td><td class="priority-${t.prioridad.toLowerCase()}">${t.prioridad}</td><td class="status-${t.estado.toLowerCase()}">${t.estado}</td><td>${f}</td></tr>`;
            }).join('');
        };
        await cargar();
        document.getElementById('add-form').addEventListener('submit', async e => {
            e.preventDefault(); const f = e.target;
            await addDoc(collection(db, 'tickets'), { titulo: f.field1.value, usuario: f.field2.value, prioridad: f.field3.value, estado: 'Abierto', fechaCreacion: serverTimestamp() });
            closeModal(); await cargar();
        });
    },
    // ---- LÓGICA DE MANTENIMIENTO ----
    mantenimiento: async () => {
        renderModal('mantenimiento');
        const cargar = async () => {
            const tbody = document.getElementById('maintenance-table-body'); tbody.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;
            const q = query(collection(db, "mantenimientos"), orderBy("fechaProgramada", "asc"));
            const snap = await getDocs(q);
            tbody.innerHTML = snap.empty ? `<tr><td colspan="5">No hay tareas programadas.</td></tr>` : snap.docs.map(doc => {
                const t = doc.data(), f = t.fechaProgramada ? new Date(t.fechaProgramada.seconds * 1000).toLocaleDateString() : 'N/A';
                return `<tr><td>${t.activo}</td><td>${t.tipo}</td><td>${f}</td><td class="status-${t.estado.toLowerCase()}">${t.estado}</td><td>${t.descripcion}</td></tr>`;
            }).join('');
        };
        await cargar();
        document.getElementById('add-form').addEventListener('submit', async e => {
            e.preventDefault(); const f = e.target;
            await addDoc(collection(db, 'mantenimientos'), { activo: f.field1.value, tipo: f.field2.value, fechaProgramada: new Date(f.field3.value), descripcion: f.field4.value, estado: 'Pendiente', fechaCreacion: serverTimestamp() });
            closeModal(); await cargar();
        });
    },
    // ---- LÓGICA DE BASE DE CONOCIMIENTO ----
    kb: async () => {
        renderModal('kb');
        const cargar = async () => {
            const grid = document.getElementById('kb-grid-container'); grid.innerHTML = `<p>Cargando...</p>`;
            const q = query(collection(db, "conocimiento"), orderBy("fechaCreacion", "desc"));
            const snap = await getDocs(q);
            grid.innerHTML = snap.empty ? `<p>No hay notas.</p>` : snap.docs.map(doc => {
                const n = doc.data(); return `<div class="card"><h3>${n.titulo}</h3><p>${n.contenido}</p></div>`;
            }).join('');
        };
        await cargar();
        document.getElementById('add-form').addEventListener('submit', async e => {
            e.preventDefault(); const f = e.target;
            await addDoc(collection(db, 'conocimiento'), { titulo: f.field1.value, categoria: f.field2.value, contenido: f.field3.value, fechaCreacion: serverTimestamp() });
            closeModal(); await cargar();
        });
    }
};

// --- 4. HELPERS Y FUNCIONES GLOBALES ---
const modalTemplates = {
    tickets: { title: 'Nuevo Ticket', fields: [ {l: 'Título', id: 'field1', t: 'text'}, {l: 'Usuario', id: 'field2', t: 'text'}, {l: 'Prioridad', id: 'field3', t: 'select', o: ['Baja', 'Media', 'Alta']} ] },
    mantenimiento: { title: 'Programar Mantenimiento', fields: [ {l: 'Activo', id: 'field1', t: 'text'}, {l: 'Tipo', id: 'field2', t: 'select', o: ['Preventivo', 'Correctivo']}, {l: 'Fecha', id: 'field3', t: 'date'}, {l: 'Descripción', id: 'field4', t: 'textarea'} ] },
    kb: { title: 'Nueva Nota', fields: [ {l: 'Título', id: 'field1', t: 'text'}, {l: 'Categoría', id: 'field2', t: 'text'}, {l: 'Contenido', id: 'field3', t: 'textarea'} ] }
};
function renderModal(type) {
    const t = modalTemplates[type];
    const fields = t.fields.map(f => `<div class="form-group"><label>${f.l}</label>${ f.t === 'select' ? `<select id="${f.id}">${f.o.map(o=>`<option value="${o}">${o}</option>`).join('')}</select>` : f.t === 'textarea' ? `<textarea id="${f.id}" rows="4"></textarea>` : `<input type="${f.t}" id="${f.id}">` }</div>`).join('');
    document.getElementById('modal-container').innerHTML = `<div id="modal" class="modal"><div class="modal-content"><span class="close-btn">×</span><h2>${t.title}</h2><form id="add-form">${fields}<button type="submit" class="submit-btn">Guardar</button></form></div></div>`;
    document.getElementById('open-modal-btn').onclick = () => document.getElementById('modal').style.display = 'block';
    document.querySelector('.close-btn').onclick = closeModal;
}
function closeModal() { document.getElementById('modal').style.display = 'none'; }
let charts = {};
function renderizarGrafico(id, type, labels, data) {
    const ctx = document.getElementById(id); if (!ctx) return;
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(ctx, { type, data: { labels, datasets: [{ data, backgroundColor: ['#e5383b','#fca311','#adb5bd','#495057','#f8f9fa'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top', labels: { color: 'white' } } } } });
}

// --- 5. ROUTER: EL DIRECTOR DE ORQUESTA ---
const router = async () => {
    const route = window.location.hash.substring(1) || 'dashboard';
    const template = templates[route] || `<h2>Error 404</h2><p>Página no encontrada.</p>`;
    appContainer.innerHTML = template;
    if (pageLogic[route]) {
        try { await pageLogic[route](); }
        catch (error) { console.error(`Error en la ruta #${route}:`, error); }
    }
    document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.toggle('active', li.dataset.route === route));
};

// --- 6. EJECUCIÓN INICIAL ---
window.addEventListener('hashchange', router);
window.addEventListener('load', router);
