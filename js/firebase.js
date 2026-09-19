/* =========================================================
   META VISION — FIREBASE
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


if (
    typeof firebase !== "undefined" &&
    !firebase.apps.length
) {

    firebase.initializeApp(
        firebaseConfig
    );

}


console.log(
    "META VISION // Firebase conectado"
);
