document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CATÁLOGO
    ===================================================== */

    const products = {

        "vanguard-road": {
            family: "OAKLEY META",
            name: "VANGUARD",
            variant: "PRIZM ROAD",
            category: "vanguard",
            image: "img/oakley-meta-vanguard.png",
            description:
                "Smart eyewear voltado à performance, combinando design esportivo, câmera, áudio open-ear e recursos inteligentes.",
            variants: [
                "PRIZM ROAD",
                "PRIZM BLACK",
                "PRIZM SAPPHIRE",
                "PRIZM 24K"
            ]
        },

        "vanguard-black": {
            family: "OAKLEY META",
            name: "VANGUARD",
            variant: "PRIZM BLACK",
            category: "vanguard",
            image: "img/oakley-meta-vanguard.png",
            description:
                "Configuração Vanguard com visual escuro e proposta esportiva, integrando captura, áudio e recursos inteligentes.",
            variants: [
                "PRIZM ROAD",
                "PRIZM BLACK",
                "PRIZM SAPPHIRE",
                "PRIZM 24K"
            ]
        },

        "vanguard-sapphire": {
            family: "OAKLEY META",
            name: "VANGUARD",
            variant: "PRIZM SAPPHIRE",
            category: "vanguard",
            image: "img/oakley-meta-vanguard.png",
            description:
                "Vanguard com configuração Prizm Sapphire e experiência inteligente integrada à armação.",
            variants: [
                "PRIZM ROAD",
                "PRIZM BLACK",
                "PRIZM SAPPHIRE",
                "PRIZM 24K"
            ]
        },

        "vanguard-24k": {
            family: "OAKLEY META",
            name: "VANGUARD",
            variant: "PRIZM 24K",
            category: "vanguard",
            image: "img/oakley-meta-vanguard.png",
            description:
                "Uma configuração Vanguard de estética marcante, desenvolvida para unir performance e tecnologia vestível.",
            variants: [
                "PRIZM ROAD",
                "PRIZM BLACK",
                "PRIZM SAPPHIRE",
                "PRIZM 24K"
            ]
        },

        "hstn-black": {
            family: "OAKLEY META",
            name: "HSTN",
            variant: "PRIZM BLACK POLARIZED",
            category: "hstn",
            image: null,
            description:
                "Smart eyewear de perfil lifestyle que combina o formato HSTN com câmera, áudio open-ear e recursos inteligentes.",
            variants: [
                "PRIZM BLACK POLARIZED",
                "PRIZM RUBY",
                "TRANSITIONS GREY",
                "CLEAR"
            ]
        },

        "hstn-ruby": {
            family: "OAKLEY META",
            name: "HSTN",
            variant: "PRIZM RUBY",
            category: "hstn",
            image: null,
            description:
                "Oakley Meta HSTN com proposta lifestyle e recursos conectados integrados ao design da armação.",
            variants: [
                "PRIZM BLACK POLARIZED",
                "PRIZM RUBY",
                "TRANSITIONS GREY",
                "CLEAR"
            ]
        },

        "hstn-grey": {
            family: "OAKLEY META",
            name: "HSTN",
            variant: "TRANSITIONS GREY",
            category: "hstn",
            image: null,
            description:
                "Configuração HSTN com lente Transitions Grey e tecnologia inteligente integrada.",
            variants: [
                "PRIZM BLACK POLARIZED",
                "PRIZM RUBY",
                "TRANSITIONS GREY",
                "CLEAR"
            ]
        },

        "hstn-clear": {
            family: "OAKLEY META",
            name: "HSTN",
            variant: "CLEAR",
            category: "hstn",
            image: null,
            description:
                "Versão HSTN Clear com estética versátil e experiência de smart eyewear integrada.",
            variants: [
                "PRIZM BLACK POLARIZED",
                "PRIZM RUBY",
                "TRANSITIONS GREY",
                "CLEAR"
            ]
        }

    };


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        params.get("id") ||
        "vanguard-road";


    const product =
        products[productId] ||
        products["vanguard-road"];


    const productName =
        document.getElementById(
            "productName"
        );

    const productVariant =
        document.getElementById(
            "productVariant"
        );

    const selectedVariant =
        document.getElementById(
            "selectedVariant"
        );

    const productDescription =
        document.getElementById(
            "productDescription"
        );

    const productFamily =
        document.getElementById(
            "productFamily"
        );

    const breadcrumb =
        document.getElementById(
            "breadcrumbProduct"
        );

    const variantSelector =
        document.getElementById(
            "variantSelector"
        );

    const mainImage =
        document.getElementById(
            "mainProductImage"
        );

    const mainImageContainer =
        document.getElementById(
            "productMainImage"
        );

    const hstnPlaceholder =
        document.getElementById(
            "hstnPlaceholder"
        );

    const quantityElement =
        document.getElementById(
            "quantity"
        );

    const minusButton =
        document.getElementById(
            "quantityMinus"
        );

    const plusButton =
        document.getElementById(
            "quantityPlus"
        );

    const addButton =
        document.getElementById(
            "addToCart"
        );

    const cartToast =
        document.getElementById(
            "cartToast"
        );


    let quantity = 1;

    let currentVariant =
        product.variant;


    /* =====================================================
       EXIBIR PRODUTO
    ===================================================== */

    function renderProduct() {

        if (productName) {
            productName.textContent =
                product.name;
        }


        if (productVariant) {
            productVariant.textContent =
                currentVariant;
        }


        if (selectedVariant) {
            selectedVariant.textContent =
                currentVariant;
        }


        if (productDescription) {
            productDescription.textContent =
                product.description;
        }


        if (productFamily) {
            productFamily.textContent =
                product.family;
        }


        if (breadcrumb) {
            breadcrumb.textContent =
                `${product.name} / ${currentVariant}`;
        }


        document.title =
            `${product.name} ${currentVariant} | META VISION`;


        /* IMAGEM */

        if (
            product.category ===
            "hstn"
        ) {

            if (mainImageContainer) {
                mainImageContainer.hidden =
                    true;
            }

            if (hstnPlaceholder) {
                hstnPlaceholder.hidden =
                    false;
            }

        } else {

            if (mainImageContainer) {
                mainImageContainer.hidden =
                    false;
            }

            if (hstnPlaceholder) {
                hstnPlaceholder.hidden =
                    true;
            }

            if (
                mainImage &&
                product.image
            ) {

                mainImage.src =
                    product.image;

            }

        }


        renderVariants();

    }


    /* =====================================================
       VARIANTES
    ===================================================== */

    function renderVariants() {

        if (!variantSelector) {
            return;
        }


        variantSelector.innerHTML =
            "";


        product.variants.forEach(
            variant => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "variant-button";


                button.textContent =
                    variant;


                if (
                    variant ===
                    currentVariant
                ) {

                    button.classList.add(
                        "active"
                    );

                }


                button.addEventListener(
                    "click",
                    () => {

                        currentVariant =
                            variant;


                        if (productVariant) {
                            productVariant.textContent =
                                variant;
                        }


                        if (selectedVariant) {
                            selectedVariant.textContent =
                                variant;
                        }


                        if (breadcrumb) {
                            breadcrumb.textContent =
                                `${product.name} / ${variant}`;
                        }


                        renderVariants();

                    }
                );


                variantSelector.appendChild(
                    button
                );

            }
        );

    }


    /* =====================================================
       QUANTIDADE
    ===================================================== */

    function renderQuantity() {

        if (quantityElement) {
            quantityElement.textContent =
                quantity;
        }

    }


    if (minusButton) {

        minusButton.addEventListener(
            "click",
            () => {

                if (quantity > 1) {

                    quantity--;

                    renderQuantity();

                }

            }
        );

    }


    if (plusButton) {

        plusButton.addEventListener(
            "click",
            () => {

                if (quantity < 10) {

                    quantity++;

                    renderQuantity();

                }

            }
        );

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


        updateCartCounter();

    }


    function updateCartCounter() {

        const cartCount =
            document.getElementById(
                "cartCount"
            );


        if (!cartCount) {
            return;
        }


        const cart =
            getCart();


        const total =
            cart.reduce(
                (sum, item) => {

                    return (
                        sum +
                        Number(
                            item.quantity ||
                            1
                        )
                    );

                },
                0
            );


        cartCount.textContent =
            total;

    }


    function addToCart() {

        const cart =
            getCart();


        /*
           Cada variante é tratada
           como item diferente.
        */

        const cartKey =
            `${productId}-${currentVariant}`;


        const existingItem =
            cart.find(
                item =>
                    item.cartKey ===
                    cartKey
            );


        if (existingItem) {

            existingItem.quantity =
                Math.min(
                    Number(
                        existingItem.quantity
                    ) + quantity,
                    10
                );

        } else {

            cart.push({

                cartKey:
                    cartKey,

                productId:
                    productId,

                family:
                    product.family,

                name:
                    product.name,

                variant:
                    currentVariant,

                category:
                    product.category,

                image:
                    product.image,

                quantity:
                    quantity

            });

        }


        saveCart(cart);


        showToast();

    }


    if (addButton) {

        addButton.addEventListener(
            "click",
            addToCart
        );

    }


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast() {

        if (!cartToast) {
            return;
        }


        cartToast.classList.add(
            "show"
        );


        clearTimeout(
            window.metaVisionToast
        );


        window.metaVisionToast =
            setTimeout(
                () => {

                    cartToast
                        .classList
                        .remove(
                            "show"
                        );

                },
                3000
            );

    }


    /* =====================================================
       PARALLAX DO PRODUTO
    ===================================================== */

    const productVisual =
        document.getElementById(
            "productVisual"
        );


    if (
        productVisual &&
        mainImage &&
        product.category !== "hstn" &&
        window.matchMedia(
            "(pointer: fine)"
        ).matches
    ) {

        productVisual.addEventListener(
            "mousemove",
            event => {

                const rect =
                    productVisual
                        .getBoundingClientRect();


                const x =
                    (
                        event.clientX -
                        rect.left
                    ) / rect.width;


                const y =
                    (
                        event.clientY -
                        rect.top
                    ) / rect.height;


                const rotateY =
                    (x - .5) * 10;


                const rotateX =
                    (y - .5) * -7;


                mainImage.style.animation =
                    "none";


                mainImage.style.transform =
                    `rotateX(${rotateX}deg)
                     rotateY(${rotateY}deg)
                     translateY(-5px)`;

            }
        );


        productVisual.addEventListener(
            "mouseleave",
            () => {

                mainImage.style.transform =
                    "";

                mainImage.style.animation =
                    "";

            }
        );

    }


    /* =====================================================
       START
    ===================================================== */

    renderProduct();

    renderQuantity();

    updateCartCounter();

});
