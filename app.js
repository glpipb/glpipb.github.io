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

const dashboardHTML = `
    <h1>📊 Dashboard</h1>
    <div class="card">
        <h2>Resumen de Tickets</h2>
        <div id="ticket-summary" style="display: flex; justify-content: space-around; text-align: center;">
            <div><h3 id="total-open">0</h3><p>Abiertos</p></div>
            <div><h3 id="total-in-progress">0</h3><p>En Proceso</p></div>
            <div><h3 id="total-closed">0</h3><p>Cerrados</p></div>
        </div>
    </div>
    <div class="card">
        <h2>Tickets por Día (Últimos 7 días)</h2>
        <canvas id="ticketsChart"></canvas>
    </div>
`;

const ticketsHTML = `
    <h1>🎟️ Gestión de Tickets</h1>
    <div class="card">
        <h2>Nuevo Ticket</h2>
        <form id="new-ticket-form">
            <div class="form-group"><label for="title">Título</label><input type="text" id="title" required></div>
            <div class="form-group"><label for="description">Descripción</label><textarea id="description" rows="3" required></textarea></div>
            <div class="form-group">
                <label for="priority">Prioridad</label>
                <select id="priority"><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></select>
            </div>
            <button type="submit" class="primary">Crear Ticket</button>
        </form>
    </div>
    <div class="card">
        <h2>Tickets Activos</h2>
        <table id="tickets-table">
            <thead><tr><th>Título</th><th>Prioridad</th><th>Estado</th><th>Fecha Creación</th><th>Acciones</th></tr></thead>
            <tbody></tbody>
        </table>
    </div>
`;

const inventoryHTML = `
    <h1>💻 Inventario de Dispositivos</h1>
    <div class="card">
        <h2>Añadir Dispositivo</h2>
        <form id="new-device-form" style="display: flex; gap: 10px; flex-wrap: wrap;">
            <input type="text" id="device-type" placeholder="Tipo (ej. Laptop)" required style="flex: 1;">
            <input type="text" id="device-brand" placeholder="Marca" required style="flex: 1;">
            <input type="text" id="device-model" placeholder="Modelo" required style="flex: 1;">
            <input type="text" id="device-serial" placeholder="N/Serie" required style="flex: 1;">
            <input type="text" id="device-user" placeholder="Usuario Asignado" style="flex: 1;">
            <button type="submit" class="primary">Añadir</button>
        </form>
    </div>
    <div class="card">
        <h2>Dispositivos</h2>
        <table id="inventory-table">
            <thead><tr><th>Tipo</th><th>Marca</th><th>Modelo</th><th>Serie</th><th>Usuario</th><th>Acciones</th></tr></thead>
            <tbody></tbody>
        </table>
    </div>
`;

const maintenanceHTML = `
    <h1>⚙️ Plan de Mantenimiento</h1>
    <div class="card">
        <h2>Programar Mantenimiento</h2>
        <form id="new-maintenance-form" style="display: flex; gap: 10px; flex-wrap: wrap;">
            <input type="text" id="maint-task" placeholder="Tarea" required style="flex: 2;">
            <input type="date" id="maint-date" required style="flex: 1;">
            <select id="maint-freq" style="flex: 1;"><option value="unica">Vez Única</option><option value="mensual">Mensual</option><option value="trimestral">Trimestral</option><option value="anual">Anual</option></select>
            <button type="submit" class="primary">Programar</button>
        </form>
    </div>
    <div class="card">
        <h2>Próximos Mantenimientos</h2>
        <table id="maintenance-table">
            <thead><tr><th>Tarea</th><th>Próxima Fecha</th><th>Frecuencia</th><th>Acciones</th></tr></thead>
            <tbody></tbody>
        </table>
    </div>
`;

