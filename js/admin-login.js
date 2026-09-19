document.addEventListener(
    "DOMContentLoaded",
    () => {

        const form =
            document.getElementById(
                "adminLoginForm"
            );

        const emailInput =
            document.getElementById(
                "adminEmail"
            );

        const passwordInput =
            document.getElementById(
                "adminPassword"
            );

        const togglePassword =
            document.getElementById(
                "togglePassword"
            );

        const passwordIcon =
            document.getElementById(
                "passwordIcon"
            );

        const loginButton =
            document.getElementById(
                "adminLoginButton"
            );

        const loginButtonText =
            document.getElementById(
                "loginButtonText"
            );

        const alertBox =
            document.getElementById(
                "loginAlert"
            );

        const alertText =
            document.getElementById(
                "loginAlertText"
            );


        /* =============================================
           MOSTRAR SENHA
        ============================================= */

        if (togglePassword) {

            togglePassword.addEventListener(
                "click",
                () => {

                    const showing =
                        passwordInput.type ===
                        "text";


                    passwordInput.type =
                        showing
                            ? "password"
                            : "text";


                    passwordIcon.className =
                        showing
                            ? "fa-regular fa-eye"
                            : "fa-regular fa-eye-slash";

                }
            );

        }


        /* =============================================
           ALERTA
        ============================================= */

        function showError(message) {

            if (!alertBox) {
                return;
            }


            alertText.textContent =
                message;


            alertBox.classList.add(
                "show"
            );

        }


        function hideError() {

            if (alertBox) {

                alertBox.classList.remove(
                    "show"
                );

            }

        }


        /* =============================================
           LOADING
        ============================================= */

        function setLoading(loading) {

            loginButton.disabled =
                loading;


            loginButtonText.textContent =
                loading
                    ? "VERIFICANDO..."
                    : "ACESSAR SISTEMA";

        }


        /* =============================================
           VERIFICAR FIREBASE
        ============================================= */

        function firebaseReady() {

            return (
                typeof firebase !==
                    "undefined" &&

                firebase.apps &&

                firebase.apps.length > 0
            );

        }


        /* =============================================
           LOGIN
        ============================================= */

        if (form) {

            form.addEventListener(
                "submit",
                async event => {

                    event.preventDefault();


                    hideError();


                    const email =
                        emailInput
                            .value
                            .trim();


                    const password =
                        passwordInput
                            .value;


                    if (
                        !email ||
                        !password
                    ) {

                        showError(
                            "Digite seu e-mail e sua senha."
                        );

                        return;

                    }


                    /*
                       O login não possui
                       senha fixa no código.

                       A validação será feita
                       pelo Firebase Authentication.
                    */

                    if (!firebaseReady()) {

                        showError(
                            "O Firebase da META VISION ainda não foi configurado."
                        );

                        return;

                    }


                    setLoading(true);


                    try {

                        await firebase
                            .auth()
                            .signInWithEmailAndPassword(
                                email,
                                password
                            );


                        /*
                           Login válido.

                           O admin.html também
                           verificará a sessão.
                        */

                        window.location.href =
                            "admin.html";

                    } catch (error) {

                        console.error(
                            "Erro de login:",
                            error
                        );


                        let message =
                            "E-mail ou senha inválidos.";


                        if (
                            error.code ===
                            "auth/too-many-requests"
                        ) {

                            message =
                                "Muitas tentativas. Aguarde um pouco e tente novamente.";

                        }


                        if (
                            error.code ===
                            "auth/network-request-failed"
                        ) {

                            message =
                                "Não foi possível conectar. Verifique sua internet.";

                        }


                        showError(
                            message
                        );


                        setLoading(false);

                    }

                }
            );

        }


        /* =============================================
           USUÁRIO JÁ LOGADO
        ============================================= */

        if (firebaseReady()) {

            firebase
                .auth()
                .onAuthStateChanged(
                    user => {

                        if (user) {

                            /*
                               Se já existe sessão,
                               entra direto no painel.
                            */

                            window.location.href =
                                "admin.html";

                        }

                    }
                );

        }

    }
);
