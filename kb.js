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

const modal = document.getElementById('add-kb-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeBtn = document.querySelector('.close-btn');
const kbForm = document.getElementById('add-kb-form');

openModalBtn.onclick = () => modal.style.display = 'block';
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = e => { if (e.target == modal) modal.style.display = 'none'; };

kbForm.addEventListener('submit', async e => {
    e.preventDefault();
    try {
        await addDoc(collection(db, 'conocimiento'), {
            titulo: kbForm['kb-title'].value, categoria: kbForm['kb-category'].value,
            contenido: kbForm['kb-content'].value, fechaCreacion: serverTimestamp()
        });
        kbForm.reset(); modal.style.display = 'none'; await cargarNotas(); alert('¡Nota guardada!');
    } catch (error) { console.error("Error al guardar nota: ", error); alert('Error al guardar. Revisa la consola.'); }
});

async function cargarNotas() {
    const grid = document.getElementById('kb-grid-container');
    grid.innerHTML = '<p>Cargando notas...</p>';
    try {
        const q = query(collection(db, "conocimiento"), orderBy("fechaCreacion", "desc"));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) { grid.innerHTML = '<p>No hay notas guardadas.</p>'; return; }
        let html = '';
        querySnapshot.forEach(doc => {
            const nota = doc.data();
            html += `<div class="card kb-card"><h3>${nota.titulo}</h3><span class="category">${nota.categoria}</span><div class="content">${nota.contenido}</div></div>`;
        });
        grid.innerHTML = html;
    } catch (error) { console.error("Error al cargar notas: ", error); grid.innerHTML = `<p style="color: var(--color-red-accent);">Error al cargar: ${error.message}</p>`; }
}
document.addEventListener('DOMContentLoaded', cargarNotas);
