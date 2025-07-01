// tickets.js - Lógica para la página de gestión de tickets

// --- IMPORTACIONES Y CONFIGURACIÓN DE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// RECUERDA PEGAR TU CONFIGURACIÓN DE FIREBASE AQUÍ
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- LÓGICA DEL FORMULARIO MODAL ---
const modal = document.getElementById('add-ticket-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeBtn = document.querySelector('.close-btn');

openModalBtn.onclick = () => { modal.style.display = 'block'; }
closeBtn.onclick = () => { modal.style.display = 'none'; }
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// --- GUARDAR UN NUEVO TICKET ---
const ticketForm = document.getElementById('add-ticket-form');
ticketForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página se recargue

    const title = ticketForm['ticket-title'].value;
    const user = ticketForm['ticket-user'].value;
    const priority = ticketForm['ticket-priority'].value;

    try {
        // Añadimos un nuevo documento a la colección "tickets"
        await addDoc(collection(db, 'tickets'), {
            titulo: title,
            usuario: user,
            prioridad: priority,
            estado: 'Abierto', // Estado por defecto
            fechaCreacion: serverTimestamp() // Firebase pone la fecha actual del servidor
        });
        
        ticketForm.reset(); // Limpiamos el formulario
        modal.style.display = 'none'; // Cerramos el modal
        cargarTickets(); // Recargamos la tabla para ver el nuevo ticket
        alert('¡Ticket creado con éxito!');

    } catch (error) {
        console.error("Error al añadir el ticket: ", error);
        alert('Hubo un error al crear el ticket. Revisa la consola (F12).');
    }
});


// --- CARGAR Y MOSTRAR TODOS LOS TICKETS ---
async function cargarTickets() {
    const tableBody = document.getElementById('tickets-table-body');
    tableBody.innerHTML = '<tr><td colspan="5">Cargando tickets...</td></tr>'; // Limpiamos la tabla

    try {
        const querySnapshot = await getDocs(collection(db, "tickets"));
        
        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="5">No hay tickets para mostrar. ¡Crea el primero!</td></tr>';
            return;
        }

        let ticketsHTML = '';
        querySnapshot.forEach((doc) => {
            const ticket = doc.data();
            const fecha = ticket.fechaCreacion ? new Date(ticket.fechaCreacion.seconds * 1000).toLocaleDateString() : 'N/A';

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
        console.error("¡ERROR CRÍTICO AL LEER TICKETS!: ", error);
        tableBody.innerHTML = '<tr><td colspan="5" style="color: var(--color-red-accent);">Error al cargar los tickets. Revisa la consola (F12).</td></tr>';
    }
}

// --- EJECUCIÓN INICIAL ---
// Cuando el DOM esté listo, cargamos los tickets
document.addEventListener('DOMContentLoaded', cargarTickets);