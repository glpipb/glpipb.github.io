const firebaseConfig = {
  apiKey: "AIzaSyA5rVhtkVDeJPY0bEnLjk-_LMVN3d5pkIo",
  authDomain: "glpi-tecnologia.firebaseapp.com",
  projectId: "glpi-tecnologia",
  storageBucket: "glpi-tecnologia.firebasestorage.app",
  messagingSenderId: "195664374847",
  appId: "1:195664374847:web:88412be75b4ff8600adc8a",
  measurementId: "G-QJD3VS1V5Y"
};
// --- 2. INICIALIZACIÓN DE FIREBASE ---
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();


// --- 3. TEMPLATES HTML PARA CADA SECCIÓN ---

const dashboardHTML = `<h1>📊 Dashboard</h1><div class="dashboard-stats" id="dashboard-cards"></div><div class="card" style="margin-top: 30px;"><h2>Tickets por Día (Últimos 7 días)</h2><canvas id="ticketsChart"></canvas></div>`;

const ticketListHTML = `<div class="card"><h2 id="tickets-list-title">Tickets</h2><table id="tickets-table"><thead><tr><th>Título</th><th>Solicitante</th><th>Ubicación</th><th>Estado</th><th>Acciones</th></tr></thead><tbody></tbody></table></div>`;

const newTicketFormHTML = `<h1>➕ Crear Nuevo Ticket</h1><div class="card"><form id="new-ticket-form"><div class="form-group"><label for="title">Título</label><input type="text" id="title" required></div><div class="form-group"><label>Descripción</label><div id="description-editor"></div></div><div style="display: flex; gap: 20px; flex-wrap: wrap;"><div class="form-group" style="flex: 1; min-width: 200px;"><label for="requester">Solicitante</label><select id="requester" required></select></div><div class="form-group" style="flex: 1; min-width: 200px;"><label for="location">Ubicación</label><select id="location" required></select></div><div class="form-group" style="flex: 1; min-width: 150px;"><label for="priority">Prioridad</label><select id="priority"><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></select></div></div><button type="submit" class="primary">Crear Ticket</button></form></div>`;

const statisticsHTML = `<h1>📈 Estadísticas</h1><div class="card"><h2>Reporte de Tickets por Rango de Fechas</h2><div class="stats-filters"><div class="form-group"><label for="start-date">Fecha de Inicio</label><input type="date" id="start-date"></div><div class="form-group"><label for="end-date">Fecha de Fin</label><input type="date" id="end-date"></div><button id="generate-report-btn" class="primary">Generar Reporte</button></div><canvas id="stats-chart"></canvas></div>`;

const inventoryPageHTML = `
    <h1 id="inventory-title"></h1>
    <div class="card">
        <h2>Añadir Nuevo Dispositivo</h2>
        <form id="new-device-form">
            <div id="inventory-form-fields" class="inventory-form-grid">
                <!-- Los campos se generarán aquí -->
            </div>
            <div style="margin-top: 20px;">
                <button type="submit" class="primary">Añadir al Inventario</button>
            </div>
        </form>
    </div>
    <div class="card">
        <h2 id="inventory-list-title">Dispositivos</h2>
        <table id="inventory-table">
            <thead id="inventory-table-head"></thead>
            <tbody id="inventory-table-body"></tbody>
        </table>
    </div>
`;

const maintenanceHTML = `<h1>⚙️ Plan de Mantenimiento</h1><div class="card"><h2>Programar Mantenimiento</h2><form id="new-maintenance-form" style="display: flex; gap: 10px; flex-wrap: wrap;"><input type="text" id="maint-task" placeholder="Tarea" required style="flex: 2;"><input type="date" id="maint-date" required style="flex: 1;"><select id="maint-freq" style="flex: 1;"><option value="unica">Vez Única</option><option value="mensual">Mensual</option><option value="trimestral">Trimestral</option><option value="anual">Anual</option></select><button type="submit" class="primary">Programar</button></form></div><div class="card"><h2>Próximos Mantenimientos</h2><table id="maintenance-table"><thead><tr><th>Tarea</th><th>Próxima Fecha</th><th>Frecuencia</th><th>Acciones</th></tr></thead><tbody></tbody></table></div>`;

