import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const res = await getAuth(app).listUsers(1);
console.log("Connexion Firebase Admin OK. Utilisateurs lus :", res.users.length);