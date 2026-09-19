document.addEventListener("DOMContentLoaded", async () => {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const productId =
        params.get("id");


    if (!productId) {

        window.location.replace(
            "produtos.html"
        );

        return;
    }


    if (
        typeof firebase === "undefined" ||
        !firebase.apps.length
    ) {

        return;
    }


    const db =
        firebase.firestore();


    try {

        const document =
            await db
                .collection("products")
                .doc(productId)
                .get();


        if (!document.exists) {

            window.location.replace(
                "produtos.html"
            );

            return;
        }


        const product = {

            id:
                document.id,

            ...document.data()

        };


        renderProduct(product);


    } catch (error) {

        console.error(
            "Produto:",
            error
        );

    }


    function renderProduct(product) {

        setText(
            "breadcrumbProduct",
            product.name
        );

        setText(
            "productFamily",
            product.family
        );

        setText(
            "productName",
            product.name
        );

        setText(
            "productVariant",
            product.variant
        );

        setText(
            "selectedVariant",
            product.variant
        );

        setText(
            "productDescription",
            product.description ||
            "Smart eyewear META VISION."
        );

        setText(
            "productPrice",
            product.price ||
            "SOB CONSULTA"
        );


        const image =
            document.getElementById(
                "mainProductImage"
            );


        const placeholder =
            document.getElementById(
                "hstnPlaceholder"
            );


        if (
            product.imageURL &&
            image
        ) {

            image.src =
                product.imageURL;

            image.alt =
                product.name || "Produto";

            image.style.display =
                "block";


            if (placeholder) {

                placeholder.style.display =
                    "none";

            }

        } else {

            if (image) {

                image.style.display =
                    "none";

            }


            if (placeholder) {

                placeholder.style.display =
                    "";

            }

        }


        const selector =
            document.getElementById(
                "variantSelector"
            );


        if (selector) {

            selector.innerHTML = `

                <button
                    type="button"
                    class="variant-button active"
                >

                    ${escapeHTML(
                        product.variant ||
                        "Padrão"
                    )}

                </button>

            `;

        }


        setupQuantity();

        setupCart(product);

    }


    function setupQuantity() {

        const value =
            document.getElementById(
                "quantity"
            );


        const minus =
            document.getElementById(
                "quantityMinus"
            );


        const plus =
            document.getElementById(
                "quantityPlus"
            );


        let quantity = 1;


        const update = () => {

            if (value) {

                value.textContent =
                    quantity;

            }

        };


        minus?.addEventListener(
            "click",
            () => {

                quantity =
                    Math.max(
                        1,
                        quantity - 1
                    );

                update();

            }
        );


        plus?.addEventListener(
            "click",
            () => {

                quantity =
                    Math.min(
                        10,
                        quantity + 1
                    );

                update();

            }
        );

    }


    function setupCart(product) {

        const button =
            document.getElementById(
                "addToCart"
            );


        button?.addEventListener(
            "click",
            () => {

                const quantity =
                    Number(
                        document
                            .getElementById(
                                "quantity"
                            )
                            ?.textContent ||
                        1
                    );


                let cart = [];


                try {

                    cart =
                        JSON.parse(
                            localStorage.getItem(
                                "metaVisionCart"
                            )
                        ) || [];

                } catch (error) {

                    cart = [];

                }


                const existing =
                    cart.find(
                        item =>
                            item.productId ===
                            product.id
                    );


                if (existing) {

                    existing.quantity =
                        Math.min(
                            10,
                            Number(
                                existing.quantity ||
                                1
                            ) +
                            quantity
                        );

                } else {

                    cart.push({

                        productId:
                            product.id,

                        family:
                            product.family || "",

                        name:
                            product.name || "",

                        variant:
                            product.variant || "",

                        category:
                            String(
                                product.family ||
                                ""
                            ).toLowerCase(),

                        image:
                            product.imageURL ||
                            "",

                        quantity:
                            quantity

                    });

                }


                localStorage.setItem(
                    "metaVisionCart",
                    JSON.stringify(cart)
                );


                updateCartCounter(
                    cart
                );


                showCartToast();

            }
        );

    }


    function updateCartCounter(cart) {

        const count =
            cart.reduce(
                (total, item) =>
                    total +
                    Number(
                        item.quantity || 1
                    ),
                0
            );


        const element =
            document.getElementById(
                "cartCount"
            );


        if (element) {

            element.textContent =
                count;

        }

    }


    function showCartToast() {

        const toast =
            document.getElementById(
                "cartToast"
            );


        toast?.classList.add(
            "show"
        );


        setTimeout(
            () => {

                toast?.classList.remove(
                    "show"
                );

            },
            3000
        );

    }


    function setText(id, value) {

        const element =
            document.getElementById(id);


        if (element) {

            element.textContent =
                value || "";

        }

    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }

});
