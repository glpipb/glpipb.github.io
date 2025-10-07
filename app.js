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
const dashboardHTML = `<h1>📊 Dashboard</h1><div class="dashboard-stats" id="dashboard-cards"></div><div class="card" style="margin-top: 30px;"><h2>Tickets por Día (Últimos 7 días)</h2><div class="chart-container"><canvas id="ticketsChart"></canvas></div></div>`;
const newTITicketFormHTML = `<h1>➕ Crear Nuevo Ticket de TI</h1><div class="card"><form id="new-ticket-form"><div class="form-group"><label for="title">Título</label><input type="text" id="title" required></div><div class="form-group"><label>Descripción</label><div id="description-editor"></div></div><div class="inventory-form-grid"><div class="form-group"><label for="requester">Solicitante</label><select id="requester" required></select></div><div class="form-group"><label for="location">Ubicación</label><select id="location" required></select></div><div class="form-group"><label for="priority">Prioridad</label><select id="priority"><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></select></div><div class="form-group"><label for="ticket-datetime">Fecha y Hora del Ticket</label><input type="datetime-local" id="ticket-datetime" required></div></div><div class="form-group"><label>Dispositivos Asociados (opcional)</label><div id="associated-devices-container"><div class="device-input-group"><input type="text" class="device-search" list="device-list" placeholder="Busca por código, usuario, marca..."><button type="button" class="add-device-btn">+</button></div></div><datalist id="device-list"></datalist></div><button type="submit" class="primary">Crear Ticket</button></form></div>`;
const newPlatformTicketFormHTML = `<h1 id="page-title"></h1><div class="card"><form id="new-platform-ticket-form"><div class="inventory-form-grid"><div class="form-group"><label for="fecha-reporte">Fecha de Reporte</label><input type="date" id="fecha-reporte" required></div><div class="form-group"><label for="hora-reporte">Hora de Reporte</label><input type="time" id="hora-reporte" required></div><div class="form-group"><label for="medio-solicitud">Medio de Solicitud</label><select id="medio-solicitud" required></select></div><div class="form-group"><label for="solicitante">Solicitante</label><select id="solicitante" required></select></div><div class="form-group"><label for="asesor-soporte">Asesor de Soporte</label><input type="text" id="asesor-soporte" required></div><div class="form-group"><label for="ticket-caso">Ticket del Caso</label><input type="text" id="ticket-caso"></div></div><div class="form-group"><label for="descripcion-novedad">Descripción de la Novedad</label><textarea id="descripcion-novedad" rows="4" required></textarea></div><button type="submit" class="primary">Crear Ticket</button></form></div>`;
const ticketListHTML = `<div class="add-new-button-container"><button class="export-btn csv" data-format="csv">Exportar a Excel (CSV)</button><button class="export-btn pdf" data-format="pdf">Exportar a PDF</button></div><div class="card"><h2 id="tickets-list-title">Todos los Tickets</h2><div class="table-wrapper"><table id="data-table"><thead><tr><th># Ticket</th><th>Tipo</th><th>Título/Novedad</th><th>Solicitante</th><th>Fecha Creación</th><th>Fecha Cierre</th><th>Estado</th><th>Acciones</th></tr></thead><tbody></tbody></table></div></div>`;
const historyPageHTML = `<h1>🔍 Historial y Búsqueda Avanzada</h1><div class="card"><form id="history-search-form"><div class="search-filters-grid"><div class="form-group"><label for="search-device">Dispositivo (por código)</label><input type="text" id="search-device" list="device-list-search" placeholder="Buscar por código..."></div><datalist id="device-list-search"></datalist><div class="form-group"><label for="search-requester">Solicitante</label><select id="search-requester"><option value="">Todos</option></select></div><div class="form-group"><label for="search-location">Ubicación</label><select id="search-location"><option value="">Todas</option></select></div><div class="form-group"><label for="search-status">Estado</label><select id="search-status"><option value="">Todos</option><option value="abierto">Abierto</option><option value="en-curso">En curso</option><option value="cerrado">Cerrado</option></select></div><div class="form-group"><label for="search-priority">Prioridad</label><select id="search-priority"><option value="">Todas</option><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></select></div><div class="form-group"><label for="search-ticket-type">Tipo de Ticket</label><select id="search-ticket-type"><option value="">Todos</option><option value="ti">TI</option><option value="velocity">Velocity</option><option value="siigo">Siigo</option></select></div><div class="form-group"><button type="submit" class="primary" style="width:100%">Buscar</button></div></div></form></div><div class="add-new-button-container"><button class="export-btn csv" data-format="csv">Exportar a Excel (CSV)</button><button class="export-btn pdf" data-format="pdf">Exportar a PDF</button></div><div class="card"><h2 id="history-results-title">Resultados</h2><div class="table-wrapper"><table id="data-table"><thead><tr><th># Ticket</th><th>Título</th><th>Tipo</th><th>Ticket del Caso</th><th>Solicitante</th><th>Fecha Creación</th><th>Fecha Cierre</th><th>Estado</th><th>Acciones</th></tr></thead><tbody></tbody></table></div></div>`;

// --- AÑADIR NUEVO --- (Template para la Base de Conocimiento)
const knowledgeBaseHTML = `
    <h1>💡 Base de Conocimiento</h1>
    <div class="add-new-button-container">
        <input type="text" id="kb-search-input" placeholder="🔍 Buscar en artículos por título, categoría o contenido..." style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
        <button id="add-kb-article-btn" class="btn-blue">Crear Artículo</button>
    </div>
    <div id="kb-grid-container" class="kb-grid">
        </div>
`;


