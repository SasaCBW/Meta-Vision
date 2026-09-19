document.addEventListener("DOMContentLoaded", () => {

    const cartItems =
        document.getElementById("cartItems");

    const emptyCart =
        document.getElementById("emptyCart");

    const cartActions =
        document.getElementById("cartActions");

    const clearCartButton =
        document.getElementById("clearCart");

    const checkoutButton =
        document.getElementById("checkoutButton");

    const checkoutModal =
        document.getElementById("checkoutModal");

    const checkoutOverlay =
        document.getElementById("checkoutOverlay");

    const closeCheckout =
        document.getElementById("closeCheckout");

    const checkoutForm =
        document.getElementById("checkoutForm");

    const summaryItems =
        document.getElementById("summaryItems");

    const summaryQuantity =
        document.getElementById("summaryQuantity");

    const cartCount =
        document.getElementById("cartCount");

    const orderSuccess =
        document.getElementById("orderSuccess");


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

    function getCart() {

        try {

            return (
                JSON.parse(
                    localStorage.getItem(
                        "metaVisionCart"
                    )
                ) || []
            );

        } catch (error) {

            return [];

        }

    }


    function saveCart(cart) {

        localStorage.setItem(
            "metaVisionCart",
            JSON.stringify(cart)
        );

        renderCart();

    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    /* =====================================================
       ITEM
    ===================================================== */

    function createItemHTML(item, index) {

        const name =
            escapeHTML(item.name);

        const variant =
            escapeHTML(item.variant);

        const family =
            escapeHTML(
                item.family ||
                "OAKLEY META"
            );


        let imageHTML;


        if (
            item.image &&
            item.category !== "hstn"
        ) {

            imageHTML = `

                <div class="cart-product-image">

                    <img
                        src="${escapeHTML(item.image)}"
                        alt="${name}"
                    >

                </div>

            `;

        } else {

            imageHTML = `

                <div class="
                    cart-product-image
                    cart-product-image-placeholder
                ">

                    <small>
                        SMART EYEWEAR
                    </small>

                    <strong>
                        HSTN
                    </strong>

                </div>

            `;

        }


        return `

            <article
                class="cart-item"
                data-index="${index}"
            >

                <div class="cart-product-main">

                    ${imageHTML}

                    <div class="cart-product-data">

                        <span>
                            ${family}
                        </span>

                        <h3>
                            ${name}
                        </h3>

                        <strong>
                            ${variant}
                        </strong>

                        <small>
                            PREÇO SOB CONSULTA
                        </small>

                        <button
                            type="button"
                            class="remove-item"
                            data-remove="${index}"
                        >

                            <i class="
                                fa-regular
                                fa-trash-can
                            "></i>

                            REMOVER

                        </button>

                    </div>

                </div>


                <div class="cart-item-controls">

                    <div class="cart-quantity">

                        <button
                            type="button"
                            data-minus="${index}"
                        >
                            −
                        </button>

                        <strong>
                            ${Number(item.quantity || 1)}
                        </strong>

                        <button
                            type="button"
                            data-plus="${index}"
                        >
                            +
                        </button>

                    </div>

                    <span class="item-price-label">
                        SOB CONSULTA
                    </span>

                </div>

            </article>

        `;

    }


    /* =====================================================
       RENDER
    ===================================================== */

    function renderCart() {

        const cart =
            getCart();


        cartItems.innerHTML = "";


        if (!cart.length) {

            emptyCart.classList.add(
                "visible"
            );

            cartActions.style.display =
                "none";

            checkoutButton.disabled =
                true;

        } else {

            emptyCart.classList.remove(
                "visible"
            );

            cartActions.style.display =
                "";

            checkoutButton.disabled =
                false;


            cart.forEach(
                (item, index) => {

                    cartItems.insertAdjacentHTML(
                        "beforeend",
                        createItemHTML(
                            item,
                            index
                        )
                    );

                }
            );

        }


        updateSummary(cart);

        bindControls();

    }


    function updateSummary(cart) {

        const quantity =
            cart.reduce(
                (total, item) =>
                    total +
                    Number(
                        item.quantity || 1
                    ),
                0
            );


        summaryItems.textContent =
            cart.length;

        summaryQuantity.textContent =
            quantity;

        if (cartCount) {

            cartCount.textContent =
                quantity;

        }

    }


    /* =====================================================
       CONTROLES
    ===================================================== */

    function bindControls() {

        document
            .querySelectorAll("[data-minus]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        changeQuantity(
                            Number(
                                button.dataset.minus
                            ),
                            -1
                        );

                    }
                );

            });


        document
            .querySelectorAll("[data-plus]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        changeQuantity(
                            Number(
                                button.dataset.plus
                            ),
                            1
                        );

                    }
                );

            });


        document
            .querySelectorAll("[data-remove]")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        removeItem(
                            Number(
                                button.dataset.remove
                            )
                        );

                    }
                );

            });

    }


    function changeQuantity(index, change) {

        const cart =
            getCart();


        if (!cart[index]) {
            return;
        }


        let quantity =
            Number(
                cart[index].quantity || 1
            ) + change;


        quantity =
            Math.max(
                1,
                Math.min(
                    10,
                    quantity
                )
            );


        cart[index].quantity =
            quantity;


        saveCart(cart);

    }


    function removeItem(index) {

        const cart =
            getCart();


        cart.splice(
            index,
            1
        );


        saveCart(cart);

    }


    /* =====================================================
       LIMPAR
    ===================================================== */

    clearCartButton.addEventListener(
        "click",
        () => {

            if (
                !confirm(
                    "Deseja limpar o carrinho?"
                )
            ) {

                return;

            }


            localStorage.removeItem(
                "metaVisionCart"
            );


            renderCart();

        }
    );


    /* =====================================================
       MODAL
    ===================================================== */

    function openModal() {

        if (!getCart().length) {
            return;
        }


        checkoutModal.classList.add(
            "active"
        );


        document.body.style.overflow =
            "hidden";

    }


    function closeModal() {

        checkoutModal.classList.remove(
            "active"
        );


        document.body.style.overflow =
            "";

    }


    checkoutButton.addEventListener(
        "click",
        openModal
    );


    closeCheckout.addEventListener(
        "click",
        closeModal
    );


    checkoutOverlay.addEventListener(
        "click",
        closeModal
    );


    /* =====================================================
       TELEFONE
    ===================================================== */

    const phoneInput =
        document.getElementById(
            "customerPhone"
        );


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


    /* =====================================================
       FINALIZAR PEDIDO
    ===================================================== */

    checkoutForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const cart =
                getCart();


            if (!cart.length) {
                return;
            }


            if (!database) {

                alert(
                    "Não foi possível conectar ao sistema de pedidos."
                );

                return;

            }


            const submitButton =
                checkoutForm.querySelector(
                    ".send-order-button"
                );


            submitButton.disabled =
                true;


            submitButton.querySelector(
                "span"
            ).textContent =
                "ENVIANDO...";


            const orderId =
                "MV-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .slice(2, 7)
                    .toUpperCase();


            const customer = {

                name:
                    document
                        .getElementById(
                            "customerName"
                        )
                        .value
                        .trim()
                        .slice(0, 120),

                email:
                    document
                        .getElementById(
                            "customerEmail"
                        )
                        .value
                        .trim()
                        .slice(0, 200),

                phone:
                    document
                        .getElementById(
                            "customerPhone"
                        )
                        .value
                        .trim()
                        .slice(0, 40),

                city:
                    document
                        .getElementById(
                            "customerCity"
                        )
                        .value
                        .trim()
                        .slice(0, 120),

                notes:
                    document
                        .getElementById(
                            "customerNotes"
                        )
                        .value
                        .trim()
                        .slice(0, 1000)

            };


            /*
               Enviamos apenas os campos
               necessários dos produtos.
            */

            const products =
                cart
                    .slice(0, 20)
                    .map(item => ({

                        productId:
                            String(
                                item.productId ||
                                ""
                            ).slice(0, 100),

                        family:
                            String(
                                item.family ||
                                ""
                            ).slice(0, 100),

                        name:
                            String(
                                item.name ||
                                ""
                            ).slice(0, 150),

                        variant:
                            String(
                                item.variant ||
                                ""
                            ).slice(0, 150),

                        quantity:
                            Math.max(
                                1,
                                Math.min(
                                    10,
                                    Number(
                                        item.quantity ||
                                        1
                                    )
                                )
                            )

                    }));


            const order = {

                id:
                    orderId,

                customer:
                    customer,

                products:
                    products,

                status:
                    "pending",

                createdAt:
                    new Date()
                        .toISOString()

            };


            try {

                await database
                    .collection("orders")
                    .doc(orderId)
                    .set(order);


                /*
                   Só apagamos o carrinho
                   depois da confirmação
                   do Firestore.
                */

                localStorage.removeItem(
                    "metaVisionCart"
                );


                checkoutForm.reset();


                closeModal();


                renderCart();


                showSuccess(
                    orderId
                );


            } catch (error) {

                console.error(
                    "Erro ao enviar pedido:",
                    error
                );


                alert(
                    "Não foi possível enviar o pedido. Tente novamente."
                );


            } finally {

                submitButton.disabled =
                    false;


                submitButton.querySelector(
                    "span"
                ).textContent =
                    "GERAR SOLICITAÇÃO";

            }

        }
    );


    /* =====================================================
       SUCESSO
    ===================================================== */

    function showSuccess(orderId) {

        if (!orderSuccess) {
            return;
        }


        const text =
            orderSuccess.querySelector(
                "span"
            );


        if (text) {

            text.textContent =
                "Pedido " +
                orderId +
                " enviado com sucesso.";

        }


        orderSuccess.classList.add(
            "show"
        );


        setTimeout(
            () => {

                orderSuccess.classList.remove(
                    "show"
                );

            },
            5000
        );

    }


    renderCart();

});
