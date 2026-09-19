/* =========================================================
   META VISION — FIREBASE
   Projeto: meta-vision-d30e1
========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyA2Fw_WEgVW7czBF61HW1-BMEbWH2GK2qI",

    authDomain:
        "meta-vision-d30e1.firebaseapp.com",

    projectId:
        "meta-vision-d30e1",

    storageBucket:
        "meta-vision-d30e1.firebasestorage.app",

    messagingSenderId:
        "853696114421",

    appId:
        "1:853696114421:web:a2e222ba13a0f02d6a5fbc",

    measurementId:
        "G-288Q7NF4KX"

};


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

if (!firebase.apps.length) {

    firebase.initializeApp(
        firebaseConfig
    );

}


/* =========================================================
   SERVIÇOS
========================================================= */

const auth =
    firebase.auth();


/*
   Firestore e Storage serão ativados
   quando os respectivos SDKs estiverem
   carregados nas páginas administrativas.
*/

let db = null;

let storage = null;


if (firebase.firestore) {

    db =
        firebase.firestore();

}


if (firebase.storage) {

    storage =
        firebase.storage();

}


console.log(
    "META VISION Firebase conectado."
);