const statisticsHTML = `<div style="display: flex; justify-content: space-between; align-items: center;"><h1>📈 Centro de Análisis</h1><button class="primary" id="export-stats-pdf">Exportar a PDF</button></div><div id="stats-content"><div class="card"><h2>Filtro de Periodo</h2><div class="stats-filters"><div class="form-group"><label for="start-date">Fecha de Inicio</label><input type="date" id="start-date"></div><div class="form-group"><label for="end-date">Fecha de Fin</label><input type="date" id="end-date"></div><button id="generate-report-btn" class="primary">Generar Reporte</button></div></div><h2>Análisis de Tickets</h2><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px;"><div class="card"><h3>Tickets por Prioridad</h3><div class="chart-container"><canvas id="ticketsByPriorityChart"></canvas></div></div><div class="card"><h3>Tickets por Categoría de Dispositivo</h3><div class="chart-container"><canvas id="ticketsByDeviceCategoryChart"></canvas></div></div><div class="card"><h3>Top 5 Dispositivos Problemáticos</h3><ul id="top-devices-list" class="kpi-list"></ul></div><div class="card"><h3>Top 5 Solicitantes</h3><ul id="top-requesters-list" class="kpi-list"></ul></div></div><div class="card"><h3>Flujo de Tickets (Creados vs. Cerrados)</h3><div class="chart-container"><canvas id="ticket-flow-chart"></canvas></div></div><h2 style="margin-top: 40px;">Resumen de Inventario</h2><div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px;"><div class="card"><h3>Dispositivos por Categoría</h3><div class="chart-container"><canvas id="inventoryByCategoryChart"></canvas></div></div><div class="card"><h3>Computadores por SO</h3><div class="chart-container"><canvas id="computersByOsChart"></canvas></div></div></div></div>`;
const genericListPageHTML = `<h1 id="page-title"></h1><div class="add-new-button-container"><button class="export-btn csv" data-format="csv">Exportar a Excel (CSV)</button><button class="export-btn pdf" data-format="pdf">Exportar a PDF</button><button id="add-item-btn" class="btn-blue open-form-modal-btn">Añadir Nuevo</button></div><div class="card"><div class="table-search-container"><input type="text" id="table-search-input" placeholder="🔍 Buscar en la tabla..."></div><h2 id="item-list-title"></h2><div class="table-wrapper"><table id="data-table"><thead id="item-table-head"></thead><tbody id="item-table-body"></tbody></table></div></div>`;
const maintenanceCalendarHTML = `<h1>📅 Planificación</h1><div class="add-new-button-container"><button class="export-btn csv" data-format="csv">Exportar a Excel (CSV)</button><button class="export-btn pdf" data-format="pdf">Exportar a PDF</button><button class="primary open-form-modal-btn" data-type="maintenance">Programar Tarea</button></div><div class="card"><div id="maintenance-calendar"></div><table id="data-table" style="display:none;"></table></div>`;
const configHTML = `<h1>⚙️ Configuración</h1><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;"><div class="card"><h2>Gestionar Solicitantes</h2><form id="add-requester-form" style="display:flex; gap:10px; margin-bottom: 20px;"><input type="text" id="requester-name" placeholder="Nombre del solicitante" required style="flex-grow:1;"><button type="submit" class="primary">Añadir</button></form><ul id="requesters-list" class="config-list"></ul></div><div class="card"><h2>Gestionar Ubicaciones</h2><form id="add-location-form" style="display:flex; gap:10px; margin-bottom: 20px;"><input type="text" id="location-name" placeholder="Nombre de la ubicación" required style="flex-grow:1;"><button type="submit" class="primary">Añadir</button></form><ul id="locations-list" class="config-list"></ul></div></div>`;

// --- 4. FUNCIONES DE AYUDA Y CONFIGURACIONES ---
function capitalizar(str) { if (!str) return str; return str.charAt(0).toUpperCase() + str.slice(1); }
function exportToCSV(tableId, filename) { const table = document.getElementById(tableId); if (!table) { console.error("Tabla no encontrada para exportar:", tableId); return; } let data = []; const headers = Array.from(table.querySelectorAll('thead th')).map(header => header.innerText).slice(0, -1); const rows = table.querySelectorAll('tbody tr'); rows.forEach(row => { const rowData = Array.from(row.querySelectorAll('td')).map(cell => cell.innerText).slice(0, -1); data.push(rowData); }); const csv = Papa.unparse({ fields: headers, data }, { delimiter: ";" }); const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); if (link.download !== undefined) { const url = URL.createObjectURL(blob); link.setAttribute("href", url); link.setAttribute("download", `${filename}.csv`); link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link); } }
function exportToPDF(tableId, filename) { const table = document.getElementById(tableId); if (!table) { console.error("Tabla no encontrada para exportar:", tableId); return; } const doc = new jsPDF({ orientation: "landscape" }); const head = [Array.from(table.querySelectorAll('thead th')).map(header => header.innerText).slice(0, -1)]; const body = Array.from(table.querySelectorAll('tbody tr')).map(row => Array.from(row.querySelectorAll('td')).map(cell => cell.innerText).slice(0, -1)); doc.autoTable({ head: head, body: body, startY: 10, styles: { font: "Inter", fontSize: 8 }, headStyles: { fillColor: [41, 128, 186], textColor: 255, fontStyle: 'bold' } }); doc.save(`${filename}.pdf`); }
async function exportStatsToPDF() { const reportElement = document.getElementById('stats-content'); const canvas = await html2canvas(reportElement, { scale: 2 }); const imgData = canvas.toDataURL('image/png'); const pdf = new jsPDF('p', 'mm', 'a4'); const pdfWidth = pdf.internal.pageSize.getWidth(); const pdfHeight = (canvas.height * pdfWidth) / canvas.width; pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight); pdf.save("reporte-estadisticas.pdf"); }
function setupTableSearch(inputId, tableId) { const searchInput = document.getElementById(inputId); if (!searchInput) return; if (searchInput.dataset.listenerAttached) return; searchInput.dataset.listenerAttached = 'true'; searchInput.addEventListener('input', (e) => { const searchTerm = e.target.value.toLowerCase().trim(); const table = document.getElementById(tableId); const rows = table.querySelectorAll('tbody tr'); rows.forEach(row => { const rowText = row.textContent.toLowerCase(); if (rowText.includes(searchTerm)) { row.style.display = ''; } else { row.style.display = 'none'; } }); }); }

