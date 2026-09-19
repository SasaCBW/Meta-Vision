/* =========================================================
   META VISION
   CONTATO + FIRESTORE + WHATSAPP
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIGURAÇÃO
    ===================================================== */

    const STORE_WHATSAPP = "5542988620679";

    const CART_KEY = "metaVisionCart";


    /* =====================================================
       FIREBASE
    ===================================================== */

    let database = null;

    if (
        typeof firebase !== "undefined" &&
        firebase.apps.length &&
        firebase.firestore
    ) {

        database = firebase.firestore();

        console.log(
            "META VISION // Contato conectado ao Firestore"
        );

    } else {

        console.error(
            "META VISION // Firestore não foi carregado."
        );

    }


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const form =
        document.getElementById("contactForm");

    const nameInput =
        document.getElementById("contactName");

    const phoneInput =
        document.getElementById("contactPhone");

    const emailInput =
        document.getElementById("contactEmail");

    const subjectInput =
        document.getElementById("contactSubject");

    const messageInput =
        document.getElementById("contactMessage");

    const privacyInput =
        document.getElementById("contactPrivacy");

    const toast =
        document.getElementById("contactToast");

    const cartCount =
        document.getElementById("cartCount");


    /* =====================================================
       CONTADOR DO CARRINHO
    ===================================================== */

    updateCartCounter();


    function updateCartCounter() {

        let cart = [];

        try {

            cart =
                JSON.parse(
                    localStorage.getItem(
                        CART_KEY
                    )
                ) || [];

        } catch (error) {

            cart = [];

        }


        const total =
            cart.reduce(
                (sum, item) => {

                    return (
                        sum +
                        Number(
                            item.quantity || 1
                        )
                    );

                },
                0
            );


        if (cartCount) {

            cartCount.textContent =
                total;

        }

    }


    /* =====================================================
       MÁSCARA DE WHATSAPP
    ===================================================== */

    phoneInput?.addEventListener(
        "input",
        event => {

            let value =
                event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 11);


            if (value.length > 10) {

                value =
                    value.replace(
                        /^(\d{2})(\d{5})(\d{4})$/,
                        "($1) $2-$3"
                    );

            } else if (value.length > 6) {

                value =
                    value.replace(
                        /^(\d{2})(\d{4})(\d{0,4})$/,
                        "($1) $2-$3"
                    );

            } else if (value.length > 2) {

                value =
                    value.replace(
                        /^(\d{2})(\d+)/,
                        "($1) $2"
                    );

            } else if (value.length > 0) {

                value =
                    value.replace(
                        /^(\d{0,2})/,
                        "($1"
                    );

            }


            event.target.value =
                value;

        }
    );


    /* =====================================================
       ENVIO DO FORMULÁRIO
    ===================================================== */

    form?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            /* =============================================
               PEGAR DADOS
            ============================================= */

            const name =
                nameInput?.value
                    .trim() || "";

            const phone =
                phoneInput?.value
                    .trim() || "";

            const email =
                emailInput?.value
                    .trim() || "";

            const subject =
                subjectInput?.value
                    .trim() || "";

            const message =
                messageInput?.value
                    .trim() || "";


            /* =============================================
               VALIDAÇÃO
            ============================================= */

            if (
                !name ||
                !phone ||
                !email ||
                !subject ||
                !message
            ) {

                showToast(
                    "CAMPOS INCOMPLETOS",
                    "Preencha todos os campos."
                );

                return;

            }


            if (!isValidEmail(email)) {

                showToast(
                    "E-MAIL INVÁLIDO",
                    "Digite um e-mail válido."
                );

                return;

            }


            if (
                privacyInput &&
                !privacyInput.checked
            ) {

                showToast(
                    "CONFIRMAÇÃO NECESSÁRIA",
                    "Aceite o envio dos dados para continuar."
                );

                return;

            }


            if (!database) {

                showToast(
                    "ERRO DE CONEXÃO",
                    "Não foi possível conectar ao sistema."
                );

                return;

            }


            /* =============================================
               BOTÃO
            ============================================= */

            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            const originalHTML =
                submitButton
                    ? submitButton.innerHTML
                    : "";


            if (submitButton) {

                submitButton.disabled =
                    true;


                submitButton.innerHTML = `

                    <span>
                        ENVIANDO...
                    </span>

                    <i class="
                        fa-solid
                        fa-spinner
                        fa-spin
                    "></i>

                `;

            }


            /* =============================================
               ID DA MENSAGEM
            ============================================= */

            const messageId =
                createMessageId();


            /* =============================================
               DOCUMENTO FIRESTORE
            ============================================= */

            const contactData = {

                id:
                    messageId,

                name:
                    name.slice(
                        0,
                        120
                    ),

                phone:
                    phone.slice(
                        0,
                        40
                    ),

                email:
                    email.slice(
                        0,
                        200
                    ),

                subject:
                    subject.slice(
                        0,
                        100
                    ),

                message:
                    message.slice(
                        0,
                        2000
                    ),

                read:
                    false,

                createdAt:
                    new Date()
                        .toISOString()

            };


            try {

                /* =========================================
                   SALVAR NO FIRESTORE
                ========================================= */

                await database
                    .collection("messages")
                    .doc(messageId)
                    .set(contactData);


                console.log(
                    "META VISION // Mensagem salva:",
                    messageId
                );


                /* =========================================
                   PREPARAR WHATSAPP
                ========================================= */

                const whatsappText =
                    createWhatsAppMessage(
                        contactData
                    );


                const whatsappURL =
                    "https://wa.me/" +
                    STORE_WHATSAPP +
                    "?text=" +
                    encodeURIComponent(
                        whatsappText
                    );


                /* =========================================
                   LIMPAR FORMULÁRIO
                ========================================= */

                form.reset();


                /* =========================================
                   CONFIRMAÇÃO
                ========================================= */

                showToast(
                    "MENSAGEM ENVIADA",
                    "Recebemos sua mensagem. Abrindo o WhatsApp..."
                );


                /* =========================================
                   ABRIR WHATSAPP
                ========================================= */

                setTimeout(
                    () => {

                        window.open(
                            whatsappURL,
                            "_blank",
                            "noopener,noreferrer"
                        );

                    },
                    700
                );


            } catch (error) {

                console.error(
                    "META VISION // Erro ao enviar:",
                    error
                );


                showToast(
                    "NÃO FOI POSSÍVEL ENVIAR",
                    getFirebaseErrorMessage(
                        error
                    )
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.innerHTML =
                        originalHTML;

                }

            }

        }
    );


    /* =====================================================
       MENSAGEM DO WHATSAPP
    ===================================================== */

    function createWhatsAppMessage(data) {

        return [
            "Olá! Entrei em contato pelo site META VISION.",
            "",
            `Nome: ${data.name}`,
            `WhatsApp: ${data.phone}`,
            `E-mail: ${data.email}`,
            `Assunto: ${data.subject}`,
            "",
            "Mensagem:",
            data.message,
            "",
            `Protocolo: ${data.id}`
        ].join("\n");

    }


    /* =====================================================
       GERAR ID
    ===================================================== */

    function createMessageId() {

        const timestamp =
            Date.now()
                .toString(36)
                .toUpperCase();


        const random =
            Math.random()
                .toString(36)
                .slice(2, 8)
                .toUpperCase();


        return (
            `MSG-${timestamp}-${random}`
        );

    }


    /* =====================================================
       VALIDAR E-MAIL
    ===================================================== */

    function isValidEmail(email) {

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(email);

    }


    /* =====================================================
       ERROS FIREBASE
    ===================================================== */

    function getFirebaseErrorMessage(
        error
    ) {

        const code =
            error?.code || "";


        if (
            code.includes(
                "permission-denied"
            )
        ) {

            return (
                "O Firestore bloqueou o envio. Verifique as regras publicadas."
            );

        }


        if (
            code.includes(
                "unavailable"
            )
        ) {

            return (
                "O serviço está temporariamente indisponível."
            );

        }


        return (
            "Tente novamente em alguns instantes."
        );

    }


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(
        title,
        message
    ) {

        if (!toast) {

            console.log(
                title,
                message
            );

            return;

        }


        const titleElement =
            toast.querySelector(
                "[data-toast-title]"
            ) ||
            document.getElementById(
                "toastTitle"
            );


        const messageElement =
            toast.querySelector(
                "[data-toast-message]"
            ) ||
            document.getElementById(
                "toastMessage"
            );


        if (titleElement) {

            titleElement.textContent =
                title;

        }


        if (messageElement) {

            messageElement.textContent =
                message;

        }


        toast.classList.add(
            "show"
        );


        clearTimeout(
            window.metaVisionContactToastTimer
        );


        window.metaVisionContactToastTimer =
            setTimeout(
                () => {

                    toast.classList.remove(
                        "show"
                    );

                },
                4000
            );

    }

});