const credentialsHTML = `
    <h1>🔑 Gestor de Credenciales (No Críticas)</h1>
    <div class="card" style="border-left: 5px solid var(--danger-color);">
        <h2 style="color: var(--danger-color);">⚠️ ADVERTENCIA DE SEGURIDAD ⚠️</h2>
        <p>Almacenar credenciales aquí no es seguro. Úsalo <strong>SOLAMENTE</strong> para información no sensible (contraseñas de impresoras, usuarios de prueba, etc.). <strong>NUNCA guardes aquí contraseñas de administrador o de cuentas importantes.</strong></p>
    </div>
    <div class="card">
        <h2>Añadir Credencial</h2>
        <form id="new-credential-form">
            <input type="text" id="cred-system" placeholder="Sistema/Servicio" required><br><br>
            <input type="text" id="cred-user" placeholder="Usuario"><br><br>
            <input type="text" id="cred-pass" placeholder="Contraseña/Clave"><br><br>
            <textarea id="cred-notes" placeholder="Notas adicionales"></textarea><br><br>
            <button type="submit" class="primary">Guardar</button>
        </form>
    </div>
    <div class="card">
        <h2>Credenciales Guardadas</h2>
        <table id="credentials-table">
            <thead><tr><th>Sistema</th><th>Usuario</th><th>Contraseña</th><th>Notas</th><th>Acciones</th></tr></thead>
            <tbody></tbody>
        </table>
    </div>
`;


// --- 4. FUNCIONES PARA RENDERIZAR CADA SECCIÓN ---

// DASHBOARD
async function renderDashboard(container) {
    container.innerHTML = dashboardHTML;
    const ticketsSnapshot = await db.collection('tickets').get();
    const tickets = ticketsSnapshot.docs.map(doc => doc.data());

    document.getElementById('total-open').innerText = tickets.filter(t => t.status === 'abierto').length;
    document.getElementById('total-in-progress').innerText = tickets.filter(t => t.status === 'proceso').length;
    document.getElementById('total-closed').innerText = tickets.filter(t => t.status === 'cerrado').length;
    
    const last7Days = Array(7).fill(0).reduce((acc, _, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        acc[d.toISOString().split('T')[0]] = 0;
        return acc;
    }, {});
    
    tickets.forEach(ticket => {
        if (ticket.createdAt) {
            const ticketDate = ticket.createdAt.toDate().toISOString().split('T')[0];
            if (last7Days.hasOwnProperty(ticketDate)) { last7Days[ticketDate]++; }
        }
    });

    const ctx = document.getElementById('ticketsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(last7Days).map(d => new Date(d).toLocaleDateString('es-ES', {day:'numeric', month:'short'})).reverse(),
            datasets: [{
                label: '# de Tickets',
                data: Object.values(last7Days).reverse(),
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1
            }]
        },
        options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
}

// TICKETS
function renderTickets(container) {
    container.innerHTML = ticketsHTML;
    const form = document.getElementById('new-ticket-form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        db.collection('tickets').add({
            title: form.title.value,
            description: form.description.value,
            priority: form.priority.value,
            status: 'abierto',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => form.reset());
    });

    const tableBody = document.querySelector('#tickets-table tbody');
    db.collection('tickets').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
        tableBody.innerHTML = '';
        snapshot.forEach(doc => {
            const ticket = { id: doc.id, ...doc.data() };
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${ticket.title}</td>
                <td>${ticket.priority}</td>
                <td><span class="status status-${ticket.status}">${ticket.status}</span></td>
                <td>${ticket.createdAt ? ticket.createdAt.toDate().toLocaleString('es-ES') : 'N/A'}</td>
                <td>
                    <select class="status-changer" data-id="${ticket.id}">
                        <option value="abierto" ${ticket.status === 'abierto' ? 'selected' : ''}>Abierto</option>
                        <option value="proceso" ${ticket.status === 'proceso' ? 'selected' : ''}>En Proceso</option>
                        <option value="cerrado" ${ticket.status === 'cerrado' ? 'selected' : ''}>Cerrado</option>
                    </select>
                </td>
            `;
            tableBody.appendChild(tr);
        });
        document.querySelectorAll('.status-changer').forEach(select => {
            select.addEventListener('change', e => {
                db.collection('tickets').doc(e.target.dataset.id).update({ status: e.target.value });
            });
        });
    });
}

// INVENTARIO
function renderInventory(container) {
    container.innerHTML = inventoryHTML;
    const form = document.getElementById('new-device-form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        db.collection('inventory').add({
            type: form['device-type'].value,
            brand: form['device-brand'].value,
            model: form['device-model'].value,
            serial: form['device-serial'].value,
            user: form['device-user'].value,
        }).then(() => form.reset());
    });

    const tableBody = document.querySelector('#inventory-table tbody');
    db.collection('inventory').onSnapshot(snapshot => {
        tableBody.innerHTML = '';
        snapshot.forEach(doc => {
            const device = { id: doc.id, ...doc.data() };
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${device.type}</td><td>${device.brand}</td><td>${device.model}</td>
                <td>${device.serial}</td><td>${device.user}</td>
                <td><button class="danger delete-btn" data-id="${device.id}" data-collection="inventory">Eliminar</button></td>
            `;
            tableBody.appendChild(tr);
        });
    });
}

