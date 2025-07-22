// --- 1. CONFIGURACIÓN DE FIREBASE ---
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
window.jsPDF = window.jspdf.jsPDF;

// --- 3. TEMPLATES HTML ---
const dashboardHTML = `<h1>📊 Dashboard</h1><div class="dashboard-stats" id="dashboard-cards"></div><div class="card" style="margin-top: 30px;"><h2>Tickets por Día (Últimos 7 días)</h2><canvas id="ticketsChart"></canvas></div>`;
const newTicketFormHTML = `<h1>➕ Crear Nuevo Ticket</h1><div class="card"><form id="new-ticket-form"><div class="form-group"><label for="title">Título</label><input type="text" id="title" required></div><div class="form-group"><label>Descripción</label><div id="description-editor"></div></div><div class="inventory-form-grid"><div class="form-group"><label for="requester">Solicitante</label><select id="requester" required></select></div><div class="form-group"><label for="location">Ubicación</label><select id="location" required></select></div><div class="form-group"><label for="priority">Prioridad</label><select id="priority"><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></select></div><div class="form-group"><label for="device-search">Dispositivo Asociado (opcional)</label><input type="text" id="device-search" list="device-list" placeholder="Busca por marca, modelo o serie..."><datalist id="device-list"></datalist></div></div><button type="submit" class="primary">Crear Ticket</button></form></div>`;
const ticketListHTML = `<div class="add-new-button-container"><button class="export-btn csv" data-format="csv">Exportar a Excel (CSV)</button><button class="export-btn pdf" data-format="pdf">Exportar a PDF</button></div><div class="card"><h2 id="tickets-list-title">Tickets</h2><div class="table-wrapper"><table id="data-table"><thead><tr><th># Ticket</th><th>Título</th><th>Solicitante</th><th>Ubicación</th><th>Estado</th><th>Acciones</th></tr></thead><tbody></tbody></table></div></div>`;
const historyPageHTML = `<h1>🔍 Historial y Búsqueda Avanzada</h1><div class="card"><form id="history-search-form"><div class="search-filters-grid"><div class="form-group"><label for="search-device">Dispositivo</label><input type="text" id="search-device" list="device-list-search"></div><datalist id="device-list-search"></datalist><div class="form-group"><label for="search-requester">Solicitante</label><select id="search-requester"><option value="">Todos</option></select></div><div class="form-group"><label for="search-location">Ubicación</label><select id="search-location"><option value="">Todas</option></select></div><div class="form-group"><label for="search-status">Estado</label><select id="search-status"><option value="">Todos</option><option value="abierto">Abierto</option><option value="cerrado">Cerrado</option></select></div><div class="form-group"><label for="search-priority">Prioridad</label><select id="search-priority"><option value="">Todas</option><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></select></div><div class="form-group"><button type="submit" class="primary" style="width:100%">Buscar</button></div></div></form></div><div class="add-new-button-container"><button class="export-btn csv" data-format="csv">Exportar a Excel (CSV)</button><button class="export-btn pdf" data-format="pdf">Exportar a PDF</button></div><div class="card"><h2 id="history-results-title">Resultados</h2><div class="table-wrapper"><table id="data-table"><thead><tr><th># Ticket</th><th>Título</th><th>Solicitante</th><th>Fecha Creación</th><th>Estado</th><th>Acciones</th></tr></thead><tbody></tbody></table></div></div>`;
const statisticsHTML = `<div style="display: flex; justify-content: space-between; align-items: center;"><h1>📈 Centro de Análisis</h1><button class="primary" id="export-stats-pdf">Exportar a PDF</button></div><div id="stats-content"><div class="card"><h2>Filtro de Periodo (para Tickets)</h2><div class="stats-filters"><div class="form-group"><label for="start-date">Fecha de Inicio</label><input type="date" id="start-date"></div><div class="form-group"><label for="end-date">Fecha de Fin</label><input type="date" id="end-date"></div><button id="generate-report-btn" class="primary">Generar Reporte</button></div></div><h2>Análisis de Tickets</h2><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px;"><div class="card"><h3>Tickets por Prioridad</h3><canvas id="ticketsByPriorityChart"></canvas></div><div class="card"><h3>Tickets por Categoría de Dispositivo</h3><canvas id="ticketsByDeviceCategoryChart"></canvas></div><div class="kpi-card"><h3>Top 5 Dispositivos Problemáticos</h3><ul id="top-devices-list" class="kpi-list"></ul></div><div class="kpi-card"><h3>Top 5 Solicitantes</h3><ul id="top-requesters-list" class="kpi-list"></ul></div></div><div class="card"><h3>Flujo de Tickets (Creados vs. Cerrados)</h3><canvas id="ticket-flow-chart"></canvas></div><h2 style="margin-top: 40px;">Resumen de Inventario</h2><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px;"><div class="card"><h3>Dispositivos por Categoría</h3><canvas id="inventoryByCategoryChart"></canvas></div><div class="card"><h3>Computadores por SO</h3><canvas id="computersByOsChart"></canvas></div></div></div>`;
const genericListPageHTML = `<h1 id="page-title"></h1><div class="add-new-button-container"><button class="export-btn csv" data-format="csv">Exportar a Excel (CSV)</button><button class="export-btn pdf" data-format="pdf">Exportar a PDF</button><button id="add-item-btn" class="primary open-form-modal-btn">Añadir Nuevo</button></div><div class="card"><h2 id="item-list-title"></h2><div class="table-wrapper"><table id="data-table"><thead id="item-table-head"></thead><tbody id="item-table-body"></tbody></table></div></div>`;
const maintenanceCalendarHTML = `<h1>📅 Planificación</h1><div class="add-new-button-container"><button class="export-btn csv" data-format="csv">Exportar a Excel (CSV)</button><button class="export-btn pdf" data-format="pdf">Exportar a PDF</button><button class="primary open-form-modal-btn" data-type="maintenance">Programar Tarea</button></div><div class="card"><div id="maintenance-calendar"></div><table id="data-table" style="display:none;"></table></div>`;
const configHTML = `<h1>⚙️ Configuración</h1><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;"><div class="card"><h2>Gestionar Solicitantes</h2><form id="add-requester-form" style="display:flex; gap:10px; margin-bottom: 20px;"><input type="text" id="requester-name" placeholder="Nombre del solicitante" required style="flex-grow:1;"><button type="submit" class="primary">Añadir</button></form><ul id="requesters-list" class="config-list"></ul></div><div class="card"><h2>Gestionar Ubicaciones</h2><form id="add-location-form" style="display:flex; gap:10px; margin-bottom: 20px;"><input type="text" id="location-name" placeholder="Nombre de la ubicación" required style="flex-grow:1;"><button type="submit" class="primary">Añadir</button></form><ul id="locations-list" class="config-list"></ul></div></div>`;

