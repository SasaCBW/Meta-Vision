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
       LOCAL STORAGE
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


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value || "")
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
                        alt="${name} ${variant}"
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
                        OAKLEY META
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
                            SMART EYEWEAR
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
                            aria-label="Diminuir quantidade"
                        >
                            −
                        </button>


                        <strong>
                            ${Number(item.quantity || 1)}
                        </strong>


                        <button
                            type="button"
                            data-plus="${index}"
                            aria-label="Aumentar quantidade"
                        >
                            +
                        </button>

                    </div>


                    <span class="item-price-label">
                        PREÇO SOB CONSULTA
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


        if (!cartItems) {
            return;
        }


        cartItems.innerHTML = "";


        if (cart.length === 0) {

            if (emptyCart) {
                emptyCart.classList.add(
                    "visible"
                );
            }

            if (cartActions) {
                cartActions.style.display =
                    "none";
            }

            if (checkoutButton) {
                checkoutButton.disabled =
                    true;
            }

        } else {

            if (emptyCart) {
                emptyCart.classList.remove(
                    "visible"
                );
            }

            if (cartActions) {
                cartActions.style.display =
                    "";
            }

            if (checkoutButton) {
                checkoutButton.disabled =
                    false;
            }


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

        bindItemButtons();

    }


    /* =====================================================
       SUMMARY
    ===================================================== */

    function updateSummary(cart) {

        const totalQuantity =
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


        if (summaryItems) {
            summaryItems.textContent =
                cart.length;
        }


        if (summaryQuantity) {
            summaryQuantity.textContent =
                totalQuantity;
        }


        if (cartCount) {
            cartCount.textContent =
                totalQuantity;
        }

    }


    /* =====================================================
       CONTROLES
    ===================================================== */

    function bindItemButtons() {

        document
            .querySelectorAll(
                "[data-minus]"
            )
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
            .querySelectorAll(
                "[data-plus]"
            )
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
            .querySelectorAll(
                "[data-remove]"
            )
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


    function changeQuantity(
        index,
        amount
    ) {

        const cart =
            getCart();


        if (!cart[index]) {
            return;
        }


        let newQuantity =
            Number(
                cart[index].quantity ||
                1
            ) + amount;


        if (newQuantity < 1) {
            newQuantity = 1;
        }


        if (newQuantity > 10) {
            newQuantity = 10;
        }


        cart[index].quantity =
            newQuantity;


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

    if (clearCartButton) {

        clearCartButton.addEventListener(
            "click",
            () => {

                const confirmed =
                    window.confirm(
                        "Deseja remover todos os produtos do carrinho?"
                    );


                if (!confirmed) {
                    return;
                }


                localStorage.removeItem(
                    "metaVisionCart"
                );


                renderCart();

            }
        );

    }


    /* =====================================================
       MODAL
    ===================================================== */

    function openCheckout() {

        const cart =
            getCart();


        if (
            cart.length === 0 ||
            !checkoutModal
        ) {
            return;
        }


        checkoutModal.classList.add(
            "active"
        );


        document.body.style.overflow =
            "hidden";

    }


    function closeCheckoutModal() {

        if (!checkoutModal) {
            return;
        }


        checkoutModal.classList.remove(
            "active"
        );


        document.body.style.overflow =
            "";

    }


    if (checkoutButton) {

        checkoutButton.addEventListener(
            "click",
            openCheckout
        );

    }


    if (closeCheckout) {

        closeCheckout.addEventListener(
            "click",
            closeCheckoutModal
        );

    }


    if (checkoutOverlay) {

        checkoutOverlay.addEventListener(
            "click",
            closeCheckoutModal
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeCheckoutModal();

            }

        }
    );


    /* =====================================================
       TELEFONE
    ===================================================== */

    const phoneInput =
        document.getElementById(
            "customerPhone"
        );


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
       GERAR PEDIDO
    ===================================================== */

    if (checkoutForm) {

        checkoutForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const cart =
                    getCart();


                if (cart.length === 0) {
                    return;
                }


                const customer = {

                    name:
                        document
                            .getElementById(
                                "customerName"
                            )
                            .value
                            .trim(),

                    email:
                        document
                            .getElementById(
                                "customerEmail"
                            )
                            .value
                            .trim(),

                    phone:
                        document
                            .getElementById(
                                "customerPhone"
                            )
                            .value
                            .trim(),

                    city:
                        document
                            .getElementById(
                                "customerCity"
                            )
                            .value
                            .trim(),

                    notes:
                        document
                            .getElementById(
                                "customerNotes"
                            )
                            .value
                            .trim()

                };


                const order = {

                    id:
                        "MV-" +
                        Date.now(),

                    customer:
                        customer,

                    products:
                        cart,

                    status:
                        "pending",

                    createdAt:
                        new Date()
                            .toISOString()

                };


                /*
                   Por enquanto o pedido
                   fica salvo no navegador.

                   Depois vamos trocar esta
                   parte pelo Firebase.
                */

                const orders =
                    getLocalOrders();


                orders.push(
                    order
                );


                localStorage.setItem(
                    "metaVisionOrders",
                    JSON.stringify(
                        orders
                    )
                );


                closeCheckoutModal();


                showSuccess();


                checkoutForm.reset();


                /*
                   NÃO apagamos o carrinho
                   automaticamente ainda.

                   Quando ligarmos o Firebase,
                   apagaremos somente depois
                   que o pedido for gravado
                   com sucesso.
                */

            }
        );

    }


    function getLocalOrders() {

        try {

            return (
                JSON.parse(
                    localStorage.getItem(
                        "metaVisionOrders"
                    )
                ) || []
            );

        } catch (error) {

            return [];

        }

    }


    /* =====================================================
       SUCCESS
    ===================================================== */

    function showSuccess() {

        if (!orderSuccess) {
            return;
        }


        orderSuccess.classList.add(
            "show"
        );


        setTimeout(
            () => {

                orderSuccess
                    .classList
                    .remove(
                        "show"
                    );

            },
            4000
        );

    }


    /* =====================================================
       START
    ===================================================== */

    renderCart();

});