// MANTENIMIENTO
function renderMaintenance(container) {
    container.innerHTML = maintenanceHTML;
    const form = document.getElementById('new-maintenance-form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        db.collection('maintenance').add({
            task: form['maint-task'].value,
            nextDate: form['maint-date'].value,
            frequency: form['maint-freq'].value,
        }).then(() => form.reset());
    });
    
    const tableBody = document.querySelector('#maintenance-table tbody');
    db.collection('maintenance').orderBy('nextDate').onSnapshot(snapshot => {
        tableBody.innerHTML = '';
        snapshot.forEach(doc => {
            const maint = { id: doc.id, ...doc.data() };
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${maint.task}</td>
                <td>${new Date(maint.nextDate + 'T00:00:00').toLocaleDateString('es-ES')}</td>
                <td>${maint.frequency}</td>
                <td><button class="danger delete-btn" data-id="${maint.id}" data-collection="maintenance">Completado</button></td>
            `;
            tableBody.appendChild(tr);
        });
    });
}

// CREDENCIALES
function renderCredentials(container) {
    container.innerHTML = credentialsHTML;
    const form = document.getElementById('new-credential-form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        db.collection('credentials').add({
            system: form['cred-system'].value,
            user: form['cred-user'].value,
            pass: form['cred-pass'].value,
            notes: form['cred-notes'].value,
        }).then(() => form.reset());
    });

    const tableBody = document.querySelector('#credentials-table tbody');
    db.collection('credentials').onSnapshot(snapshot => {
        tableBody.innerHTML = '';
        snapshot.forEach(doc => {
            const cred = { id: doc.id, ...doc.data() };
            tr.innerHTML = `
                <td>${cred.system}</td><td>${cred.user}</td>
                <td>${cred.pass}</td><td>${cred.notes}</td>
                <td><button class="danger delete-btn" data-id="${cred.id}" data-collection="credentials">Eliminar</button></td>
            `;
            tableBody.appendChild(tr);
        });
    });
}


// --- 5. ROUTER Y LÓGICA PRINCIPAL ---

const appContent = document.getElementById('app-content');
const navLinks = document.querySelectorAll('.nav-link');

const routes = {
    '#dashboard': renderDashboard,
    '#tickets': renderTickets,
    '#inventory': renderInventory,
    '#maintenance': renderMaintenance,
    '#credentials': renderCredentials,
};

function router() {
    const path = window.location.hash || '#dashboard';
    const renderFunction = routes[path];
    
    if (renderFunction) {
        renderFunction(appContent);
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === path);
        });
    } else {
        appContent.innerHTML = '<h1>404 - Página no encontrada</h1>';
    }
}

// Event listener para botones de eliminar (delegación de eventos)
appContent.addEventListener('click', e => {
    if (e.target.classList.contains('delete-btn')) {
        const id = e.target.dataset.id;
        const collection = e.target.dataset.collection;
        if (confirm(`¿Seguro que quieres eliminar este elemento de ${collection}?`)) {
            db.collection(collection).doc(id).delete();
        }
    }
});

// --- 6. AUTENTICACIÓN Y PUNTO DE ENTRADA ---

document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const appContainer = document.getElementById('app-container');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');

    // Manejo del Login
    loginBtn.addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('login-error');
        errorEl.textContent = '';
        auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                errorEl.textContent = "Correo o contraseña incorrectos.";
            });
    });

    // Manejo del Logout
    logoutBtn.addEventListener('click', () => auth.signOut());

    // Escuchar cambios de autenticación
    auth.onAuthStateChanged(user => {
        if (user) {
            loginContainer.classList.remove('visible');
            loginContainer.classList.add('hidden');
            appContainer.classList.add('visible');
            window.addEventListener('hashchange', router);
            router(); // Cargar la vista inicial
        } else {
            loginContainer.classList.add('visible');
            appContainer.classList.remove('visible');
            appContainer.classList.add('hidden');
            window.removeEventListener('hashchange', router);
        }
    });
});
