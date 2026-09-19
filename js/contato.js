document.addEventListener("DOMContentLoaded", () => {

    /*
       Colocaremos o WhatsApp real
       da META VISION aqui depois.
    */

    const STORE_WHATSAPP = "";


    const form =
        document.getElementById(
            "contactForm"
        );

    const phoneInput =
        document.getElementById(
            "contactPhone"
        );

    const submitButton =
        document.getElementById(
            "contactSubmit"
        );

    const toast =
        document.getElementById(
            "contactToast"
        );


    /* =====================================================
       FIRESTORE
    ===================================================== */

    let database = null;


    if (
        typeof firebase !== "undefined" &&
        firebase.apps &&
        firebase.apps.length &&
        firebase.firestore
    ) {

        database =
            firebase.firestore();

    }


    /* =====================================================
       CARRINHO
    ===================================================== */

    function updateCartCounter() {

        const counter =
            document.getElementById(
                "cartCount"
            );


        if (!counter) {
            return;
        }


        try {

            const cart =
                JSON.parse(
                    localStorage.getItem(
                        "metaVisionCart"
                    )
                ) || [];


            counter.textContent =
                cart.reduce(
                    (total, item) =>
                        total +
                        Number(
                            item.quantity ||
                            1
                        ),
                    0
                );

        } catch (error) {

            counter.textContent =
                "0";

        }

    }


    /* =====================================================
       TELEFONE
    ===================================================== */

    if (phoneInput) {

        phoneInput.addEventListener(
            "input",
            event => {

                let value =
                    event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 11);


                if (value.length > 10) {

                    value =
                        value.replace(
                            /(\d{2})(\d{5})(\d{4})/,
                            "($1) $2-$3"
                        );

                } else if (
                    value.length > 6
                ) {

                    value =
                        value.replace(
                            /(\d{2})(\d{4})(\d{0,4})/,
                            "($1) $2-$3"
                        );

                } else if (
                    value.length > 2
                ) {

                    value =
                        value.replace(
                            /(\d{2})(\d+)/,
                            "($1) $2"
                        );

                }


                event.target.value =
                    value;

            }
        );

    }


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast() {

        if (!toast) {
            return;
        }


        const title =
            toast.querySelector(
                "strong"
            );

        const text =
            toast.querySelector(
                "span"
            );


        if (title) {

            title.textContent =
                "MENSAGEM ENVIADA";

        }


        if (text) {

            text.textContent =
                "Recebemos sua solicitação.";

        }


        toast.classList.add(
            "show"
        );


        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            4000
        );

    }


    /* =====================================================
       FORMULÁRIO
    ===================================================== */

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!database) {

                alert(
                    "Não foi possível conectar ao atendimento."
                );

                return;

            }


            const name =
                document
                    .getElementById(
                        "contactName"
                    )
                    .value
                    .trim()
                    .slice(0, 120);


            const phone =
                document
                    .getElementById(
                        "contactPhone"
                    )
                    .value
                    .trim()
                    .slice(0, 40);


            const email =
                document
                    .getElementById(
                        "contactEmail"
                    )
                    .value
                    .trim()
                    .slice(0, 200);


            const subject =
                document
                    .getElementById(
                        "contactSubject"
                    )
                    .value
                    .slice(0, 100);


            const message =
                document
                    .getElementById(
                        "contactMessage"
                    )
                    .value
                    .trim()
                    .slice(0, 2000);


            if (
                !name ||
                !phone ||
                !email ||
                !subject ||
                !message
            ) {

                alert(
                    "Preencha todos os campos."
                );

                return;

            }


            const messageId =
                "MSG-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .slice(2, 7)
                    .toUpperCase();


            const contactData = {

                id:
                    messageId,

                name:
                    name,

                phone:
                    phone,

                email:
                    email,

                subject:
                    subject,

                message:
                    message,

                read:
                    false,

                createdAt:
                    new Date()
                        .toISOString()

            };


            submitButton.disabled =
                true;


            const buttonText =
                submitButton.querySelector(
                    "span"
                );


            if (buttonText) {

                buttonText.textContent =
                    "ENVIANDO...";

            }


            try {

                await database
                    .collection("messages")
                    .doc(messageId)
                    .set(contactData);


                showToast();


                /*
                   WhatsApp é opcional.

                   A mensagem já foi salva
                   no Firestore antes daqui.
                */

                if (STORE_WHATSAPP) {

                    const whatsappMessage =
`Olá! Vim pelo site META VISION.

Nome: ${name}
E-mail: ${email}
Telefone: ${phone}

Assunto: ${subject}

Mensagem:
${message}`;


                    const url =
                        "https://wa.me/" +
                        STORE_WHATSAPP +
                        "?text=" +
                        encodeURIComponent(
                            whatsappMessage
                        );


                    window.open(
                        url,
                        "_blank",
                        "noopener,noreferrer"
                    );

                }


                form.reset();


            } catch (error) {

                console.error(
                    "Erro ao enviar mensagem:",
                    error
                );


                alert(
                    "Não foi possível enviar a mensagem. Tente novamente."
                );


            } finally {

                submitButton.disabled =
                    false;


                if (buttonText) {

                    buttonText.textContent =
                        "ENVIAR MENSAGEM";

                }

            }

        }
    );


    updateCartCounter();

});