// --- 4. FUNCIONES DE AYUDA PARA REPORTES ---
function exportToCSV(tableId, filename) { const table = document.getElementById(tableId); if (!table) { console.error("Tabla no encontrada para exportar:", tableId); return; } let data = []; const headers = Array.from(table.querySelectorAll('thead th')).map(header => header.innerText).slice(0, -1); const rows = table.querySelectorAll('tbody tr'); rows.forEach(row => { const rowData = Array.from(row.querySelectorAll('td')).map(cell => cell.innerText).slice(0, -1); data.push(rowData); }); const csv = Papa.unparse({ fields: headers, data }); const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); if (link.download !== undefined) { const url = URL.createObjectURL(blob); link.setAttribute("href", url); link.setAttribute("download", `${filename}.csv`); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); } }
function exportToPDF(tableId, filename) { const table = document.getElementById(tableId); if (!table) { console.error("Tabla no encontrada para exportar:", tableId); return; } const doc = new jsPDF({ orientation: "landscape" }); const head = [Array.from(table.querySelectorAll('thead th')).map(header => header.innerText).slice(0, -1)]; const body = Array.from(table.querySelectorAll('tbody tr')).map(row => Array.from(row.querySelectorAll('td')).map(cell => cell.innerText).slice(0, -1)); doc.autoTable({ head: head, body: body, startY: 10, styles: { font: "Inter", fontSize: 8 }, headStyles: { fillColor: [41, 128, 186], textColor: 255, fontStyle: 'bold' } }); doc.save(`${filename}.pdf`); }
async function exportStatsToPDF() { const reportElement = document.getElementById('stats-content'); const canvas = await html2canvas(reportElement, { scale: 2 }); const imgData = canvas.toDataURL('image/png'); const pdf = new jsPDF('p', 'mm', 'a4'); const pdfWidth = pdf.internal.pageSize.getWidth(); const pdfHeight = (canvas.height * pdfWidth) / canvas.width; pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight); pdf.save("reporte-estadisticas.pdf"); }

