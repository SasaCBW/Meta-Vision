/* =========================================================
   META VISION
   FIREBASE CONFIGURATION
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

if (
    typeof firebase !== "undefined" &&
    !firebase.apps.length
) {

    firebase.initializeApp(
        firebaseConfig
    );

}


/* =========================================================
   SERVIÇOS
========================================================= */

let auth = null;
let db = null;
let storage = null;


if (
    typeof firebase !== "undefined"
) {

    if (firebase.auth) {

        auth =
            firebase.auth();

    }


    if (firebase.firestore) {

        db =
            firebase.firestore();

    }


    if (firebase.storage) {

        storage =
            firebase.storage();

    }

}


console.log(
    "META VISION // Firebase initialized"
);
