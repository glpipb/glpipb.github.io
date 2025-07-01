import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ================= ¡ATENCIÓN: PEGA TU CONFIG DE FIREBASE AQUÍ! =================
const firebaseConfig = { /* ... TU CONFIG ... */ };
// ==============================================================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function actualizarDashboard() {
    // ---- Contadores de Activos ----
    const activosSnap = await getDocs(collection(db, "activos"));
    const contadores = { 'Computadoras': 0, 'Monitores': 0, 'Telefonos': 0, 'Impresoras': 0, 'Dispositivos de red': 0, 'Licencias': 0 };
    const marcasComputadoras = {};
    
    activosSnap.forEach(doc => {
        const activo = doc.data();
        if (activo.tipo && contadores.hasOwnProperty(activo.tipo)) contadores[activo.tipo]++;
        if (activo.tipo === 'Computadoras' && activo.marca) {
            marcasComputadoras[activo.marca] = (marcasComputadoras[activo.marca] || 0) + 1;
        }
    });
    Object.keys(contadores).forEach(key => {
        const elementId = `total-${key.toLowerCase().replace(/ /g, '-')}`;
        const element = document.getElementById(elementId);
        if (element) element.textContent = contadores[key];
    });

    // ---- Contadores de Tickets ----
    const ticketsSnap = await getDocs(collection(db, "tickets"));
    const estadosTickets = { 'Abierto': 0, 'Cerrado': 0 };
    ticketsSnap.forEach(doc => {
        const ticket = doc.data();
        if (ticket.estado && estadosTickets.hasOwnProperty(ticket.estado)) estadosTickets[ticket.estado]++;
    });

    // ---- Renderizar Gráficos ----
    renderizarGrafico('computadoras-chart', 'pie', Object.keys(marcasComputadoras), Object.values(marcasComputadoras), 'Computadoras por Marca');
    renderizarGrafico('tickets-chart', 'doughnut', Object.keys(estadosTickets), Object.values(estadosTickets), 'Tickets por Estado');
}

let charts = {};
function renderizarGrafico(canvasId, tipo, etiquetas, datos, titulo) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    if (charts[canvasId]) {
        charts[canvasId].destroy();
    }
    charts[canvasId] = new Chart(ctx, {
        type: tipo,
        data: {
            labels: etiquetas,
            datasets: [{ label: titulo, data: datos, borderWidth: 1,
                backgroundColor: ['#e5383b', '#fca311', '#adb5bd', '#495057', '#f8f9fa']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: 'white' } } } }
    });
}

window.addEventListener('DOMContentLoaded', actualizarDashboard);
