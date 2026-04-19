// Configuration Firebase — projet "Lien du cockpit"
// Note : ces clés sont publiques par conception (bundlées côté client).
// La sécurité réelle vient des règles Firestore + restrictions de domaine API.

const firebaseConfig = {
  apiKey: "AIzaSyC64EdT7QeWU2IeMIdsmiCnvF8DwWTDgQ4",
  authDomain: "cockpit-linkeo.firebaseapp.com",
  projectId: "cockpit-linkeo",
  storageBucket: "cockpit-linkeo.firebasestorage.app",
  messagingSenderId: "846460957943",
  appId: "1:846460957943:web:91dbb89246a7b3bc150ff2"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Shim compatible avec l'API window.storage utilisée dans App.jsx.
// Chaque clé devient un document dans la collection "cockpit".
window.storage = {
  async get(key) {
    try {
      const doc = await db.collection("cockpit").doc(key).get();
      if (doc.exists) return { value: doc.data().value };
      return null;
    } catch (e) {
      console.error("[storage.get]", key, e);
      return null;
    }
  },
  async set(key, value) {
    try {
      await db.collection("cockpit").doc(key).set({
        value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error("[storage.set]", key, e);
    }
  }
};
