// Importamos las funciones necesarias del SDK de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 

// Credenciales de la app CoraWeb
const firebaseConfig = {
  apiKey: "AIzaSyCUA578ZtJEk15XO4F3AdIamVxnz3AiUk8",
  authDomain: "coraweb-3cc32.firebaseapp.com",
  projectId: "coraweb-3cc32",
  storageBucket: "coraweb-3cc32.firebasestorage.app",
  messagingSenderId: "452607104626",
  appId: "1:452607104626:web:f84d705d7eb8182a1cd4eb",
  measurementId: "G-1L6JD04FVE"
};

// Inicializamos la aplicación de Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);