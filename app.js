// app.js - El cerebro de nuestro Dashboard

// 1. Importamos las funciones necesarias de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 2. PEGA AQUÍ TU OBJETO DE CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyA5rVhtkVDeJPY0bEnLjk-_LMVN3d5pkIo",
  authDomain: "glpi-tecnologia.firebaseapp.com",
  projectId: "glpi-tecnologia",
  storageBucket: "glpi-tecnologia.firebasestorage.app",
  messagingSenderId: "195664374847",
  appId: "1:195664374847:web:88412be75b4ff8600adc8a",
  measurementId: "G-QJD3VS1V5Y"
};

// 3. Inicializamos Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. La función principal para leer datos y actualizar el HTML
async function actualizarContadoresDashboard() {
    console.log("Intentando actualizar contadores...");
    try {
        const querySnapshot = await getDocs(collection(db, "activos"));
        
        // Creamos un objeto para llevar la cuenta de cada tipo de activo
        const contadores = {
            Computadoras: 0,
            Programas: 0,
            'Dispositivos de red': 0,
            Bastidores: 0,
            Recinto: 0,
            Monitores: 0,
            Licencia: 0,
            Impresoras: 0,
            PDUs: 0,
            Telefonos: 0 // Nota: El nombre del tipo en la DB debe coincidir exacto
        };

        // Recorremos cada documento (activo) que encontramos en la base de datos
        querySnapshot.forEach((doc) => {
            const tipoActivo = doc.data().tipo; // Obtenemos el campo "tipo" del documento
            if (tipoActivo in contadores) {
                contadores[tipoActivo]++; // Incrementamos el contador correspondiente
            }
        });

        // 5. Ahora, actualizamos los números en el HTML
        document.getElementById('total-computadoras').textContent = contadores.Computadoras;
        document.getElementById('total-programas').textContent = contadores.Programas;
        document.getElementById('total-dispositivos-red').textContent = contadores['Dispositivos de red'];
        document.getElementById('total-bastidores').textContent = contadores.Bastidores;
        document.getElementById('total-recintos').textContent = contadores.Recinto;
        document.getElementById('total-monitores').textContent = contadores.Monitores;
        document.getElementById('total-licencias').textContent = contadores.Licencia;
        document.getElementById('total-impresoras').textContent = contadores.Impresoras;
        document.getElementById('total-pdus').textContent = contadores.PDUs;
        document.getElementById('total-telefonos').textContent = contadores.Telefonos;

        console.log("¡Dashboard actualizado con éxito!", contadores);

    } catch (error) {
        console.error("Error al obtener los activos desde Firebase: ", error);
        alert("Hubo un error al conectar con la base de datos. Revisa la consola (F12) para más detalles.");
    }
}

// 6. Hacemos que la función se ejecute en cuanto la página haya cargado
window.addEventListener('DOMContentLoaded', actualizarContadoresDashboard);