// ... (El resto de tus objetos de configuración no cambia) ...
const inventoryCategoryConfig = {
    computers: { 
    title: 'Computadores', titleSingular: 'Computador', prefix: 'PC-', counter: 'computerCounter', 
    fields: { 
        id: { label: 'Código' }, 
        brand: { label: 'Marca', type: 'text' }, 
        model: { label: 'Modelo', type: 'text' }, 
        serial: { label: 'Serial', type: 'text' }, 
        user: { label: 'Usuario', type: 'text' }, 
        cpu: { label: 'CPU', type: 'text' }, 
        ram: { label: 'RAM (GB)', type: 'text' }, 
        storage: { label: 'Almacenamiento (GB)', type: 'text' }, 
        os: { label: 'Licencia de SO Asignada', type: 'select', optionsSource: 'software-licenses' }, // <-- LÍNEA MODIFICADA
        sede: { label: 'Sede', type: 'select', optionsSource: 'locations' }, 
        purchaseDate: { label: 'Fecha de Compra', type: 'date' },
        warrantyEndDate: { label: 'Fin de Garantía', type: 'date' },
        lifecycleStatus: { label: 'Estado', type: 'select', options: ['En Uso', 'En TI', 'Dañado', 'Retirado'] },
        observaciones: { label: 'Observaciones', type: 'textarea' } 
    }
},
    phones: { title: 'Teléfonos', titleSingular: 'Teléfono', prefix: 'TEL-', counter: 'phoneCounter', fields: { id: { label: 'Código' }, brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, serial: { label: 'Serial', type: 'text' }, imei: { label: 'IMEI', type: 'text' }, phoneNumber: { label: 'N/Teléfono', type: 'text' }, user: { label: 'Usuario', type: 'text' }, purchaseDate: { label: 'Fecha de Compra', type: 'date' }, warrantyEndDate: { label: 'Fin de Garantía', type: 'date' }, lifecycleStatus: { label: 'Fase del Ciclo de Vida', type: 'select', options: ['Producción', 'En Almacén', 'En Mantenimiento', 'Retirado'] } }},
    cameras: { title: 'Cámaras', titleSingular: 'Cámara', prefix: 'CAM-', counter: 'cameraCounter', fields: { id: { label: 'Código' }, brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, serial: { label: 'Serial', type: 'text' }, ipAddress: { label: 'Dirección IP', type: 'text' }, location: { label: 'Ubicación Física', type: 'text' } }},
    modems: { title: 'Módems', titleSingular: 'Módem', prefix: 'MOD-', counter: 'modemsCounter', fields: { id: { label: 'Código' }, brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, serial: { label: 'Serial', type: 'text' }, serviceProvider: { label: 'Proveedor de Internet', type: 'text' }, location: { label: 'Ubicación Física', type: 'text' }}},
    communicators: { title: 'Comunicadores', titleSingular: 'Comunicador', prefix: 'COM-', counter: 'communicatorsCounter', fields: { id: { label: 'Código' }, brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, serial: { label: 'Serial', type: 'text' }, type: { label: 'Tipo (Satelital, Radio)', type: 'text' } }},
    network: { title: 'Dispositivos de Red', titleSingular: 'Dispositivo de Red', prefix: 'NET-', counter: 'redCounter', fields: { id: { label: 'Código' }, type: { label: 'Tipo (Switch, Router, AP)', type: 'text' }, brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, ipAddress: { label: 'Dirección IP', type: 'text' }, location: { label: 'Ubicación Física', type: 'text' } }},
    printers: { title: 'Impresoras', titleSingular: 'Impresora', prefix: 'IMP-', counter: 'impresoraCounter', fields: { id: { label: 'Código' }, brand: { label: 'Marca', type: 'text' }, model: { label: 'Modelo', type: 'text' }, serial: { label: 'Serial', type: 'text' }, ipAddress: { label: 'Dirección IP', type: 'text' }, type: { label: 'Tipo (Láser, Tinta)', type: 'text' }, location: { label: 'Ubicación Física', type: 'text' } }}
};
const servicesCategoryConfig = {
    internet: { title: 'Internet', titleSingular: 'Servicio de Internet', prefix: 'SRV-INET-', counter: 'internetServiceCounter', fields: { id: { label: 'Código' }, provider: { label: 'Proveedor', type: 'text' }, planName: { label: 'Nombre del Plan', type: 'text' }, contract: { label: 'Contrato', type: 'text' }, speed: { label: 'Velocidad Contratada', type: 'text' }, monthlyCost: { label: 'Costo Mensual', type: 'number' }, location: { label: 'Ubicación', type: 'text' }, status: { label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] } } },
    telefonia: { title: 'Servicios de Telefonía', titleSingular: 'Servicio de Telefonía', prefix: 'SRV-TEL-', counter: 'telefoniaServiceCounter', fields: { id: { label: 'Código' }, provider: { label: 'Proveedor', type: 'text' }, planName: { label: 'Nombre del plan', type: 'text' }, contrac: { label: 'Número de cuenta', type: 'text' }, bill: { label: 'Número de factura', type: 'text' }, linesIncluded: { label: 'Línea', type: 'number' }, monthlyCost: { label: 'Costo mensual', type: 'number' }, assignedUser: { label: 'Usuario asignado', type: 'text' }, status: { label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] } } },
    otros: { title: 'Otros Servicios', titleSingular: 'Otro Servicio', prefix: 'SRV-OTH-', counter: 'otrosServiceCounter', fields: { id: { label: 'Código' }, serviceName: { label: 'Nombre del Servicio', type: 'text' }, provider: { label: 'Proveedor', type: 'text' }, description: { label: 'Descripción', type: 'textarea' }, monthlyCost: { label: 'Costo mensual', type: 'number' }, status: { label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] } } }
};
const credentialsCategoryConfig = {
    emails: { title: 'Correos Electrónicos', titleSingular: 'Credencial de Correo', prefix: 'CRED-EMAIL-', counter: 'emailCounter', fields: { id: { label: 'Código' }, service: { label: 'Servicio (Google, O365)', type: 'text' }, email: { label: 'Correo Electrónico', type: 'email' }, password: { label: 'Contraseña', type: 'text' }, recoveryEmail: { label: 'Correo de recuperación', type: 'email' }, recoveryPhone: { label: 'Número de recuperación', type: 'tel' }, assignedUser: { label: 'Usuario asignado', type: 'text' }, area: { label: 'Área', type: 'text' }, status: { label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] }, notes: { label: 'Notas', type: 'textarea' } } },
    computers: { title: 'Usuarios de Equipos', titleSingular: 'Usuario de Equipo', prefix: 'CRED-PCUSER-', counter: 'computerUserCounter', fields: { id: { label: 'Código' }, computerId: { label: 'ID/Nombre del Equipo', type: 'text' }, username: { label: 'Nombre de Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' }, isAdmin: { label: '¿Es Admin?', type: 'select', options: ['No', 'Sí'] } }},
    phones: { title: 'Usuarios de Teléfonos', titleSingular: 'Usuario de Teléfono', prefix: 'CRED-PHUSER-', counter: 'phoneUserCounter', fields: { id: { label: 'Código' }, phoneId: { label: 'ID/Modelo del Teléfono', type: 'text' }, user: { label: 'Usuario Asignado', type: 'text' }, pin: { label: 'PIN/Contraseña', type: 'text' } }},
    internet: { title: 'Usuarios de Internet', titleSingular: 'Acceso a Internet', prefix: 'CRED-INET-', counter: 'internetCounter', fields: { id: { label: 'Código' }, provider: { label: 'Proveedor (ISP)', type: 'text' }, accountId: { label: 'ID de Cuenta/Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' } }},
    servers: { title: 'Servidores y BD', titleSingular: 'Acceso a Servidor/BD', prefix: 'CRED-SRV-', counter: 'serverCounter', fields: { id: { label: 'Código' }, host: { label: 'Host/IP', type: 'text' }, port: { label: 'Puerto', type: 'number' }, username: { label: 'Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' }, dbName: { label: 'Nombre BD (Opcional)', type: 'text' } }},
    software: { title: 'Licencias de Software', titleSingular: 'Licencia de Software', prefix: 'CRED-SW-', counter: 'softwareCounter', fields: { id: { label: 'Código' }, softwareName: { label: 'Nombre del software', type: 'text' }, licenseKey: { label: 'Clave de licencia', type: 'textarea' }, version: { label: 'Versión', type: 'text' }, assignedTo: { label: 'Asignar a Equipo', type: 'select', optionsSource: 'computers-inventory' } } },
    siigo: { title: 'Usuarios Siigo', titleSingular: 'Usuario Siigo', prefix: 'CRED-SIIGO-', counter: 'siigoCounter', fields: { id: { label: 'Código' }, username: { label: 'Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' }, assignedUser: { label: 'Ususario asignado', type: 'text' }, url: { label: 'URL de Acceso', type: 'text' }, status: { label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] }, notes: { label: 'Notas', type: 'textarea' } } },
    velocity: { title: 'Usuarios Velocity', titleSingular: 'Usuario Velocity', prefix: 'CRED-VEL-', counter: 'velocityCounter', fields: { id: { label: 'Código' }, username: { label: 'Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' }, assignedUser: { label: 'Usuario asignado', type: 'text' }, url: { label: 'URL de Acceso', type: 'text' }, status: { label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] }, notes: { label: 'Notas', type: 'textarea' } } },
    traslados: { title: 'Usuarios App Traslados', titleSingular: 'Usuario App Traslados', prefix: 'CRED-APPTR-', counter: 'trasladosCounter', fields: { id: { label: 'Código' }, username: { label: 'Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' }, assignedUser: { label: 'Usuario asignado', type: 'text' }, status: { label: 'Estado', type: 'select', options: ['Activo', 'Inactivo'] }, notes: { label: 'Notas', type: 'textarea' } } },
    others: { title: 'Otras Credenciales', titleSingular: 'Credencial', prefix: 'CRED-OTH-', counter: 'otherCredentialCounter', fields: { id: { label: 'Código' }, system: { label: 'Sistema/Servicio', type: 'text' }, url: { label: 'URL (Opcional)', type: 'text' }, username: { label: 'Usuario', type: 'text' }, password: { label: 'Contraseña', type: 'text' }, notes: { label: 'Notas', type: 'textarea' } }}
};


