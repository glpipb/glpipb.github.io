// tickets.js - Lógica para la página de gestión de tickets

// --- IMPORTACIONES Y CONFIGURACIÓN DE FIREBASE ---
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
// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- LÓGICA DEL FORMULARIO MODAL ---
const modal = document.getElementById('add-ticket-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeBtn = document.querySelector('.close-btn');
const ticketForm = document.getElementById('add-ticket-form');

openModalBtn.onclick = () => { modal.style.display = 'block'; }
closeBtn.onclick = () => { modal.style.display = 'none'; }
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// --- GUARDAR UN NUEVO TICKET EN FIREBASE ---
ticketForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = ticketForm['ticket-title'].value;
    const user = ticketForm['ticket-user'].value;
    const priority = ticketForm['ticket-priority'].value;

    try {
        await addDoc(collection(db, 'tickets'), {
            titulo: title,
            usuario: user,
            prioridad: priority,
            estado: 'Abierto',
            fechaCreacion: serverTimestamp()
        });
        
        ticketForm.reset();
        modal.style.display = 'none';
        await cargarTickets(); // Recargamos la tabla para ver el nuevo ticket al instante
        alert('¡Ticket creado con éxito!');

    } catch (error) {
        console.error("Error al añadir el ticket: ", error);
        alert('Hubo un error al crear el ticket. Revisa la consola (F12) para ver el error específico.');
    }
});

// --- CARGAR Y MOSTRAR TODOS LOS TICKETS DESDE FIREBASE ---
async function cargarTickets() {
    const tableBody = document.getElementById('tickets-table-body');
    tableBody.innerHTML = '<tr><td colspan="5">Cargando tickets...</td></tr>';

    try {
        const ticketsRef = collection(db, "tickets");
        const q = query(ticketsRef, orderBy("fechaCreacion", "desc")); // Ordenar por fecha, los más nuevos primero
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="5">No hay tickets. ¡Felicidades! 🎉</td></tr>';
            return;
        }

        let ticketsHTML = '';
        querySnapshot.forEach((doc) => {
            const ticket = doc.data();
            const fecha = ticket.fechaCreacion ? new Date(ticket.fechaCreacion.seconds * 1000).toLocaleString() : 'N/A';
            ticketsHTML += `
                <tr>
                    <td>${ticket.titulo}</td>
                    <td>${ticket.usuario}</td>
                    <td class="priority-${ticket.prioridad.toLowerCase()}">${ticket.prioridad}</td>
                    <td class="status-${ticket.estado.toLowerCase()}">${ticket.estado}</td>
                    <td>${fecha}</td>
                </tr>
            `;
        });
        tableBody.innerHTML = ticketsHTML;

    } catch (error) {
        console.error("¡ERROR FATAL AL LEER TICKETS!: ", error);
        tableBody.innerHTML = `<tr><td colspan="5" style="color: var(--color-red-accent);">Error al cargar: ${error.message}. Revisa la consola (F12) y las reglas de seguridad de Firebase.</td></tr>`;
    }
}

// --- EJECUCIÓN INICIAL ---
document.addEventListener('DOMContentLoaded', cargarTickets);