const credentialsHTML = `<h1>🔑 Gestor de Credenciales (No Críticas)</h1><div class="card" style="border-left: 5px solid var(--danger-color);"><h2 style="color: var(--danger-color);">⚠️ ADVERTENCIA DE SEGURIDAD ⚠️</h2><p>Almacenar credenciales aquí no es seguro. Úsalo <strong>SOLAMENTE</strong> para información no sensible (contraseñas de impresoras, usuarios de prueba, etc.). <strong>NUNCA guardes aquí contraseñas de administrador o de cuentas importantes.</strong></p></div><div class="card"><h2>Añadir Credencial</h2><form id="new-credential-form"><div class="form-group"><input type="text" id="cred-system" placeholder="Sistema/Servicio" required></div><div class="form-group"><input type="text" id="cred-user" placeholder="Usuario"></div><div class="form-group"><input type="text" id="cred-pass" placeholder="Contraseña/Clave"></div><div class="form-group"><textarea id="cred-notes" placeholder="Notas adicionales"></textarea></div><button type="submit" class="primary">Guardar</button></form></div><div class="card"><h2>Credenciales Guardadas</h2><table id="credentials-table"><thead><tr><th>Sistema</th><th>Usuario</th><th>Contraseña</th><th>Notas</th><th>Acciones</th></tr></thead><tbody></tbody></table></div>`;

const configHTML = `<h1>⚙️ Configuración</h1><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;"><div class="card"><h2>Gestionar Solicitantes</h2><form id="add-requester-form" style="display:flex; gap:10px; margin-bottom: 20px;"><input type="text" id="requester-name" placeholder="Nombre del solicitante" required style="flex-grow:1;"><button type="submit" class="primary">Añadir</button></form><ul id="requesters-list" class="config-list"></ul></div><div class="card"><h2>Gestionar Ubicaciones</h2><form id="add-location-form" style="display:flex; gap:10px; margin-bottom: 20px;"><input type="text" id="location-name" placeholder="Nombre de la ubicación" required style="flex-grow:1;"><button type="submit" class="primary">Añadir</button></form><ul id="locations-list" class="config-list"></ul></div></div>`;


// --- 4. FUNCIONES PARA RENDERIZAR CADA SECCIÓN ---

async function renderDashboard(container) {
    container.innerHTML = dashboardHTML;
    const cardsContainer = document.getElementById('dashboard-cards');
    cardsContainer.innerHTML = 'Cargando estadísticas...';
    const ticketsSnapshot = await db.collection('tickets').get();
    const tickets = ticketsSnapshot.docs.map(doc => doc.data());
    const openCount = tickets.filter(t => t.status === 'abierto').length;
    const closedCount = tickets.filter(t => t.status === 'cerrado').length;
    const totalCount = tickets.length;
    cardsContainer.innerHTML = `
        <a href="#tickets?status=abierto" class="stat-card open"><div class="stat-number">${openCount}</div><div class="stat-label">Tickets Abiertos</div></a>
        <a href="#tickets?status=cerrado" class="stat-card closed"><div class="stat-number">${closedCount}</div><div class="stat-label">Tickets Cerrados</div></a>
        <a href="#tickets" class="stat-card all"><div class="stat-number">${totalCount}</div><div class="stat-label">Todos los Tickets</div></a>
    `;
    const last7Days = Array(7).fill(0).reduce((acc, _, i) => { const d = new Date(); d.setDate(d.getDate() - i); acc[d.toISOString().split('T')[0]] = 0; return acc; }, {});
    tickets.forEach(ticket => {
        if (ticket.createdAt) {
            const ticketDate = ticket.createdAt.toDate().toISOString().split('T')[0];
            if (last7Days.hasOwnProperty(ticketDate)) { last7Days[ticketDate]++; }
        }
    });
    const ctx = document.getElementById('ticketsChart').getContext('2d');
    new Chart(ctx, { type: 'bar', data: {
        labels: Object.keys(last7Days).map(d => new Date(d + 'T00:00:00').toLocaleDateString('es-ES', {day:'numeric', month:'short'})).reverse(),
        datasets: [{ label: '# de Tickets Creados', data: Object.values(last7Days).reverse(), backgroundColor: 'rgba(0, 123, 255, 0.5)', borderColor: 'rgba(0, 123, 255, 1)', borderWidth: 1 }]
    }, options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } } });
}