// --- FUNCIONES DE RENDERIZADO ---
function handleFirestoreError(error, element) { console.error("Firestore Error:", error); const indexLinkRegex = /(https:\/\/console\.firebase\.google\.com\/project\/.*?\/firestore\/indexes\?create_composite=.*?)"/; const match = error.message.match(indexLinkRegex); let errorMessageHTML; if (match) { const link = match[1]; errorMessageHTML = `<strong>Error de Firebase:</strong> Se requiere un índice que no existe.<br><br><a href="${link}" target="_blank" style="color:blue; text-decoration:underline;">Haz clic aquí para crear el índice necesario en una nueva pestaña.</a><br><br>Después de crearlo, espera unos minutos y recarga esta página.`; } else { errorMessageHTML = `<strong>Error al cargar los datos:</strong> ${error.message}. <br><br>Esto puede ser causado por la configuración de "Prevención de seguimiento" de tu navegador.`; } element.innerHTML = `<div class="card" style="padding: 20px; border-left: 5px solid red;">${errorMessageHTML}</div>`; }

async function renderDashboard(container) { container.innerHTML = dashboardHTML; const cardsContainer = document.getElementById('dashboard-cards'); cardsContainer.innerHTML = 'Cargando estadísticas...'; const ticketsSnapshot = await db.collection('tickets').get(); const tickets = ticketsSnapshot.docs.map(doc => doc.data()); const openCount = tickets.filter(t => t.status === 'abierto').length; const closedCount = tickets.filter(t => t.status === 'cerrado').length; const totalCount = tickets.length; cardsContainer.innerHTML = `<a href="#tickets?status=abierto" class="stat-card open"><div class="stat-number">${openCount}</div><div class="stat-label">Tickets Abiertos</div></a><a href="#tickets?status=cerrado" class="stat-card closed"><div class="stat-number">${closedCount}</div><div class="stat-label">Tickets Cerrados</div></a><a href="#tickets" class="stat-card all"><div class="stat-number">${totalCount}</div><div class="stat-label">Todos los Tickets</div></a>`; const last7Days = Array(7).fill(0).reduce((acc, _, i) => { const d = new Date(); d.setDate(d.getDate() - i); acc[d.toISOString().split('T')[0]] = 0; return acc; }, {}); tickets.forEach(ticket => { if (ticket.createdAt) { const ticketDate = ticket.createdAt.toDate().toISOString().split('T')[0]; if (last7Days.hasOwnProperty(ticketDate)) { last7Days[ticketDate]++; } } }); const ctx = document.getElementById('ticketsChart').getContext('2d'); new Chart(ctx, { type: 'bar', data: { labels: Object.keys(last7Days).map(d => new Date(d + 'T00:00:00').toLocaleDateString('es-ES', {day:'numeric', month:'short'})).reverse(), datasets: [{ label: '# de Tickets Creados', data: Object.values(last7Days).reverse(), backgroundColor: 'rgba(0, 123, 255, 0.5)', borderColor: 'rgba(0, 123, 255, 1)', borderWidth: 1 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } } }); }

async function renderNewTITicketForm(container) {
    container.innerHTML = newTITicketFormHTML;
    const quill = new Quill('#description-editor', { theme: 'snow', placeholder: 'Detalla el problema o solicitud...' });
    const dateTimeInput = document.getElementById('ticket-datetime');
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    dateTimeInput.value = now.toISOString().slice(0, 16);
    const requesterSelect = document.getElementById('requester');
    const locationSelect = document.getElementById('location');
    const deviceDatalist = document.getElementById('device-list');
    const [reqSnap, locSnap, invSnap] = await Promise.all([ db.collection('requesters').get(), db.collection('locations').get(), db.collection('inventory').get() ]);
    requesterSelect.innerHTML = '<option value="">Selecciona un solicitante</option>';
    reqSnap.forEach(doc => requesterSelect.innerHTML += `<option value="${doc.id}">${doc.id}: ${doc.data().name}</option>`);
    locationSelect.innerHTML = '<option value="">Selecciona una ubicación</option>';
    locSnap.forEach(doc => locationSelect.innerHTML += `<option value="${doc.id}">${doc.id}: ${doc.data().name}</option>`);
    const devices = invSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    deviceDatalist.innerHTML = devices.map(d => `<option value="${d.id}">${d.id}: ${d.brand || ''} ${d.model || ''} (Usuario: ${d.user})</option>`).join('');
    const devicesContainer = document.getElementById('associated-devices-container');
    devicesContainer.addEventListener('click', e => {
        if (e.target.classList.contains('add-device-btn')) {
            const newGroup = document.createElement('div');
            newGroup.className = 'device-input-group';
            newGroup.innerHTML = `<input type="text" class="device-search" list="device-list" placeholder="Busca por código, usuario, marca..."><button type="button" class="remove-device-btn">-</button>`;
            devicesContainer.appendChild(newGroup);
        }
        if (e.target.classList.contains('remove-device-btn')) { e.target.closest('.device-input-group').remove(); }
    });
    const form = document.getElementById('new-ticket-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const counterRef = db.collection('counters').doc('ticketCounter');
        try {
            const newTicketId = await db.runTransaction(async (transaction) => {
                const counterDoc = await transaction.get(counterRef);
                if (!counterDoc.exists) { throw "El documento contador de tickets no existe."; }
                const newNumber = counterDoc.data().currentNumber + 1;
                transaction.update(counterRef, { currentNumber: newNumber });
                return `TICKET-${newNumber}`;
            });
            const deviceInputs = document.querySelectorAll('.device-search');
            const deviceIds = Array.from(deviceInputs).map(input => input.value.trim()).filter(value => value !== '');
            const ticketDate = new Date(form['ticket-datetime'].value);
            const ticketTimestamp = firebase.firestore.Timestamp.fromDate(ticketDate);
            const ticketNumber = parseInt(newTicketId.split('-')[1], 10);
            const newTicketData = {
                numericId: ticketNumber,
                ticketType: 'ti',
                title: form.title.value,
                description: quill.root.innerHTML,
                requesterId: form.requester.value,
                locationId: form.location.value,
                priority: form.priority.value,
                status: 'abierto',
                solution: null,
                deviceIds: deviceIds,
                createdAt: ticketTimestamp,
                closedAt: null,
                history: []
            };
            await db.collection('tickets').doc(newTicketId).set(newTicketData);
            alert(`¡Ticket ${newTicketId} creado con éxito!`);
            window.location.hash = '#tickets';
        } catch (error) {
            console.error("Error al crear el ticket: ", error);
            alert("No se pudo crear el ticket. Revisa la consola.");
        }
    });
}
// ... (El resto de tus funciones de renderizado de tickets, etc., no cambia) ...

// --- AÑADIR NUEVO --- (Funciones para la Base de Conocimiento)

// Renderiza la página principal de la Base de Conocimiento
async function renderKnowledgeBase(container) {
    container.innerHTML = knowledgeBaseHTML;
    const gridContainer = document.getElementById('kb-grid-container');
    const searchInput = document.getElementById('kb-search-input');
    const addArticleBtn = document.getElementById('add-kb-article-btn');

    addArticleBtn.addEventListener('click', () => showKnowledgeBaseFormModal());

    let articles = []; // Caché para la búsqueda

    db.collection('knowledge_base').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        gridContainer.innerHTML = '';
        if (snapshot.empty) {
            gridContainer.innerHTML = '<p>No hay artículos en la base de conocimiento todavía.</p>';
            return;
        }
        articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        displayArticles(articles);

    }, error => handleFirestoreError(error, gridContainer));

    function displayArticles(articlesToDisplay) {
        gridContainer.innerHTML = '';
        articlesToDisplay.forEach(article => {
            const card = document.createElement('div');
            card.className = 'kb-card';
            card.dataset.id = article.id;
            
            // Crear un div temporal para convertir HTML a texto plano para el snippet
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = article.solution;
            const solutionSnippet = tempDiv.textContent || tempDiv.innerText || "";

            card.innerHTML = `
                <h3>${article.title}</h3>
                <span class="kb-category">${article.category || 'Sin categoría'}</span>
                <div class="kb-solution-snippet">${solutionSnippet}</div>
            `;
            card.addEventListener('click', () => showKnowledgeBaseArticleModal(article.id));
            gridContainer.appendChild(card);
        });
    }

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (!searchTerm) {
            displayArticles(articles);
            return;
        }
        const filteredArticles = articles.filter(article => 
            article.title.toLowerCase().includes(searchTerm) ||
            (article.category && article.category.toLowerCase().includes(searchTerm)) ||
            article.solution.toLowerCase().includes(searchTerm) ||
            article.problem.toLowerCase().includes(searchTerm)
        );
        displayArticles(filteredArticles);
    });
}

