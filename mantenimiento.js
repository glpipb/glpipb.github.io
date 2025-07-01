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

const modal = document.getElementById('add-maintenance-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeBtn = document.querySelector('.close-btn');
const maintenanceForm = document.getElementById('add-maintenance-form');

openModalBtn.onclick = () => modal.style.display = 'block';
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = e => { if (e.target == modal) modal.style.display = 'none'; };

maintenanceForm.addEventListener('submit', async e => {
    e.preventDefault();
    try {
        await addDoc(collection(db, 'mantenimientos'), {
            activo: maintenanceForm['maintenance-asset'].value, tipo: maintenanceForm['maintenance-type'].value,
            fechaProgramada: new Date(maintenanceForm['maintenance-date'].value), descripcion: maintenanceForm['maintenance-desc'].value,
            estado: 'Pendiente', fechaCreacion: serverTimestamp()
        });
        maintenanceForm.reset(); modal.style.display = 'none'; await cargarMantenimientos(); alert('¡Tarea programada!');
    } catch (error) { console.error("Error al programar tarea: ", error); alert('Error al programar. Revisa la consola.'); }
});

async function cargarMantenimientos() {
    const tableBody = document.getElementById('maintenance-table-body');
    tableBody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
    try {
        const q = query(collection(db, "mantenimientos"), orderBy("fechaProgramada", "asc"));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) { tableBody.innerHTML = '<tr><td colspan="5">No hay tareas programadas.</td></tr>'; return; }
        let html = '';
        querySnapshot.forEach(doc => {
            const tarea = doc.data();
            const fecha = tarea.fechaProgramada ? new Date(tarea.fechaProgramada.seconds * 1000).toLocaleDateString() : 'N/A';
            html += `<tr><td>${tarea.activo}</td><td>${tarea.tipo}</td><td>${fecha}</td><td class="status-${tarea.estado.toLowerCase()}">${tarea.estado}</td><td>${tarea.descripcion}</td></tr>`;
        });
        tableBody.innerHTML = html;
    } catch (error) { console.error("Error al cargar mantenimientos: ", error); tableBody.innerHTML = `<tr><td colspan="5" style="color: var(--color-red-accent);">Error al cargar: ${error.message}</td></tr>`; }
}
document.addEventListener('DOMContentLoaded', cargarMantenimientos);
