import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ================= ¡ATENCIÓN: PEGA TU CONFIG DE FIREBASE AQUÍ! =================
const firebaseConfig = { /* ... TU CONFIG ... */ };
// ==============================================================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const modal = document.getElementById('add-ticket-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeBtn = document.querySelector('.close-btn');
const ticketForm = document.getElementById('add-ticket-form');

openModalBtn.onclick = () => modal.style.display = 'block';
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = e => { if (e.target == modal) modal.style.display = 'none'; };

ticketForm.addEventListener('submit', async e => {
    e.preventDefault();
    try {
        await addDoc(collection(db, 'tickets'), {
            titulo: ticketForm['ticket-title'].value, usuario: ticketForm['ticket-user'].value,
            prioridad: ticketForm['ticket-priority'].value, estado: 'Abierto', fechaCreacion: serverTimestamp()
        });
        ticketForm.reset(); modal.style.display = 'none'; await cargarTickets(); alert('¡Ticket creado con éxito!');
    } catch (error) { console.error("Error al añadir ticket: ", error); alert('Error al crear ticket. Revisa la consola.'); }
});

async function cargarTickets() {
    const tableBody = document.getElementById('tickets-table-body');
    tableBody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
    try {
        const q = query(collection(db, "tickets"), orderBy("fechaCreacion", "desc"));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) { tableBody.innerHTML = '<tr><td colspan="5">No hay tickets. 🎉</td></tr>'; return; }
        let html = '';
        querySnapshot.forEach(doc => {
            const ticket = doc.data();
            const fecha = ticket.fechaCreacion ? new Date(ticket.fechaCreacion.seconds * 1000).toLocaleString() : 'N/A';
            html += `<tr><td>${ticket.titulo}</td><td>${ticket.usuario}</td><td class="priority-${ticket.prioridad.toLowerCase()}">${ticket.prioridad}</td><td class="status-${ticket.estado.toLowerCase()}">${ticket.estado}</td><td>${fecha}</td></tr>`;
        });
        tableBody.innerHTML = html;
    } catch (error) { console.error("Error al cargar tickets: ", error); tableBody.innerHTML = `<tr><td colspan="5" style="color: var(--color-red-accent);">Error al cargar: ${error.message}</td></tr>`; }
}
document.addEventListener('DOMContentLoaded', cargarTickets);