// Muestra el modal para crear o editar un artículo
async function showKnowledgeBaseFormModal(docId = null, prefillData = {}) {
    const formModal = document.getElementById('form-modal');
    const modalBody = formModal.querySelector('#form-modal-body');
    const isEditing = docId !== null;
    let existingData = {};

    if (isEditing) {
        const docSnap = await db.collection('knowledge_base').doc(docId).get();
        if (docSnap.exists) {
            existingData = docSnap.data();
        }
    } else {
        existingData = prefillData; // Usar datos pre-llenados (de un ticket)
    }

    const title = existingData.title || '';
    const category = existingData.category || '';
    const problem = existingData.problem || '';
    const solution = existingData.solution || '';
    
    modalBody.innerHTML = `
        <h2>${isEditing ? 'Editar' : 'Crear'} Artículo de Conocimiento</h2>
        <form id="kb-form">
            <div class="form-group">
                <label for="kb-title">Título</label>
                <input type="text" id="kb-title" value="${title}" required>
            </div>
            <div class="form-group">
                <label for="kb-category">Categoría</label>
                <input type="text" id="kb-category" value="${category}" placeholder="Ej: Redes, Impresoras, Software..." required>
            </div>
            <div class="form-group">
                <label>Descripción del Problema/Síntoma</label>
                <div id="kb-problem-editor" style="height: 150px;"></div>
            </div>
            <div class="form-group">
                <label>Solución Paso a Paso</label>
                <div id="kb-solution-editor" style="height: 250px;"></div>
            </div>
            <div style="text-align: right; margin-top: 20px;">
                <button type="submit" class="primary">${isEditing ? 'Guardar Cambios' : 'Guardar Artículo'}</button>
            </div>
        </form>
    `;

    const problemEditor = new Quill('#kb-problem-editor', { theme: 'snow' });
    problemEditor.root.innerHTML = problem;
    const solutionEditor = new Quill('#kb-solution-editor', { theme: 'snow' });
    solutionEditor.root.innerHTML = solution;

    formModal.classList.remove('hidden');

    document.getElementById('kb-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            title: document.getElementById('kb-title').value,
            category: document.getElementById('kb-category').value,
            problem: problemEditor.root.innerHTML,
            solution: solutionEditor.root.innerHTML,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (isEditing) {
                await db.collection('knowledge_base').doc(docId).update(formData);
            } else {
                formData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                await db.collection('knowledge_base').add(formData);
            }
            formModal.classList.add('hidden');
            if (window.location.hash !== '#knowledge-base') {
                window.location.hash = '#knowledge-base';
            } else {
                renderKnowledgeBase(document.getElementById('app-content'));
            }
        } catch (error) {
            console.error("Error guardando artículo:", error);
            alert("No se pudo guardar el artículo.");
        }
    });
}