async function renderNewTicketForm(container) {
    container.innerHTML = newTicketFormHTML;
    const quill = new Quill('#description-editor', { theme: 'snow', placeholder: 'Detalla el problema o solicitud...' });
    const requesterSelect = document.getElementById('requester');
    const locationSelect = document.getElementById('location');
    const [reqSnap, locSnap] = await Promise.all([ db.collection('requesters').orderBy('name').get(), db.collection('locations').orderBy('name').get() ]);
    requesterSelect.innerHTML = '<option value="">Selecciona un solicitante</option>';
    reqSnap.forEach(doc => { requesterSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`; });
    locationSelect.innerHTML = '<option value="">Selecciona una ubicación</option>';
    locSnap.forEach(doc => { locationSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`; });
    const form = document.getElementById('new-ticket-form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        db.collection('tickets').add({
            title: form.title.value, description: quill.root.innerHTML, requesterId: form.requester.value, locationId: form.location.value,
            priority: form.priority.value, status: 'abierto', solution: null, createdAt: firebase.firestore.FieldValue.serverTimestamp(), closedAt: null
        }).then(() => {
            alert('¡Ticket creado con éxito!');
            window.location.hash = '#tickets?status=abierto';
        });
    });
}

async function renderTicketList(container, params = {}) {
    container.innerHTML = ticketListHTML;
    const [reqSnap, locSnap] = await Promise.all([ db.collection('requesters').get(), db.collection('locations').get() ]);
    const requestersMap = {}; reqSnap.forEach(doc => requestersMap[doc.id] = doc.data().name);
    const locationsMap = {}; locSnap.forEach(doc => locationsMap[doc.id] = doc.data().name);
    const tableBody = document.querySelector('#tickets-table tbody');
    const tableTitle = document.getElementById('tickets-list-title');
    const filterStatus = params.status;
    let query = db.collection('tickets');
    if (filterStatus) {
        query = query.where('status', '==', filterStatus);
        tableTitle.innerText = `Tickets ${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}s`;
    } else {
        tableTitle.innerText = 'Todos los Tickets';
    }
    query.orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        tableBody.innerHTML = '';
        if (snapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="5">No hay tickets que coincidan con este filtro.</td></tr>`;
            return;
        }
        snapshot.forEach(doc => {
            const ticket = { id: doc.id, ...doc.data() };
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${ticket.title}</td><td>${requestersMap[ticket.requesterId] || 'N/A'}</td><td>${locationsMap[ticket.locationId] || 'N/A'}</td><td><span class="status status-${ticket.status}">${ticket.status}</span></td><td><button class="primary view-ticket-btn" data-id="${ticket.id}">Ver Detalles</button></td>`;
            tableBody.appendChild(tr);
        });
    }, error => {
        console.error("Error en la consulta de tickets: ", error);
        tableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Error al cargar tickets. Por favor, asegúrate de haber creado el índice compuesto en Firebase (tickets: status ascendente, createdAt descendente).</td></tr>`;
    });
}

function renderEstadisticas(container) {
    container.innerHTML = statisticsHTML;
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const generateBtn = document.getElementById('generate-report-btn');
    const ctx = document.getElementById('stats-chart').getContext('2d');
    let chart;
    const today = new Date();
    const oneMonthAgo = new Date(new Date().setMonth(today.getMonth() - 1));
    startDateInput.value = oneMonthAgo.toISOString().split('T')[0];
    endDateInput.value = today.toISOString().split('T')[0];
    
    generateBtn.addEventListener('click', async () => {
        const startDate = new Date(startDateInput.value);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(endDateInput.value);
        endDate.setHours(23, 59, 59, 999);
        const dataByDay = {};
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dayKey = d.toISOString().split('T')[0];
            dataByDay[dayKey] = { created: 0, closed: 0 };
        }
        const createdQuery = db.collection('tickets').where('createdAt', '>=', startDate).where('createdAt', '<=', endDate).get();
        const closedQuery = db.collection('tickets').where('closedAt', '>=', startDate).where('closedAt', '<=', endDate).get();
        try {
            const [createdSnapshot, closedSnapshot] = await Promise.all([createdQuery, closedQuery]);
            createdSnapshot.forEach(doc => {
                const ticket = doc.data();
                const createdDay = ticket.createdAt.toDate().toISOString().split('T')[0];
                if (dataByDay[createdDay]) dataByDay[createdDay].created++;
            });
            closedSnapshot.forEach(doc => {
                const ticket = doc.data();
                if (ticket.closedAt) {
                    const closedDay = ticket.closedAt.toDate().toISOString().split('T')[0];
                    if (dataByDay[closedDay]) dataByDay[closedDay].closed++;
                }
            });
            const labels = Object.keys(dataByDay);
            const createdData = labels.map(day => dataByDay[day].created);
            const closedData = labels.map(day => dataByDay[day].closed);
            if (chart) chart.destroy();
            chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels.map(d => new Date(d+'T00:00:00').toLocaleDateString('es-ES', {month:'short', day:'numeric'})),
                    datasets: [
                        { label: 'Tickets Creados', data: createdData, borderColor: 'rgba(0, 123, 255, 1)', backgroundColor: 'rgba(0, 123, 255, 0.2)', fill: true, tension: 0.1 },
                        { label: 'Tickets Cerrados', data: closedData, borderColor: 'rgba(40, 167, 69, 1)', backgroundColor: 'rgba(40, 167, 69, 0.2)', fill: true, tension: 0.1 }
                    ]
                },
                options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
            });
        } catch (error) {
            console.error("Error generando el reporte: ", error);
            alert("Error al generar el reporte. Asegúrate de haber creado los índices necesarios en Firebase (para createdAt y closedAt).");
        }
    });
    generateBtn.click();
}

function renderInventoryPage(container, params) {
    const category = params.category;
    container.innerHTML = inventoryPageHTML;

    const categoryConfig = {
        computers: { title: 'Computadores', fields: { brand: 'Marca', model: 'Modelo', serial: 'N/Serie', user: 'Usuario', cpu: 'CPU', ram: 'RAM (GB)', storage: 'Almacenamiento (GB)', os: 'Sistema Operativo' }},
        phones: { title: 'Teléfonos', fields: { brand: 'Marca', model: 'Modelo', serial: 'N/Serie', imei: 'IMEI', phoneNumber: 'N/Teléfono', user: 'Usuario' }},
        cameras: { title: 'Cámaras', fields: { brand: 'Marca', model: 'Modelo', serial: 'N/Serie', ipAddress: 'Dirección IP', location: 'Ubicación Física' }},
        modems: { title: 'Módems', fields: { brand: 'Marca', model: 'Modelo', serial: 'N/Serie', serviceProvider: 'Proveedor de Internet' }},
        communicators: { title: 'Comunicadores', fields: { brand: 'Marca', model: 'Modelo', serial: 'N/Serie', type: 'Tipo (Satelital, Radio)' }},
        network: { title: 'Dispositivos de Red', fields: { type: 'Tipo (Switch, Router, AP)', brand: 'Marca', model: 'Modelo', ipAddress: 'Dirección IP', location: 'Ubicación Física' }},
        printers: { title: 'Impresoras', fields: { brand: 'Marca', model: 'Modelo', serial: 'N/Serie', ipAddress: 'Dirección IP', type: 'Tipo (Láser, Tinta)' }}
    };

    const config = categoryConfig[category];
    if (!config) { container.innerHTML = `<h1>Error: Categoría de inventario no encontrada.</h1>`; return; }

    document.getElementById('inventory-title').innerText = `💻 Inventario de ${config.title}`;
    document.getElementById('inventory-list-title').innerText = `Lista de ${config.title}`;
    const formFieldsContainer = document.getElementById('inventory-form-fields');
    const tableHeadContainer = document.getElementById('inventory-table-head');
    
    formFieldsContainer.innerHTML = Object.entries(config.fields).map(([key, label]) => `<div class="form-group"><label for="device-${key}">${label}</label><input type="text" id="device-${key}" name="${key}" required></div>`).join('');
    const tableHeaders = Object.values(config.fields);
    tableHeadContainer.innerHTML = `<tr>${tableHeaders.map(h => `<th>${h}</th>`).join('')}<th>Acciones</th></tr>`;

    const form = document.getElementById('new-device-form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const deviceData = { category: category };
        Object.keys(config.fields).forEach(key => { deviceData[key] = form[key].value; });
        db.collection('inventory').add(deviceData).then(() => form.reset());
    });

    const tableBody = document.getElementById('inventory-table-body');
    db.collection('inventory').where('category', '==', category).onSnapshot(snapshot => {
        tableBody.innerHTML = '';
        snapshot.forEach(doc => {
            const device = { id: doc.id, ...doc.data() };
            const tr = document.createElement('tr');
            const cells = Object.keys(config.fields).map(key => `<td>${device[key] || 'N/A'}</td>`).join('');
            tr.innerHTML = `${cells}<td><button class="danger delete-btn" data-id="${device.id}" data-collection="inventory">Eliminar</button></td>`;
            tableBody.appendChild(tr);
        });
    });
}

function renderMaintenance(container) {
    container.innerHTML = maintenanceHTML;
    const form = document.getElementById('new-maintenance-form');
    form.addEventListener('submit', e => { e.preventDefault(); db.collection('maintenance').add({ task: form['maint-task'].value, nextDate: form['maint-date'].value, frequency: form['maint-freq'].value, }).then(() => form.reset()); });
    const tableBody = document.querySelector('#maintenance-table tbody');
    db.collection('maintenance').orderBy('nextDate').onSnapshot(snapshot => {
        tableBody.innerHTML = '';
        snapshot.forEach(doc => {
            const maint = { id: doc.id, ...doc.data() };
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${maint.task}</td><td>${new Date(maint.nextDate + 'T00:00:00').toLocaleDateString('es-ES')}</td><td>${maint.frequency}</td><td><button class="danger delete-btn" data-id="${maint.id}" data-collection="maintenance">Completado</button></td>`;
            tableBody.appendChild(tr);
        });
    });
}