// --- 5. CONFIGURACIÓN Y FUNCIONES DE RENDERIZADO ---
const inventoryCategoryConfig = { computers: { title: 'Computadores', titleSingular: 'Computador', fields: { brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, serial: { label: 'N/Serie', type: 'text' }, user: { label: 'Usuario', type: 'text' }, cpu: { label: 'CPU', type: 'text' }, ram: { label: 'RAM (GB)', type: 'text' }, storage: { label: 'Almacenamiento (GB)', type: 'text' }, os: { label: 'Sistema Operativo', type: 'text' }, licenciaWindows: { label: 'Licencia Windows', type: 'text' }, tipoOffice: { label: 'Tipo de Office', type: 'select', options: ['No Aplica', 'Microsoft 365', 'Office 2021', 'Office 2019', 'Otro'] }, licenciaOffice: { label: 'Licencia Office', type: 'text' }, sede: { label: 'Sede', type: 'select', optionsSource: 'locations' }, estado: { label: 'Estado', type: 'select', options: ['En Uso', 'En Bodega', 'De Baja', 'En Reparación'] }, observaciones: { label: 'Observaciones', type: 'textarea' } }}, phones: { title: 'Teléfonos', titleSingular: 'Teléfono', fields: { brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, serial: { label: 'N/Serie', type: 'text' }, imei: { label: 'IMEI', type: 'text' }, phoneNumber: { label: 'N/Teléfono', type: 'text' }, user: { label: 'Usuario', type: 'text' } }}, cameras: { title: 'Cámaras', titleSingular: 'Cámara', fields: { brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, serial: { label: 'N/Serie', type: 'text' }, ipAddress: { label: 'Dirección IP', type: 'text' }, location: { label: 'Ubicación Física', type: 'text' } }}, modems: { title: 'Módems', titleSingular: 'Módem', fields: { brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, serial: { label: 'N/Serie', type: 'text' }, serviceProvider: { label: 'Proveedor de Internet', type: 'text' } }}, communicators: { title: 'Comunicadores', titleSingular: 'Comunicador', fields: { brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, serial: { label: 'N/Serie', type: 'text' }, type: { label: 'Tipo (Satelital, Radio)', type: 'text' } }}, network: { title: 'Dispositivos de Red', titleSingular: 'Dispositivo de Red', fields: { type: { label: 'Tipo (Switch, Router, AP)', type: 'text' }, brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, ipAddress: { label: 'Dirección IP', type: 'text' }, location: { label: 'Ubicación Física', type: 'text' } }}, printers: { title: 'Impresoras', titleSingular: 'Impresora', fields: { brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, serial: { label: 'N/Serie', type: 'text' }, ipAddress: { label: 'Dirección IP', type: 'text' }, type: { label: 'Tipo (Láser, Tinta)', type: 'text' } }} };
const credentialsCategoryConfig = { emails: { title: 'Correos Electrónicos', titleSingular: 'Credencial de Correo', fields: { service: { label: 'Servicio (Google, O365)', type: 'text' }, email: { label: 'Correo Electrónico', type: 'email' }, password: { label: 'Contraseña', type: 'text' }, notes: { label: 'Notas (MFA, Recuperación)', type: 'textarea' } }}, computers: { title: 'Usuarios de Equipos', titleSingular: 'Usuario de Equipo', fields: { computerId: { label: 'ID/Nombre del Equipo', type: 'text' }, username: { label: 'Nombre de Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' }, isAdmin: { label: '¿Es Admin?', type: 'select', options: ['No', 'Sí'] } }}, phones: { title: 'Usuarios de Teléfonos', titleSingular: 'Usuario de Teléfono', fields: { phoneId: { label: 'ID/Modelo del Teléfono', type: 'text' }, user: { label: 'Usuario Asignado', type: 'text' }, pin: { label: 'PIN/Contraseña', type: 'text' } }}, internet: { title: 'Usuarios de Internet', titleSingular: 'Acceso a Internet', fields: { provider: { label: 'Proveedor (ISP)', type: 'text' }, accountId: { label: 'ID de Cuenta/Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' } }}, servers: { title: 'Servidores y BD', titleSingular: 'Acceso a Servidor/BD', fields: { host: { label: 'Host/IP', type: 'text' }, port: { label: 'Puerto', type: 'number' }, username: { label: 'Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' }, dbName: { label: 'Nombre BD (Opcional)', type: 'text' } }}, software: { title: 'Licencias de Software', titleSingular: 'Licencia de Software', fields: { softwareName: { label: 'Nombre del Software', type: 'text' }, licenseKey: { label: 'Clave de Licencia', type: 'textarea' }, version: { label: 'Versión', type: 'text' } }}, others: { title: 'Otras Credenciales', titleSingular: 'Credencial', fields: { system: { label: 'Sistema/Servicio', type: 'text' }, url: { label: 'URL (Opcional)', type: 'text' }, username: { label: 'Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' }, notes: { label: 'Notas', type: 'textarea' } }} };
function handleFirestoreError(error, element) {
    console.error("Firestore Error:", error);
    const table = element.closest('table');
    const colspan = table ? table.querySelector('thead tr').childElementCount : 6;

    const indexLinkRegex = /(https:\/\/console\.firebase\.google\.com\/project\/.*?\/firestore\/indexes\?create_composite=.*?)"/;
    const match = error.message.match(indexLinkRegex);

    let errorMessage;
    if (match) {
        const link = match[1];
        errorMessage = `
            <strong style="font-size: 1.1em;">Acción Requerida: Se necesita un índice en la base de datos.</strong>
            <br><br>
            Para que esta consulta funcione, debes crear un índice en Firebase. Es un proceso sencillo y seguro:
            <ol style="margin-left: 20px; text-align: left;">
                <li style="margin-bottom: 5px;">
                    <a href="${link}" target="_blank" style="color:blue; text-decoration:underline;">Haz clic en este enlace para abrir la consola de Firebase.</a>
                </li>
                <li style="margin-bottom: 5px;">En la página de Firebase, haz clic en el botón "Crear índice".</li>
                <li style="margin-bottom: 5px;">El índice comenzará a crearse. Este proceso puede tardar unos minutos.</li>
                <li>Una vez que el estado del índice sea "Habilitado", por favor, recarga esta página.</li>
            </ol>
            <br>
            Después de este paso, la sección cargará correctamente.
        `;
    } else {
        errorMessage = `Error al cargar los datos: ${error.message}`;
    }
    element.innerHTML = `<tr><td colspan="${colspan}" style="color:red; text-align:left; padding: 20px; line-height: 1.6;">${errorMessage}</td></tr>`;
}
async function renderDashboard(container) { container.innerHTML = dashboardHTML; const cardsContainer = document.getElementById('dashboard-cards'); cardsContainer.innerHTML = 'Cargando estadísticas...'; const ticketsSnapshot = await db.collection('tickets').get(); const tickets = ticketsSnapshot.docs.map(doc => doc.data()); const openCount = tickets.filter(t => t.status === 'abierto').length; const closedCount = tickets.filter(t => t.status === 'cerrado').length; const totalCount = tickets.length; cardsContainer.innerHTML = `<a href="#tickets?status=abierto" class="stat-card open"><div class="stat-number">${openCount}</div><div class="stat-label">Tickets Abiertos</div></a><a href="#tickets?status=cerrado" class="stat-card closed"><div class="stat-number">${closedCount}</div><div class="stat-label">Tickets Cerrados</div></a><a href="#tickets" class="stat-card all"><div class="stat-number">${totalCount}</div><div class="stat-label">Todos los Tickets</div></a>`; const last7Days = Array(7).fill(0).reduce((acc, _, i) => { const d = new Date(); d.setDate(d.getDate() - i); acc[d.toISOString().split('T')[0]] = 0; return acc; }, {}); tickets.forEach(ticket => { if (ticket.createdAt) { const ticketDate = ticket.createdAt.toDate().toISOString().split('T')[0]; if (last7Days.hasOwnProperty(ticketDate)) { last7Days[ticketDate]++; } } }); const ctx = document.getElementById('ticketsChart').getContext('2d'); new Chart(ctx, { type: 'bar', data: { labels: Object.keys(last7Days).map(d => new Date(d + 'T00:00:00').toLocaleDateString('es-ES', {day:'numeric', month:'short'})).reverse(), datasets: [{ label: '# de Tickets Creados', data: Object.values(last7Days).reverse(), backgroundColor: 'rgba(0, 123, 255, 0.5)', borderColor: 'rgba(0, 123, 255, 1)', borderWidth: 1 }] }, options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } } }); }
async function renderNewTicketForm(container) { container.innerHTML = newTicketFormHTML; const quill = new Quill('#description-editor', { theme: 'snow', placeholder: 'Detalla el problema o solicitud...' }); const requesterSelect = document.getElementById('requester'); const locationSelect = document.getElementById('location'); const deviceDatalist = document.getElementById('device-list'); const [reqSnap, locSnap, invSnap] = await Promise.all([ db.collection('requesters').orderBy('name').get(), db.collection('locations').orderBy('name').get(), db.collection('inventory').get() ]); requesterSelect.innerHTML = '<option value="">Selecciona un solicitante</option>'; reqSnap.forEach(doc => requesterSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`); locationSelect.innerHTML = '<option value="">Selecciona una ubicación</option>'; locSnap.forEach(doc => locationSelect.innerHTML += `<option value="${doc.data().name}">${doc.data().name}</option>`); const devices = invSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })); deviceDatalist.innerHTML = devices.map(d => `<option value="${d.id}">${d.brand} ${d.model} (Serie: ${d.serial || d.imei || 'N/A'})</option>`).join(''); const form = document.getElementById('new-ticket-form'); form.addEventListener('submit', async (e) => { e.preventDefault(); const counterRef = db.collection('counters').doc('ticketCounter'); try { const newTicketNumber = await db.runTransaction(async (transaction) => { const counterDoc = await transaction.get(counterRef); if (!counterDoc.exists) { throw "El documento contador de tickets no existe. Créalo en Firebase."; } const newNumber = counterDoc.data().currentNumber + 1; transaction.update(counterRef, { currentNumber: newNumber }); return newNumber; }); const deviceId = document.getElementById('device-search').value; await db.collection('tickets').add({ ticketNumber: newTicketNumber, title: form.title.value, description: quill.root.innerHTML, requesterId: form.requester.value, locationId: form.location.value, priority: form.priority.value, status: 'abierto', solution: null, deviceId: deviceId || null, createdAt: firebase.firestore.FieldValue.serverTimestamp(), closedAt: null }); alert(`¡Ticket #${newTicketNumber} creado con éxito!`); window.location.hash = '#tickets?status=abierto'; } catch (error) { console.error("Error al crear el ticket: ", error); alert("No se pudo crear el ticket. Revisa la consola para más detalles."); } }); }
async function renderTicketList(container, params = {}) { container.innerHTML = ticketListHTML; const [reqSnap] = await Promise.all([ db.collection('requesters').get() ]); const requestersMap = {}; reqSnap.forEach(doc => requestersMap[doc.id] = doc.data().name); const tableBody = document.querySelector('#data-table tbody'); const tableTitle = document.getElementById('tickets-list-title'); const filterStatus = params.status; let query = db.collection('tickets'); if (filterStatus) { query = query.where('status', '==', filterStatus); tableTitle.innerText = `Tickets ${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}s`; } else { tableTitle.innerText = 'Todos los Tickets'; } query.orderBy('ticketNumber', 'desc').onSnapshot(snapshot => { tableBody.innerHTML = ''; if (snapshot.empty) { tableBody.innerHTML = `<tr><td colspan="6">No hay tickets que coincidan con este filtro.</td></tr>`; return; } snapshot.forEach(doc => { const ticket = { id: doc.id, ...doc.data() }; const tr = document.createElement('tr'); tr.innerHTML = `<td>${ticket.ticketNumber || 'N/A'}</td><td>${ticket.title}</td><td>${requestersMap[ticket.requesterId] || 'N/A'}</td><td>${ticket.locationId || 'N/A'}</td><td><span class="status status-${ticket.status}">${ticket.status}</span></td><td><button class="primary view-ticket-btn" data-id="${ticket.id}">Ver Detalles</button></td>`; tableBody.appendChild(tr); }); }, error => handleFirestoreError(error, tableBody)); }
async function renderHistoryPage(container) { container.innerHTML = historyPageHTML; const form = document.getElementById('history-search-form'); const deviceDatalist = document.getElementById('device-list-search'); const requesterSelect = document.getElementById('search-requester'); const locationSelect = document.getElementById('search-location'); const resultsTableBody = document.getElementById('data-table').querySelector('tbody'); const [reqSnap, locSnap, invSnap] = await Promise.all([ db.collection('requesters').orderBy('name').get(), db.collection('locations').orderBy('name').get(), db.collection('inventory').get() ]); reqSnap.forEach(doc => requesterSelect.innerHTML += `<option value="${doc.id}">${doc.data().name}</option>`); locSnap.forEach(doc => locationSelect.innerHTML += `<option value="${doc.data().name}">${doc.data().name}</option>`); const devices = invSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })); deviceDatalist.innerHTML = devices.map(d => `<option value="${d.id}">${d.brand} ${d.model} (Serie: ${d.serial || d.imei || 'N/A'})</option>`).join(''); form.addEventListener('submit', async e => { e.preventDefault(); const filters = { deviceId: form['search-device'].value, requesterId: form['search-requester'].value, locationId: form['search-location'].value, status: form['search-status'].value, priority: form['search-priority'].value, }; let query = db.collection('tickets'); Object.entries(filters).forEach(([key, value]) => { if (value) { query = query.where(key, '==', value); } }); try { const snapshot = await query.orderBy('ticketNumber', 'desc').get(); const requestersMap = {}; reqSnap.forEach(doc => requestersMap[doc.id] = doc.data().name); resultsTableBody.innerHTML = ''; if (snapshot.empty) { resultsTableBody.innerHTML = `<tr><td colspan="6">No se encontraron tickets con esos criterios.</td></tr>`; return; } snapshot.forEach(doc => { const ticket = { id: doc.id, ...doc.data() }; const tr = document.createElement('tr'); tr.innerHTML = `<td>${ticket.ticketNumber || 'N/A'}</td><td>${ticket.title}</td><td>${requestersMap[ticket.requesterId] || 'N/A'}</td><td>${ticket.createdAt.toDate().toLocaleDateString('es-ES')}</td><td><span class="status status-${ticket.status}">${ticket.status}</span></td><td><button class="primary view-ticket-btn" data-id="${ticket.id}">Ver</button></td>`; resultsTableBody.appendChild(tr); }); } catch(error) { handleFirestoreError(error, resultsTableBody); } }); }
async function renderEstadisticas(container) { container.innerHTML = statisticsHTML; const generateBtn = document.getElementById('generate-report-btn'); document.getElementById('export-stats-pdf').addEventListener('click', exportStatsToPDF); let charts = {}; const chartContexts = { ticketsByPriority: document.getElementById('ticketsByPriorityChart').getContext('2d'), ticketsByDeviceCategory: document.getElementById('ticketsByDeviceCategoryChart').getContext('2d'), ticketFlow: document.getElementById('ticket-flow-chart').getContext('2d'), inventoryByCategory: document.getElementById('inventoryByCategoryChart').getContext('2d'), computersByOs: document.getElementById('computersByOsChart').getContext('2d') }; const topDevicesList = document.getElementById('top-devices-list'); const topRequestersList = document.getElementById('top-requesters-list'); const startDateInput = document.getElementById('start-date'); const endDateInput = document.getElementById('end-date'); const today = new Date(); const oneMonthAgo = new Date(new Date().setMonth(today.getMonth() - 1)); startDateInput.value = oneMonthAgo.toISOString().split('T')[0]; endDateInput.value = today.toISOString().split('T')[0]; const generateReports = async () => { const startDate = new Date(startDateInput.value); startDate.setHours(0, 0, 0, 0); const endDate = new Date(endDateInput.value); endDate.setHours(23, 59, 59, 999); try { const [ticketsSnapshot, inventorySnapshot, requestersSnapshot] = await Promise.all([ db.collection('tickets').where('createdAt', '>=', startDate).where('createdAt', '<=', endDate).get(), db.collection('inventory').get(), db.collection('requesters').get() ]); const tickets = ticketsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); const inventory = inventorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); const requestersMap = {}; requestersSnapshot.forEach(doc => requestersMap[doc.id] = doc.data().name); const priorityCounts = tickets.reduce((acc, ticket) => { acc[ticket.priority] = (acc[ticket.priority] || 0) + 1; return acc; }, {}); if (charts.ticketsByPriority) charts.ticketsByPriority.destroy(); charts.ticketsByPriority = new Chart(chartContexts.ticketsByPriority, { type: 'doughnut', data: { labels: Object.keys(priorityCounts), datasets: [{ data: Object.values(priorityCounts), backgroundColor: ['#007bff', '#ffc107', '#dc3545'] }] }, options: { responsive: true, maintainAspectRatio: false } }); const inventoryMap = {}; inventory.forEach(item => inventoryMap[item.id] = item); const ticketsWithDeviceCategory = tickets.map(ticket => ({...ticket, deviceCategory: ticket.deviceId ? (inventoryMap[ticket.deviceId]?.category || 'Sin categoría') : 'Sin dispositivo'})); const deviceCategoryCounts = ticketsWithDeviceCategory.reduce((acc, ticket) => { acc[ticket.deviceCategory] = (acc[ticket.deviceCategory] || 0) + 1; return acc; }, {}); if (charts.ticketsByDeviceCategory) charts.ticketsByDeviceCategory.destroy(); charts.ticketsByDeviceCategory = new Chart(chartContexts.ticketsByDeviceCategory, { type: 'pie', data: { labels: Object.keys(deviceCategoryCounts).map(k => inventoryCategoryConfig[k]?.title || k), datasets: [{ data: Object.values(deviceCategoryCounts), backgroundColor: ['#007bff', '#17a2b8', '#ffc107', '#6c757d', '#28a745', '#dc3545', '#343a40'] }] }, options: { responsive: true, maintainAspectRatio: false } }); const deviceTicketCounts = tickets.reduce((acc, ticket) => { if(ticket.deviceId) acc[ticket.deviceId] = (acc[ticket.deviceId] || 0) + 1; return acc; }, {}); const topDevices = Object.entries(deviceTicketCounts).sort((a, b) => b[1] - a[1]).slice(0, 5); topDevicesList.innerHTML = topDevices.map(([id, count]) => { const device = inventoryMap[id]; return `<li><span>${device ? `${device.brand} ${device.model}` : id}</span><span>${count}</span></li>`; }).join('') || '<li>No hay datos</li>'; const requesterTicketCounts = tickets.reduce((acc, ticket) => { if(ticket.requesterId) acc[ticket.requesterId] = (acc[ticket.requesterId] || 0) + 1; return acc; }, {}); const topRequesters = Object.entries(requesterTicketCounts).sort((a, b) => b[1] - a[1]).slice(0, 5); topRequestersList.innerHTML = topRequesters.map(([id, count]) => `<li><span>${requestersMap[id] || id}</span><span>${count}</span></li>`).join('') || '<li>No hay datos</li>'; const closedTicketsSnapshot = await db.collection('tickets').where('closedAt', '>=', startDate).where('closedAt', '<=', endDate).get(); const closedTicketsInRange = closedTicketsSnapshot.docs.map(doc => doc.data()); const dataByDay = {}; for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) { dataByDay[d.toISOString().split('T')[0]] = { created: 0, closed: 0 }; } tickets.forEach(t => { const day = t.createdAt.toDate().toISOString().split('T')[0]; if (dataByDay[day]) dataByDay[day].created++; }); closedTicketsInRange.forEach(t => { const day = t.closedAt.toDate().toISOString().split('T')[0]; if (dataByDay[day]) dataByDay[day].closed++; }); if (charts.ticketFlow) charts.ticketFlow.destroy(); charts.ticketFlow = new Chart(chartContexts.ticketFlow, { type: 'line', data: { labels: Object.keys(dataByDay), datasets: [ { label: 'Tickets Creados', data: Object.values(dataByDay).map(d => d.created), borderColor: '#007bff', fill: true }, { label: 'Tickets Cerrados', data: Object.values(dataByDay).map(d => d.closed), borderColor: '#28a745', fill: true } ] }, options: { scales: { y: { beginAtZero: true } } } }); const categoryCounts = inventory.reduce((acc, item) => { acc[item.category] = (acc[item.category] || 0) + 1; return acc; }, {}); if (charts.inventoryByCategory) charts.inventoryByCategory.destroy(); charts.inventoryByCategory = new Chart(chartContexts.inventoryByCategory, { type: 'bar', data: { labels: Object.keys(categoryCounts).map(k => inventoryCategoryConfig[k]?.title || k), datasets: [{ label: '# de Dispositivos', data: Object.values(categoryCounts), backgroundColor: '#007bff' }] }, options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false } }); const computers = inventory.filter(item => item.category === 'computers'); const osCounts = computers.reduce((acc, item) => { acc[item.os] = (acc[item.os] || 0) + 1; return acc; }, {}); if (charts.computersByOs) charts.computersByOs.destroy(); charts.computersByOs = new Chart(chartContexts.computersByOs, { type: 'pie', data: { labels: Object.keys(osCounts), datasets: [{ data: Object.values(osCounts), backgroundColor: ['#007bff', '#17a2b8', '#ffc107', '#6c757d', '#28a745', '#dc3545'] }] }, options: { responsive: true, maintainAspectRatio: false } }); } catch(error) { handleFirestoreError(error, container); }}; generateBtn.addEventListener('click', generateReports); generateReports(); }
function renderGenericListPage(container, params, configObject, collectionName, icon) { container.innerHTML = genericListPageHTML; const category = params.category; const config = configObject[category]; if (!config) { container.innerHTML = `<h1>Error: Categoría no encontrada.</h1>`; return; } const iconEdit = `<svg class="icon-edit" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`; const iconDelete = `<svg class="icon-delete" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`; document.getElementById('page-title').innerText = `${icon} ${config.title}`; document.getElementById('item-list-title').innerText = `Lista de ${config.title}`; const addButton = document.getElementById('add-item-btn'); addButton.innerText = `Añadir ${config.titleSingular}`; addButton.dataset.type = collectionName; addButton.dataset.category = category; const tableHeadContainer = document.getElementById('item-table-head'); const tableHeaders = Object.values(config.fields).map(field => field.label); tableHeadContainer.innerHTML = `<tr>${tableHeaders.map(h => `<th>${h}</th>`).join('')}<th>Acciones</th></tr>`; const tableBody = document.getElementById('item-table-body'); db.collection(collectionName).where('category', '==', category).onSnapshot(snapshot => { tableBody.innerHTML = ''; snapshot.forEach(doc => { const item = { id: doc.id, ...doc.data() }; const tr = document.createElement('tr'); tr.dataset.id = item.id; let cellsHTML = ''; for (const key of Object.keys(config.fields)) { cellsHTML += `<td data-field="${key}"><span class="cell-text">${item[key] || 'N/A'}</span></td>`; } tr.innerHTML = `${cellsHTML}<td><div class="config-item-actions"><span class="edit-btn" data-id="${item.id}" data-collection="${collectionName}" data-category="${category}">${iconEdit}</span><span class="delete-btn" data-id="${item.id}" data-collection="${collectionName}">${iconDelete}</span></div></td>`; tableBody.appendChild(tr); }); }, error => handleFirestoreError(error, tableBody)); }
function renderMaintenanceCalendar(container) { container.innerHTML = maintenanceCalendarHTML; const calendarEl = document.getElementById('maintenance-calendar'); const dataTable = document.getElementById('data-table'); db.collection('maintenance').where('status', 'in', ['planificada', 'completada']).onSnapshot(snapshot => { const eventColors = { 'Preventivo': '#dc3545', 'Correctivo': '#ffc107', 'Tarea': '#007bff', 'Recordatorio': '#17a2b8' }; const events = snapshot.docs.map(doc => { const data = doc.data(); let color = eventColors[data.type] || '#6c757d'; if (data.status === 'completada') color = '#28a745'; return { id: doc.id, title: data.task, start: data.date, color: color, extendedProps: { status: data.status, ...data } }; }); const calendar = new FullCalendar.Calendar(calendarEl, { headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek' }, initialView: 'dayGridMonth', locale: 'es', buttonText: { today: 'hoy', month: 'mes', week: 'semana', day: 'día', list: 'agenda' }, events: events, eventClick: function(info) { showEventActionChoiceModal(info.event.id, info.event.title, info.event.extendedProps); } }); calendar.render(); const tableHeaders = ['Tarea', 'Fecha Programada', 'Tipo', 'Estado']; const tableRows = snapshot.docs.map(doc => { const data = doc.data(); return [data.task, data.date, data.type, data.status]; }); dataTable.innerHTML = `<thead><tr>${tableHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${tableRows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>`; }, error => handleFirestoreError(error, calendarEl)); }
function renderConfiguracion(container) { container.innerHTML = configHTML; const setupConfigSection = (type, collectionName) => { const form = document.getElementById(`add-${type}-form`); const input = document.getElementById(`${type}-name`); const list = document.getElementById(`${type}s-list`); const iconEdit = `<svg class="icon-edit" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`; const iconDelete = `<svg class="icon-delete" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`; form.addEventListener('submit', e => { e.preventDefault(); const name = input.value.trim(); if (name) { db.collection(collectionName).add({ name }).then(() => form.reset()); } }); db.collection(collectionName).orderBy('name').onSnapshot(snapshot => { list.innerHTML = ''; snapshot.forEach(doc => { const item = { id: doc.id, ...doc.data() }; const li = document.createElement('li'); li.className = 'config-list-item'; li.innerHTML = `<span class="config-item-name">${item.name}</span><div class="config-item-actions"><span class="edit-btn" data-collection="${collectionName}" data-id="${item.id}">${iconEdit}</span><span class="delete-btn" data-id="${item.id}" data-collection="${collectionName}">${iconDelete}</span></div>`; list.appendChild(li); }); }); }; setupConfigSection('requester', 'requesters'); setupConfigSection('location', 'locations'); }

// --- 5. ROUTER Y LÓGICA PRINCIPAL ---
const appContent = document.getElementById('app-content');
const navLinks = document.querySelectorAll('.nav-link');
const routes = { '#dashboard': renderDashboard, '#crear-ticket': renderNewTicketForm, '#tickets': renderTicketList, '#historial': renderHistoryPage, '#estadisticas': renderEstadisticas, '#maintenance': renderMaintenanceCalendar, '#configuracion': renderConfiguracion };
function router() { const fullHash = window.location.hash || '#dashboard'; const [path, queryString] = fullHash.split('?'); const params = new URLSearchParams(queryString); document.querySelectorAll('.nav-item-with-submenu').forEach(item => item.classList.remove('open')); let isHandled = false; if (path.startsWith('#inventory-')) { const category = path.replace('#inventory-', ''); params.set('category', category); renderGenericListPage(appContent, Object.fromEntries(params.entries()), inventoryCategoryConfig, 'inventory', '💻'); const parentLink = document.querySelector('a[href="#inventory-computers"]').closest('.nav-item-with-submenu'); if(parentLink) parentLink.parentElement.classList.add('open'); isHandled = true; } if (path.startsWith('#credentials-')) { const category = path.replace('#credentials-', ''); params.set('category', category); renderGenericListPage(appContent, Object.fromEntries(params.entries()), credentialsCategoryConfig, 'credentials', '🔑'); const parentLink = document.querySelector('a[href="#credentials-emails"]').closest('.nav-item-with-submenu'); if(parentLink) parentLink.parentElement.classList.add('open'); isHandled = true; } if(isHandled) { navLinks.forEach(link => link.classList.remove('active')); const activeParent = document.querySelector('.nav-item-with-submenu.open > a'); if(activeParent) activeParent.classList.add('active'); return; } const paramsObj = Object.fromEntries(params.entries()); const renderFunction = routes[path]; if (renderFunction) { appContent.innerHTML = '<div class="card"><h1>Cargando...</h1></div>'; renderFunction(appContent, paramsObj); navLinks.forEach(link => { const linkPath = link.getAttribute('href').split('?')[0]; link.classList.toggle('active', linkPath === path); }); } else { appContent.innerHTML = '<h1>404 - Página no encontrada</h1>'; } }
async function showFormModal(type, category = null) { const formModal = document.getElementById('form-modal'); const modalBody = formModal.querySelector('#form-modal-body'); let formHTML = '', title = '', collectionName = '', formId = 'modal-form'; let configObject, config; switch (type) { case 'inventory': case 'credentials': configObject = type === 'inventory' ? inventoryCategoryConfig : credentialsCategoryConfig; config = configObject[category]; title = `Añadir ${config.titleSingular}`; collectionName = type; let fieldsHTML = ''; for (const [key, field] of Object.entries(config.fields)) { let inputHTML = `<input type="${field.type || 'text'}" id="form-${key}" name="${key}" required>`; if (field.type === 'textarea') inputHTML = `<textarea id="form-${key}" name="${key}" rows="3"></textarea>`; else if (field.type === 'select') { let optionsHTML = '<option value="">Selecciona...</option>'; if (field.optionsSource === 'locations') { const locSnap = await db.collection('locations').orderBy('name').get(); optionsHTML += locSnap.docs.map(doc => `<option value="${doc.data().name}">${doc.data().name}</option>`).join(''); } else { optionsHTML += field.options.map(opt => `<option value="${opt}">${opt}</option>`).join(''); } inputHTML = `<select id="form-${key}" name="${key}">${optionsHTML}</select>`; } fieldsHTML += `<div class="form-group"><label for="form-${key}">${field.label}</label>${inputHTML}</div>`; } formHTML = `<div class="inventory-form-grid">${fieldsHTML}</div>`; break; case 'maintenance': title = 'Programar Tarea en Calendario'; collectionName = 'maintenance'; formHTML = `<div class="form-group"><label for="form-task">Título de la Tarea</label><input type="text" id="form-task" name="task" required></div><div class="form-group"><label for="form-date">Fecha</label><input type="date" id="form-date" name="date" required></div><div class="form-group"><label for="form-type">Tipo de Tarea</label><select id="form-type" name="type"><option value="Preventivo">Mantenimiento Preventivo</option><option value="Correctivo">Mantenimiento Correctivo</option><option value="Tarea">Tarea</option><option value="Recordatorio">Recordatorio</option></select></div>`; break; } modalBody.innerHTML = `<h2>${title}</h2><form id="${formId}">${formHTML}<div style="text-align:right; margin-top:20px;"><button type="submit" class="primary">Guardar</button></div></form>`; formModal.classList.remove('hidden'); document.getElementById(formId).addEventListener('submit', e => { e.preventDefault(); const form = e.target; const data = {}; if (type === 'maintenance') data.status = 'planificada'; if (type === 'inventory' || type === 'credentials') data.category = category; new FormData(form).forEach((value, key) => { data[key] = value; }); db.collection(collectionName).add(data).then(() => { formModal.classList.add('hidden'); }).catch(error => { console.error("Error al guardar: ", error); alert("Hubo un error al guardar los datos."); }); }); }
async function showTicketModal(ticketId) { const ticketModal = document.getElementById('ticket-modal'); const modalBody = ticketModal.querySelector('#modal-body'); const ticketDoc = await db.collection('tickets').doc(ticketId).get(); if (!ticketDoc.exists) { alert('Error: No se encontró el ticket.'); return; } const ticket = ticketDoc.data(); const requesterName = ticket.requesterId ? (await db.collection('requesters').doc(ticket.requesterId).get()).data()?.name || 'N/A' : 'N/A'; const locationName = ticket.locationId || 'N/A'; let deviceInfoHTML = ''; if (ticket.deviceId) { const deviceDoc = await db.collection('inventory').doc(ticket.deviceId).get(); if(deviceDoc.exists) { const device = deviceDoc.data(); deviceInfoHTML = `<div class="ticket-detail-item"><strong>Dispositivo:</strong> ${device.brand} ${device.model} (S/N: ${device.serial || device.imei || 'N/A'})</div>`; } } let solutionHTML = `<hr><h3>Añadir Solución</h3><form id="solution-form"><div class="form-group"><div id="solution-editor"></div></div><button type="submit" class="primary">Guardar Solución y Cerrar</button></form>`; if (ticket.status === 'cerrado') { solutionHTML = `<hr><h3>Solución Aplicada</h3><div class="card">${ticket.solution || 'No se especificó solución.'}</div>`; } modalBody.innerHTML = `<div class="ticket-modal-layout"><div class="ticket-modal-main"><h2>Ticket #${ticket.ticketNumber || ticket.id.substring(0,6)}: ${ticket.title}</h2><hr><h3>Descripción</h3><div class="card">${ticket.description}</div>${solutionHTML}</div><div class="ticket-modal-sidebar"><h3>Detalles del Ticket</h3><div class="ticket-detail-item"><strong>Estado:</strong> <span class="status status-${ticket.status}">${ticket.status}</span></div><div class="ticket-detail-item"><strong>Prioridad:</strong> ${ticket.priority}</div><div class="ticket-detail-item"><strong>Solicitante:</strong> ${requesterName}</div><div class="ticket-detail-item"><strong>Ubicación:</strong> ${locationName}</div>${deviceInfoHTML}<div class="ticket-detail-item"><strong>Creado:</strong> ${ticket.createdAt.toDate().toLocaleString('es-ES')}</div>${ticket.closedAt ? `<div class="ticket-detail-item"><strong>Cerrado:</strong> ${ticket.closedAt.toDate().toLocaleString('es-ES')}</div>` : ''}</div></div>`; ticketModal.classList.remove('hidden'); if (ticket.status !== 'cerrado') { const solutionEditor = new Quill('#solution-editor', { theme: 'snow', placeholder: 'Describe la solución aplicada...' }); document.getElementById('solution-form').addEventListener('submit', e => { e.preventDefault(); db.collection('tickets').doc(ticketId).update({ solution: solutionEditor.root.innerHTML, status: 'cerrado', closedAt: firebase.firestore.FieldValue.serverTimestamp() }).then(() => ticketModal.classList.add('hidden')); }); } }

function showEventActionChoiceModal(eventId, eventTitle, eventProps) {
    const actionModal = document.getElementById('action-modal');
    const modalBody = actionModal.querySelector('#action-modal-body');
    let completedInfo = '';
    if (eventProps.status === 'completada') {
        completedInfo = `<hr><h4>Información de Finalización</h4><p><strong>Fecha:</strong> ${new Date(eventProps.completedDate + 'T00:00:00').toLocaleDateString('es-ES')}</p><p><strong>A tiempo:</strong> ${eventProps.onTimeStatus}</p><p><strong>Observaciones:</strong> ${eventProps.completionNotes || 'N/A'}</p>`;
    }
    const actionButtons = eventProps.status === 'planificada' ?
        `<div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 10px; margin-top: 20px;">
            <button class="primary" id="edit-task-btn" style="background-color: #ffc107; color: #212529;">✏️ Editar Tarea</button>
            <button class="primary" id="finalize-task-btn">✅ Finalizar Tarea</button>
            <button class="danger" id="delete-task-btn">🗑️ Eliminar</button>
         </div>` : '';
    modalBody.innerHTML = `<h2>${eventTitle}</h2><p><strong>Estado:</strong> ${eventProps.status}</p>${completedInfo}${actionButtons}`;
    actionModal.classList.remove('hidden');

    if (eventProps.status === 'planificada') {
        document.getElementById('edit-task-btn').onclick = () => {
            actionModal.classList.add('hidden');
            showEditTaskModal(eventId, eventProps);
        };
        document.getElementById('finalize-task-btn').onclick = () => {
            actionModal.classList.add('hidden');
            showFinalizeTaskModal(eventId, eventTitle);
        };
        document.getElementById('delete-task-btn').onclick = () => {
            if (confirm(`¿Estás seguro de que quieres ELIMINAR permanentemente la tarea "${eventTitle}"? Esta acción no se puede deshacer.`)) {
                db.collection('maintenance').doc(eventId).delete().then(() => {
                    actionModal.classList.add('hidden');
                }).catch(error => {
                    console.error("Error al eliminar la tarea: ", error);
                    alert("No se pudo eliminar la tarea.");
                });
            }
        };
    }
}

function showEditTaskModal(eventId, eventProps) {
    const formModal = document.getElementById('form-modal');
    const modalBody = formModal.querySelector('#form-modal-body');
    const title = 'Editar Tarea Programada';
    const formId = 'edit-maintenance-form';

    const taskTitle = eventProps.task || '';
    const taskDate = eventProps.date || '';
    const taskType = eventProps.type || 'Tarea';

    let formHTML = `
        <div class="form-group">
            <label for="form-task">Título de la Tarea</label>
            <input type="text" id="form-task" name="task" value="${taskTitle}" required>
        </div>
        <div class="form-group">
            <label for="form-date">Fecha</label>
            <input type="date" id="form-date" name="date" value="${taskDate}" required>
        </div>
        <div class="form-group">
            <label for="form-type">Tipo de Tarea</label>
            <select id="form-type" name="type">
                <option value="Preventivo" ${taskType === 'Preventivo' ? 'selected' : ''}>Mantenimiento Preventivo</option>
                <option value="Correctivo" ${taskType === 'Correctivo' ? 'selected' : ''}>Mantenimiento Correctivo</option>
                <option value="Tarea" ${taskType === 'Tarea' ? 'selected' : ''}>Tarea</option>
                <option value="Recordatorio" ${taskType === 'Recordatorio' ? 'selected' : ''}>Recordatorio</option>
            </select>
        </div>
    `;

    modalBody.innerHTML = `<h2>${title}</h2><form id="${formId}">${formHTML}<div style="text-align:right; margin-top:20px;"><button type="submit" class="primary">Guardar Cambios</button></div></form>`;
    formModal.classList.remove('hidden');

    document.getElementById(formId).addEventListener('submit', e => {
        e.preventDefault();
        const form = e.target;
        const data = {};
        new FormData(form).forEach((value, key) => {
            data[key] = value;
        });

        db.collection('maintenance').doc(eventId).update(data)
            .then(() => {
                formModal.classList.add('hidden');
                router(); 
            })
            .catch(error => {
                console.error("Error al actualizar la tarea: ", error);
                alert("Hubo un error al actualizar los datos.");
            });
    });
}

function showFinalizeTaskModal(eventId, eventTitle) { const actionModal = document.getElementById('action-modal'); const modalBody = actionModal.querySelector('#action-modal-body'); const today = new Date().toISOString().split('T')[0]; modalBody.innerHTML = `<h2>Finalizar Tarea: "${eventTitle}"</h2><form id="finalize-form"><div class="form-group"><label for="completedDate">Fecha de Realización</label><input type="date" id="completedDate" name="completedDate" value="${today}" required></div><div class="form-group"><label for="onTimeStatus">¿Se realizó a tiempo?</label><select id="onTimeStatus" name="onTimeStatus"><option value="Sí">Sí</option><option value="No">No</option></select></div><div class="form-group"><label>Observaciones (opcional)</label><textarea name="completionNotes" rows="3"></textarea></div><div style="text-align: right; margin-top: 20px;"><button type="submit" class="primary">Guardar Finalización</button></div></form>`; actionModal.classList.remove('hidden'); document.getElementById('finalize-form').addEventListener('submit', async (e) => { e.preventDefault(); const form = e.target; form.querySelector('button[type="submit"]').disabled = true; try { const updateData = { status: 'completada', completedDate: form.completedDate.value, onTimeStatus: form.onTimeStatus.value, completionNotes: form.completionNotes.value }; await db.collection('maintenance').doc(eventId).set(updateData, { merge: true }); actionModal.classList.add('hidden'); } catch (error) { console.error("Error al finalizar la tarea: ", error); alert("Hubo un error al finalizar la tarea. Revisa la consola para más detalles."); form.querySelector('button[type="submit"]').disabled = false; } }); }
function showCancelTaskModal(eventId, eventTitle) { const actionModal = document.getElementById('action-modal'); const modalBody = actionModal.querySelector('#action-modal-body'); modalBody.innerHTML = `<h2>Cancelar Tarea: "${eventTitle}"</h2><form id="cancel-form"><div class="form-group"><label for="cancellationReason">Razón de la Cancelación</label><textarea id="cancellationReason" name="cancellationReason" rows="4" required></textarea></div><div style="text-align: right; margin-top: 20px;"><button type="submit" class="danger">Confirmar Cancelación</button></div></form>`; actionModal.classList.remove('hidden'); document.getElementById('cancel-form').addEventListener('submit', e => { e.preventDefault(); const reason = e.target.cancellationReason.value; db.collection('maintenance').doc(eventId).update({ status: 'cancelada', cancellationReason: reason }).then(() => actionModal.classList.add('hidden')); }); }

// --- 6. AUTENTICACIÓN Y PUNTO DE ENTRADA ---
document.addEventListener('DOMContentLoaded', () => {
    const appContent = document.getElementById('app-content');
    const ticketModal = document.getElementById('ticket-modal');
    const formModal = document.getElementById('form-modal');
    const actionModal = document.getElementById('action-modal');

    appContent.addEventListener('click', e => {
        const target = e.target.closest('button, span.edit-btn, span.delete-btn');
        if (!target) return;

        if (target.matches('.delete-btn, .delete-btn *')) {
            const button = target.closest('.delete-btn');
            const id = button.dataset.id;
            const collection = button.dataset.collection;
            if (confirm(`¿Seguro que quieres eliminar este elemento?`)) {
                db.collection(collection).doc(id).delete();
            }
            return;
        }

        if (target.matches('.edit-btn, .edit-btn *')) {
            const button = target.closest('.edit-btn');
            const row = button.closest('tr, .config-list-item');
            if (row.classList.contains('is-editing')) return;
            row.classList.add('is-editing');
            const docId = button.dataset.id;
            const collectionName = button.dataset.collection;
            const category = button.dataset.category;
            let config;
            if (collectionName === 'inventory' || collectionName === 'credentials') {
                config = collectionName === 'inventory' ? inventoryCategoryConfig[category] : credentialsCategoryConfig[category];
            } else {
                config = { fields: { name: { label: 'Nombre' } } };
            }
            row.querySelectorAll('td[data-field], span.config-item-name').forEach(cell => {
                const fieldKey = cell.dataset.field || 'name';
                const fieldConfig = config.fields[fieldKey] || {};
                const currentText = cell.textContent;
                cell.dataset.originalValue = currentText;
                if (fieldConfig.type === 'select') {
                    let optionsHTML = '';
                    if (fieldConfig.optionsSource === 'locations') {
                        db.collection('locations').orderBy('name').get().then(snap => {
                            snap.forEach(doc => {
                                optionsHTML += `<option value="${doc.data().name}" ${doc.data().name === currentText ? 'selected' : ''}>${doc.data().name}</option>`;
                            });
                            cell.innerHTML = `<select class="edit-input" data-field="${fieldKey}">${optionsHTML}</select>`;
                        });
                    } else {
                        optionsHTML = fieldConfig.options.map(opt => `<option value="${opt}" ${opt === currentText ? 'selected' : ''}>${opt}</option>`).join('');
                        cell.innerHTML = `<select class="edit-input" data-field="${fieldKey}">${optionsHTML}</select>`;
                    }
                } else {
                    cell.innerHTML = `<input type="text" class="edit-input" value="${currentText}" data-field="${fieldKey}" />`;
                }
            });
            const actionsCell = row.querySelector('.config-item-actions');
            const originalActionsHTML = actionsCell.innerHTML;
            actionsCell.innerHTML = `<span class="save-btn" style="cursor:pointer; font-size: 20px;">💾</span> <span class="cancel-btn" style="cursor:pointer; font-size: 20px;">↩️</span>`;
            const saveChanges = () => {
                const updates = {};
                row.querySelectorAll('.edit-input').forEach(input => {
                    updates[input.dataset.field] = input.value;
                });
                db.collection(collectionName).doc(docId).update(updates).catch(err => console.error("Error al guardar:", err));
            };
            const cancelChanges = () => {
                row.querySelectorAll('td[data-field], span.config-item-name').forEach(cell => {
                    cell.innerHTML = `<span class="cell-text">${cell.dataset.originalValue}</span>`;
                });
                actionsCell.innerHTML = originalActionsHTML;
                row.classList.remove('is-editing');
            };
            actionsCell.querySelector('.save-btn').onclick = saveChanges;
            actionsCell.querySelector('.cancel-btn').onclick = cancelChanges;
            return;
        }

        if (target.closest('button')?.classList.contains('view-ticket-btn')) {
            const id = target.closest('button').dataset.id;
            showTicketModal(id);
        }

        if (target.closest('button')?.classList.contains('open-form-modal-btn') || target.id === 'add-item-btn') {
            const button = target.closest('button');
            const type = button.dataset.type;
            const category = button.dataset.category;
            showFormModal(type, category);
        }

        if (target.closest('button')?.classList.contains('export-btn')) {
            const format = target.dataset.format;
            const table = document.getElementById('data-table');

            if (!table) {
                alert("Error: No se pudo encontrar la tabla con ID 'data-table' para exportar.");
                return;
            }

            const tableId = table.id;
            const filename = document.getElementById('page-title')?.textContent || document.querySelector('h1').textContent || 'reporte';

            if (format === 'csv') {
                exportToCSV(tableId, filename);
            } else if (format === 'pdf') {
                exportToPDF(tableId, filename);
            }
        }
    });

    ticketModal.querySelector('.modal-close-btn').addEventListener('click', () => ticketModal.classList.add('hidden'));
    formModal.querySelector('.modal-close-btn').addEventListener('click', () => formModal.classList.add('hidden'));
    actionModal.querySelector('.modal-close-btn').addEventListener('click', () => actionModal.classList.add('hidden'));
    ticketModal.addEventListener('click', e => { if (e.target === ticketModal) ticketModal.classList.add('hidden'); });
    formModal.addEventListener('click', e => { if (e.target === formModal) formModal.classList.add('hidden'); });
    actionModal.addEventListener('click', e => { if (e.target === actionModal) actionModal.classList.add('hidden'); });
    
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    loginContainer.innerHTML = `<div class="login-box"><h2>Iniciar Sesión</h2><input type="email" id="email" placeholder="Correo electrónico"><input type="password" id="password" placeholder="Contraseña"><button id="login-btn">Entrar</button><p id="login-error" class="error-message"></p></div>`;
    document.getElementById('login-btn').addEventListener('click', () => { const email = document.getElementById('email').value; const password = document.getElementById('password').value; const errorEl = document.getElementById('login-error'); errorEl.textContent = ''; auth.signInWithEmailAndPassword(email, password).catch(error => { console.error("Error de inicio de sesión:", error); errorEl.textContent = "Correo o contraseña incorrectos."; }); });
    
    auth.onAuthStateChanged(user => {
        if (user) {
            loginContainer.classList.remove('visible'); loginContainer.classList.add('hidden');
            appContainer.classList.add('visible'); appContainer.classList.remove('hidden');
            window.addEventListener('hashchange', router); 
            router();
            document.querySelectorAll('.nav-item-with-submenu > a').forEach(submenuToggle => {
                submenuToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    submenuToggle.parentElement.classList.toggle('open');
                });
            });
            document.getElementById('logout-btn').addEventListener('click', () => auth.signOut());
        } else {
            loginContainer.classList.add('visible'); loginContainer.classList.remove('hidden');
            appContainer.classList.remove('visible'); appContainer.classList.add('hidden');
            window.removeEventListener('hashchange', router);
        }
    });
});