// Muestra el modal para ver un artículo completo
async function showKnowledgeBaseArticleModal(docId) {
    const actionModal = document.getElementById('action-modal');
    const modalBody = actionModal.querySelector('#action-modal-body');
    actionModal.classList.remove('hidden');
    modalBody.innerHTML = '<p>Cargando artículo...</p>';

    try {
        const docSnap = await db.collection('knowledge_base').doc(docId).get();
        if (!docSnap.exists) {
            modalBody.innerHTML = '<p>Error: Artículo no encontrado.</p>';
            return;
        }
        const article = docSnap.data();
        modalBody.innerHTML = `
            <h2>${article.title}</h2>
            <p><span class="kb-category">${article.category}</span></p>
            <div class="kb-article-content">
                <h3>Problema</h3>
                <div class="card">${article.problem}</div>
                <h3>Solución</h3>
                <div class="card">${article.solution}</div>
            </div>
            <div style="text-align: right; margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                <button id="edit-kb-btn" class="btn-secondary">✏️ Editar</button>
                <button id="delete-kb-btn" class="danger">🗑️ Eliminar</button>
            </div>
        `;

        document.getElementById('edit-kb-btn').addEventListener('click', () => {
            actionModal.classList.add('hidden');
            showKnowledgeBaseFormModal(docId);
        });
        document.getElementById('delete-kb-btn').addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que quieres eliminar este artículo?')) {
                await db.collection('knowledge_base').doc(docId).delete();
                actionModal.classList.add('hidden');
                renderKnowledgeBase(document.getElementById('app-content'));
            }
        });

    } catch (error) {
        console.error("Error cargando artículo:", error);
        modalBody.innerHTML = '<p>Error al cargar el artículo.</p>';
    }
}
// ... (El resto de tus funciones de renderizado de tickets, etc., no cambia hasta llegar a showTicketModal) ...

// ... (Aquí van tus funciones renderTicketList, renderHistoryPage, renderEstadisticas, renderGenericListPage, showDeviceHistoryModal, renderMaintenanceCalendar, renderConfiguracion, showItemFormModal, y las demás funciones auxiliares de modals)