function renderCredentials(container) {
    container.innerHTML = credentialsHTML;
    const form = document.getElementById('new-credential-form');
    form.addEventListener('submit', e => { e.preventDefault(); db.collection('credentials').add({ system: form['cred-system'].value, user: form['cred-user'].value, pass: form['cred-pass'].value, notes: form['cred-notes'].value, }).then(() => form.reset()); });
    const tableBody = document.querySelector('#credentials-table tbody');
    db.collection('credentials').orderBy('system').onSnapshot(snapshot => {
        tableBody.innerHTML = '';
        snapshot.forEach(doc => {
            const cred = { id: doc.id, ...doc.data() };
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${cred.system}</td><td>${cred.user}</td><td>${cred.pass}</td><td>${cred.notes}</td><td><button class="danger delete-btn" data-id="${doc.id}" data-collection="credentials">Eliminar</button></td>`;
            tableBody.appendChild(tr);
        });
    });
}

function renderConfiguracion(container) {
    container.innerHTML = configHTML;
    const reqForm = document.getElementById('add-requester-form');
    const reqList = document.getElementById('requesters-list');
    reqForm.addEventListener('submit', e => { e.preventDefault(); const name = document.getElementById('requester-name').value.trim(); if (name) db.collection('requesters').add({ name: name }).then(() => reqForm.reset()); });
    db.collection('requesters').orderBy('name').onSnapshot(snapshot => {
        reqList.innerHTML = '';
        snapshot.forEach(doc => {
            const li = document.createElement('li');
            li.className = 'config-list-item';
            li.innerHTML = `<span>${doc.data().name}</span> <button class="danger delete-btn" data-id="${doc.id}" data-collection="requesters" title="Eliminar">×</button>`;
            reqList.appendChild(li);
        });
    });
    const locForm = document.getElementById('add-location-form');
    const locList = document.getElementById('locations-list');
    locForm.addEventListener('submit', e => { e.preventDefault(); const name = document.getElementById('location-name').value.trim(); if (name) db.collection('locations').add({ name: name }).then(() => locForm.reset()); });
    db.collection('locations').orderBy('name').onSnapshot(snapshot => {
        locList.innerHTML = '';
        snapshot.forEach(doc => {
            const li = document.createElement('li');
            li.className = 'config-list-item';
            li.innerHTML = `<span>${doc.data().name}</span> <button class="danger delete-btn" data-id="${doc.id}" data-collection="locations" title="Eliminar">×</button>`;
            locList.appendChild(li);
        });
    });
}


// --- 5. ROUTER Y LÓGICA PRINCIPAL ---
const appContent = document.getElementById('app-content');
const navLinks = document.querySelectorAll('.nav-link');
const modal = document.getElementById('ticket-modal');
const modalBody = document.getElementById('modal-body');
const modalCloseBtn = document.querySelector('.modal-close-btn');

const routes = {
    '#dashboard': renderDashboard,
    '#crear-ticket': renderNewTicketForm,
    '#tickets': renderTicketList,
    '#estadisticas': renderEstadisticas,
    '#maintenance': renderMaintenance,
    '#credentials': renderCredentials,
    '#configuracion': renderConfiguracion
};

function router() {
    const fullHash = window.location.hash || '#dashboard';
    const [path, queryString] = fullHash.split('?');
    const params = new URLSearchParams(queryString);
    
    document.querySelectorAll('.nav-item-with-submenu').forEach(item => item.classList.remove('open'));
    if (path.startsWith('#inventory-')) {
        const category = path.replace('#inventory-', '');
        params.set('category', category);
        renderInventoryPage(appContent, Object.fromEntries(params.entries()));
        
        const inventoryLink = document.querySelector('.nav-item-with-submenu > a');
        if (inventoryLink) {
            inventoryLink.parentElement.classList.add('open');
            navLinks.forEach(link => link.classList.remove('active'));
            inventoryLink.classList.add('active');
        }
        return;
    }
    
    const paramsObj = Object.fromEntries(params.entries());
    const renderFunction = routes[path];
    if (renderFunction) {
        appContent.innerHTML = '<div class="card"><h1>Cargando...</h1></div>';
        renderFunction(appContent, paramsObj); 
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href').split('?')[0];
            link.classList.toggle('active', linkPath === path);
        });
    } else { appContent.innerHTML = '<h1>404 - Página no encontrada</h1>'; }
}

async function showTicketModal(ticketId) {
    const ticketDoc = await db.collection('tickets').doc(ticketId).get();
    if (!ticketDoc.exists) { alert('Error: No se encontró el ticket.'); return; }
    const ticket = ticketDoc.data();
    const requesterName = ticket.requesterId ? (await db.collection('requesters').doc(ticket.requesterId).get()).data()?.name || 'N/A' : 'N/A';
    const locationName = ticket.locationId ? (await db.collection('locations').doc(ticket.locationId).get()).data()?.name || 'N/A' : 'N/A';
    let solutionHTML = `<hr><h3>Añadir Solución</h3><form id="solution-form"><div class="form-group"><div id="solution-editor"></div></div><button type="submit" class="primary">Guardar Solución y Cerrar</button></form>`;
    if (ticket.status === 'cerrado') { solutionHTML = `<hr><h3>Solución Aplicada</h3><div class="card">${ticket.solution || 'No se especificó solución.'}</div>`; }
    modalBody.innerHTML = `
        <div class="ticket-modal-layout">
            <div class="ticket-modal-main"><h2>${ticket.title}</h2><hr><h3>Descripción</h3><div class="card">${ticket.description}</div>${solutionHTML}</div>
            <div class="ticket-modal-sidebar"><h3>Detalles del Ticket</h3><div class="ticket-detail-item"><strong>Estado:</strong> <span class="status status-${ticket.status}">${ticket.status}</span></div><div class="ticket-detail-item"><strong>Prioridad:</strong> ${ticket.priority}</div><div class="ticket-detail-item"><strong>Solicitante:</strong> ${requesterName}</div><div class="ticket-detail-item"><strong>Ubicación:</strong> ${locationName}</div><div class="ticket-detail-item"><strong>Creado:</strong> ${ticket.createdAt.toDate().toLocaleString('es-ES')}</div>${ticket.closedAt ? `<div class="ticket-detail-item"><strong>Cerrado:</strong> ${ticket.closedAt.toDate().toLocaleString('es-ES')}</div>` : ''}</div>
        </div>`;
    modal.classList.remove('hidden');
    if (ticket.status !== 'cerrado') {
        const solutionEditor = new Quill('#solution-editor', { theme: 'snow', placeholder: 'Describe la solución aplicada...' });
        document.getElementById('solution-form').addEventListener('submit', e => {
            e.preventDefault();
            db.collection('tickets').doc(ticketId).update({ solution: solutionEditor.root.innerHTML, status: 'cerrado', closedAt: firebase.firestore.FieldValue.serverTimestamp() }).then(() => modal.classList.add('hidden'));
        });
    }
}

appContent.addEventListener('click', e => {
    const target = e.target.closest('button');
    if (!target) return;
    if (target.classList.contains('delete-btn')) {
        const id = target.dataset.id;
        const collection = target.dataset.collection;
        if (confirm(`¿Seguro que quieres eliminar este elemento de ${collection}?`)) { db.collection(collection).doc(id).delete(); }
    }
    if (target.classList.contains('view-ticket-btn')) { const id = target.dataset.id; showTicketModal(id); }
});

modalCloseBtn.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.add('hidden'); });

// --- 6. AUTENTICACIÓN Y PUNTO DE ENTRADA ---
document.addEventListener('DOMContentLoaded', () => {
    const submenuToggle = document.querySelector('.nav-item-with-submenu > a');
    if (submenuToggle) {
        submenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            submenuToggle.parentElement.classList.toggle('open');
        });
    }

    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    const logoutBtn = document.getElementById('logout-btn');
    loginContainer.innerHTML = `<div class="login-box"><h2>Iniciar Sesión</h2><input type="email" id="email" placeholder="Correo electrónico"><input type="password" id="password" placeholder="Contraseña"><button id="login-btn">Entrar</button><p id="login-error" class="error-message"></p></div>`;
    
    document.getElementById('login-btn').addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('login-error');
        errorEl.textContent = '';
        auth.signInWithEmailAndPassword(email, password).catch(error => { console.error("Error de inicio de sesión:", error); errorEl.textContent = "Correo o contraseña incorrectos."; });
    });

    logoutBtn.addEventListener('click', () => auth.signOut());

    auth.onAuthStateChanged(user => {
        if (user) {
            loginContainer.classList.remove('visible'); loginContainer.classList.add('hidden');
            appContainer.classList.add('visible'); appContainer.classList.remove('hidden');
            window.addEventListener('hashchange', router); router();
        } else {
            loginContainer.classList.add('visible'); loginContainer.classList.remove('hidden');
            appContainer.classList.remove('visible'); appContainer.classList.add('hidden');
            window.removeEventListener('hashchange', router);
        }
    });
});
