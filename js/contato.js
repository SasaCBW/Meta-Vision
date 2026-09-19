document.addEventListener("DOMContentLoaded", () => {

    /*
        =====================================================
        META VISION — CONTATO

        IMPORTANTE:

        Coloque abaixo o número de WhatsApp
        que receberá as mensagens da loja.

        Formato:
        55 + DDD + número

        Exemplo:
        5542999999999
        =====================================================
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


            const quantity =
                cart.reduce(
                    (total, item) => {

                        return (
                            total +
                            Number(
                                item.quantity ||
                                1
                            )
                        );

                    },
                    0
                );


            counter.textContent =
                quantity;

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
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            11
                        );


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


        toast.classList.add(
            "show"
        );


        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

    }


    /* =====================================================
       FORM
    ===================================================== */

    if (form) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const name =
                    document
                        .getElementById(
                            "contactName"
                        )
                        .value
                        .trim();


                const phone =
                    document
                        .getElementById(
                            "contactPhone"
                        )
                        .value
                        .trim();


                const email =
                    document
                        .getElementById(
                            "contactEmail"
                        )
                        .value
                        .trim();


                const subject =
                    document
                        .getElementById(
                            "contactSubject"
                        )
                        .value;


                const message =
                    document
                        .getElementById(
                            "contactMessage"
                        )
                        .value
                        .trim();


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


                const contactData = {

                    id:
                        "MSG-" +
                        Date.now(),

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

                    createdAt:
                        new Date()
                            .toISOString()

                };


                /*
                    Salva localmente por enquanto.

                    Quando conectarmos Firebase,
                    estas mensagens irão para
                    o painel administrativo.
                */

                let messages = [];


                try {

                    messages =
                        JSON.parse(
                            localStorage.getItem(
                                "metaVisionMessages"
                            )
                        ) || [];

                } catch (error) {

                    messages = [];

                }


                messages.push(
                    contactData
                );


                localStorage.setItem(
                    "metaVisionMessages",
                    JSON.stringify(
                        messages
                    )
                );


                /*
                    Mensagem pronta para WhatsApp
                */

                const whatsappMessage =
`Olá! Vim pelo site META VISION.

Nome: ${name}
E-mail: ${email}
Telefone: ${phone}

Assunto: ${subject}

Mensagem:
${message}`;


                showToast();


                /*
                    Se ainda não houver WhatsApp
                    configurado, apenas salvamos
                    a solicitação localmente.
                */

                if (!STORE_WHATSAPP) {

                    alert(
                        "Mensagem registrada no site. O WhatsApp da loja ainda precisa ser configurado."
                    );

                    form.reset();

                    return;

                }


                const whatsappURL =
                    "https://wa.me/" +
                    STORE_WHATSAPP +
                    "?text=" +
                    encodeURIComponent(
                        whatsappMessage
                    );


                window.open(
                    whatsappURL,
                    "_blank",
                    "noopener,noreferrer"
                );


                form.reset();

            }
        );

    }


    /* =====================================================
       START
    ===================================================== */

    updateCartCounter();

});