// --- MODIFICAR ESTO --- (Añadir un botón en el modal de tickets cerrados)
async function showTicketModal(ticketId) {
    const ticketModal = document.getElementById('ticket-modal');
    const modalBody = ticketModal.querySelector('#modal-body');
    ticketModal.classList.remove('hidden');
    modalBody.innerHTML = '<p>Cargando detalles del ticket...</p>';

    const ticketDoc = await db.collection('tickets').doc(ticketId).get();
    if (!ticketDoc.exists) {
        alert('Error: No se encontró el ticket.');
        ticketModal.classList.add('hidden');
        return;
    }

    const ticket = { id: ticketDoc.id, ...ticketDoc.data() };
    const requesterName = ticket.requesterId ? (await db.collection('requesters').doc(ticket.requesterId).get()).data()?.name || ticket.requesterId : 'N/A';
    
    let devicesHTML = '';
    if (ticket.deviceIds && ticket.deviceIds.length > 0) {
        devicesHTML = `<div class="ticket-detail-item"><strong>Dispositivos:</strong><ul style="margin-top: 5px; padding-left: 20px;">${ticket.deviceIds.map(id => `<li>${id}</li>`).join('')}</ul></div>`;
    }

    let mainContentHTML = '';
    if (ticket.ticketType === 'velocity' || ticket.ticketType === 'siigo') {
        mainContentHTML = `<h4>Detalles del Reporte</h4><div class="ticket-details-grid"><div><strong>Fecha de Reporte:</strong> ${ticket.fechaDeReporte || 'N/A'}</div><div><strong>Hora de Reporte:</strong> ${ticket.horaDeReporte || 'N/A'}</div><div><strong>Medio de Solicitud:</strong> ${ticket.medioDeSolicitud || 'N/A'}</div><div><strong>Asesor de Soporte:</strong> ${ticket.asesorDeSoporte || 'N/A'}</div><div><strong>Ticket del Caso:</strong> ${ticket.ticketDelCaso || 'N/A'}</div></div><hr><h4>Descripción de la Novedad</h4><div class="card">${ticket.descripcionDeLaNovedad}</div>`;
    } else {
        mainContentHTML = `<h3>Descripción</h3><div class="card">${ticket.description}</div>`;
    }

    let historyHTML = '<h3>Historial de Avances</h3>';
    if (ticket.history && ticket.history.length > 0) {
        historyHTML += '<ul class="ticket-history-log">';
        ticket.history.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
        ticket.history.forEach(entry => { historyHTML += `<li><div class="history-meta">Registrado el: ${entry.timestamp.toDate().toLocaleString('es-ES')}</div><div class="history-text">${entry.text}</div></li>`; });
        historyHTML += '</ul>';
    } else {
        historyHTML += '<p>No hay avances registrados.</p>';
    }

    let actionsHTML = '';
    if (ticket.status === 'abierto' || ticket.status === 'en-curso') {
        actionsHTML = `<hr><h3>Añadir Avance</h3><form id="progress-form"><div class="form-group"><textarea id="progress-text" rows="3" placeholder="Describe el avance realizado..." required></textarea></div><button type="submit" class="btn-warning">Guardar Avance y Poner "En Curso"</button></form><hr><h3>Añadir Solución Final y Cerrar Ticket</h3><form id="solution-form"><div class="form-group"><div id="solution-editor"></div></div><button type="submit" class="primary">Guardar Solución y Cerrar</button></form>`;
    } else if (ticket.status === 'cerrado') {
        actionsHTML = `<hr><h3>Solución Aplicada</h3><div class="card">${ticket.solution || 'No se especificó solución.'}</div>`;
        // --- AÑADIR NUEVO --- Botón para crear artículo desde ticket
        if (ticket.solution) {
            actionsHTML += `<div style="text-align: right; margin-top: 15px;"><button id="create-kb-from-ticket-btn" class="btn-blue">📝 Crear Artículo de Conocimiento</button></div>`;
        }
    }

    let modalActions = `<div class="ticket-modal-actions">`;
    if ((ticket.status === 'abierto' || ticket.status === 'en-curso') && ticket.ticketType === 'ti') {
        modalActions += `<button id="edit-ticket-btn" class="btn-secondary">✏️ Editar Ticket</button>`;
    }
    if (ticket.status === 'cerrado') {
        modalActions += `<button id="reopen-ticket-btn" class="btn-warning">↩️ Reabrir Ticket</button>`;
    }
    if (ticket.closedAt) {
        modalActions += `<button id="edit-closed-at-date-btn" class="btn-secondary" style="margin-left:10px;">🗓️ Editar Fecha Cierre</button>`;
    }
    modalActions += `</div>`;

    modalBody.innerHTML = `<div class="ticket-modal-layout"><div class="ticket-modal-main"><h2>Ticket ${ticket.id} (${capitalizar(ticket.ticketType || 'TI')})</h2>${modalActions}<hr>${mainContentHTML}${historyHTML}${actionsHTML}</div><div class="ticket-modal-sidebar"><h3>Detalles del Ticket</h3><div class="ticket-detail-item"><strong>Estado:</strong> <span class="status status-${ticket.status}">${capitalizar(ticket.status.replace('-', ' '))}</span></div>${ticket.priority ? `<div class="ticket-detail-item"><strong>Prioridad:</strong> ${capitalizar(ticket.priority)}</div>` : ''}<div class="ticket-detail-item"><strong>Solicitante:</strong> ${requesterName}</div>${ticket.locationId ? `<div class="ticket-detail-item"><strong>Ubicación:</strong> ${ticket.locationId}</div>` : ''}<div class="ticket-detail-item"><strong>Creado:</strong> ${ticket.createdAt.toDate().toLocaleString('es-ES')}</div>${ticket.closedAt ? `<div class="ticket-detail-item"><strong>Cerrado:</strong> ${ticket.closedAt.toDate().toLocaleString('es-ES')}</div>` : ''}${devicesHTML}</div></div>`;

    if ((ticket.status === 'abierto' || ticket.status === 'en-curso') && ticket.ticketType === 'ti') {
        document.getElementById('edit-ticket-btn').addEventListener('click', () => {
            ticketModal.classList.add('hidden');
            showEditTicketModal(ticket.id);
        });
    }

    if (document.getElementById('edit-closed-at-date-btn')) {
        document.getElementById('edit-closed-at-date-btn').addEventListener('click', () => {
            ticketModal.classList.add('hidden');
            showEditClosedAtModal(ticket.id, ticket.closedAt);
        });
    }

    if (ticket.status === 'abierto' || ticket.status === 'en-curso') {
        document.getElementById('progress-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = document.getElementById('progress-text').value;
            if (!text.trim()) return;
            const newHistoryEntry = { text: text, timestamp: firebase.firestore.FieldValue.serverTimestamp() };
            await db.collection('tickets').doc(ticket.id).update({
                status: 'en-curso',
                history: firebase.firestore.FieldValue.arrayUnion(newHistoryEntry)
            });
            showTicketModal(ticket.id);
        });
        const solutionEditor = new Quill('#solution-editor', { theme: 'snow', placeholder: 'Describe la solución final aplicada...' });
        document.getElementById('solution-form').addEventListener('submit', e => {
            e.preventDefault();
            db.collection('tickets').doc(ticket.id).update({
                solution: solutionEditor.root.innerHTML,
                status: 'cerrado',
                closedAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => showTicketModal(ticket.id));
        });
    }

    if (ticket.status === 'cerrado') {
        document.getElementById('reopen-ticket-btn').addEventListener('click', async () => {
            if (confirm('¿Estás seguro de que quieres reabrir este ticket?')) {
                const reopeningHistoryEntry = { text: `<strong>Ticket reabierto</strong> por el usuario.`, timestamp: firebase.firestore.Timestamp.fromDate(new Date()) };
                try {
                    await db.collection('tickets').doc(ticket.id).update({ status: 'abierto', closedAt: null, solution: null, history: firebase.firestore.FieldValue.arrayUnion(reopeningHistoryEntry) });
                    showTicketModal(ticket.id);
                } catch (error) { console.error("Error al reabrir el ticket:", error); alert("No se pudo reabrir el ticket."); }
            }
        });

        // --- AÑADIR NUEVO --- Event listener para el nuevo botón
        const createKbBtn = document.getElementById('create-kb-from-ticket-btn');
        if (createKbBtn) {
            createKbBtn.addEventListener('click', () => {
                const prefillData = {
                    title: ticket.title,
                    problem: ticket.description,
                    solution: ticket.solution
                };
                ticketModal.classList.add('hidden');
                showKnowledgeBaseFormModal(null, prefillData);
            });
        }
    }
}

// --- 7. AUTENTICACIÓN Y PUNTO DE ENTRADA ---
document.addEventListener('DOMContentLoaded', () => {
    const appContent = document.getElementById('app-content');
    const navList = document.querySelector('.nav-list');
    const ticketModal = document.getElementById('ticket-modal');
    const formModal = document.getElementById('form-modal');
    const actionModal = document.getElementById('action-modal');
    const historyModal = document.getElementById('history-modal');
    
    // --- MODIFICAR ESTO --- (Añadir la nueva ruta)
    const routes = {
        '#dashboard': renderDashboard,
        '#crear-ticket-ti': renderNewTITicketForm,
        '#crear-ticket-velocity': (container) => renderNewPlatformTicketForm(container, 'Velocity'),
        '#crear-ticket-siigo': (container) => renderNewPlatformTicketForm(container, 'Siigo'),
        '#tickets': renderTicketList,
        '#historial': renderHistoryPage,
        '#knowledge-base': renderKnowledgeBase, // <-- RUTA NUEVA
        '#estadisticas': renderEstadisticas,
        '#maintenance': renderMaintenanceCalendar,
        '#configuracion': renderConfiguracion
    };

    function router() { const fullHash = window.location.hash || '#dashboard'; const [path, queryString] = fullHash.split('?'); const params = new URLSearchParams(queryString); let isHandled = false; if (path.startsWith('#inventory-')) { const category = path.replace('#inventory-', ''); params.set('category', category); renderGenericListPage(appContent, Object.fromEntries(params.entries()), inventoryCategoryConfig, 'inventory', '💻'); isHandled = true; } else if (path.startsWith('#credentials-')) { const category = path.replace('#credentials-', ''); params.set('category', category); renderGenericListPage(appContent, Object.fromEntries(params.entries()), credentialsCategoryConfig, 'credentials', '🔑'); isHandled = true; } else if (path.startsWith('#services-')) { const category = path.replace('#services-', ''); params.set('category', category); renderGenericListPage(appContent, Object.fromEntries(params.entries()), servicesCategoryConfig, 'services', '📡'); isHandled = true; } else { const renderFunction = routes[path]; if (renderFunction) { appContent.innerHTML = '<div class="card"><h1>Cargando...</h1></div>'; renderFunction(appContent, Object.fromEntries(params.entries())); } else { appContent.innerHTML = '<h1>404 - Página no encontrada</h1>'; } } document.querySelectorAll('.nav-list .nav-item-with-submenu').forEach(item => item.classList.remove('open')); document.querySelectorAll('.nav-list .nav-link, .nav-list a').forEach(link => link.classList.remove('active')); const activeLink = document.querySelector(`.nav-list a[href="${fullHash}"]`); if (activeLink) { activeLink.classList.add('active'); let current = activeLink.parentElement; while (current && current.closest('.nav-list')) { if (current.matches('.nav-item-with-submenu')) { current.classList.add('open'); const parentToggleLink = current.querySelector(':scope > a'); if(parentToggleLink) parentToggleLink.classList.add('active'); } current = current.parentElement; } } else { const dashboardLink = document.querySelector('.nav-list a[href="#dashboard"]'); if (dashboardLink) dashboardLink.classList.add('active'); } }
    document.body.addEventListener('click', e => { const target = e.target.closest('button, span.edit-btn, span.delete-btn, span.history-btn, a.view-ticket-btn, .modal-close-btn'); if (!target) return; if (target.matches('.modal-close-btn')) { target.closest('.modal-overlay').classList.add('hidden'); } if (target.matches('.delete-btn, .delete-btn *')) { const button = target.closest('.delete-btn'); const id = button.dataset.id; const collection = button.dataset.collection; if (confirm(`¿Seguro que quieres eliminar este elemento?`)) { db.collection(collection).doc(id).delete(); } return; } if (target.matches('.edit-btn, .edit-btn *')) { const button = target.closest('.edit-btn'); const docId = button.dataset.id; const collectionName = button.dataset.collection; const category = button.dataset.category; const type = button.dataset.type; showItemFormModal(type || collectionName, category || collectionName, docId); return; } if (target.matches('.history-btn, .history-btn *')) { const deviceId = target.closest('.history-btn').dataset.id; showDeviceHistoryModal(deviceId); return; } if (target.matches('.view-ticket-btn, .view-ticket-btn *')) { e.preventDefault(); const id = target.closest('.view-ticket-btn').dataset.id; if (!historyModal.classList.contains('hidden')) { historyModal.classList.add('hidden'); } showTicketModal(id); } if (target.closest('button')?.classList.contains('open-form-modal-btn') || target.id === 'add-item-btn') { const button = target.closest('button'); const type = button.dataset.type; const category = button.dataset.category; showItemFormModal(type, category, null); } if (target.closest('button')?.classList.contains('export-btn')) { const format = target.dataset.format; const table = document.getElementById('data-table'); if (!table) { alert("Error: No se pudo encontrar la tabla con ID 'data-table' para exportar."); return; } let titleElement = document.getElementById('page-title') || document.getElementById('tickets-list-title') || document.getElementById('item-list-title') || document.getElementById('history-results-title') || document.querySelector('h1'); const filename = titleElement ? titleElement.textContent.trim() : 'reporte'; const tableId = table.id; if (format === 'csv') { exportToCSV(tableId, filename); } else if (format === 'pdf') { exportToPDF(tableId, filename); } } });
    ticketModal.addEventListener('click', e => { if (e.target === ticketModal) ticketModal.classList.add('hidden'); });
    formModal.addEventListener('click', e => { if (e.target === formModal && e.target.id === 'form-modal') formModal.classList.add('hidden'); });
    actionModal.addEventListener('click', e => { if (e.target === actionModal) actionModal.classList.add('hidden'); });
    historyModal.addEventListener('click', e => { if (e.target === historyModal) historyModal.classList.add('hidden'); });
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    loginContainer.innerHTML = `<div class="login-box"><img src="https://glpipb.github.io/logo.png" alt="Logo" class="login-logo"><h2>Iniciar Sesión</h2><input type="email" id="email" placeholder="Correo electrónico"><input type="password" id="password" placeholder="Contraseña"><button id="login-btn">Entrar</button><p id="login-error" class="error-message"></p></div>`;
    document.getElementById('login-btn').addEventListener('click', () => { const email = document.getElementById('email').value; const password = document.getElementById('password').value; const errorEl = document.getElementById('login-error'); errorEl.textContent = ''; auth.signInWithEmailAndPassword(email, password).catch(error => { console.error("Error de inicio de sesión:", error); errorEl.textContent = "Correo o contraseña incorrectos."; }); });
    auth.onAuthStateChanged(user => { if (user) { loginContainer.classList.remove('visible'); loginContainer.classList.add('hidden'); appContainer.classList.add('visible'); appContainer.classList.remove('hidden'); if (navList && !navList.dataset.listenerAttached) { navList.addEventListener('click', (e) => { const toggleLink = e.target.closest('.nav-item-with-submenu > a'); if (toggleLink && toggleLink.nextElementSibling && toggleLink.nextElementSibling.classList.contains('submenu')) { e.preventDefault(); const parentLi = toggleLink.parentElement; parentLi.classList.toggle('open'); } }); navList.dataset.listenerAttached = 'true'; } window.addEventListener('hashchange', router); router(); document.getElementById('logout-btn').addEventListener('click', () => auth.signOut()); } else { loginContainer.classList.add('visible'); loginContainer.classList.remove('hidden'); appContainer.classList.remove('visible'); appContainer.classList.add('hidden'); window.removeEventListener('hashchange', router); } });
});
