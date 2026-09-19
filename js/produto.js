document.addEventListener("DOMContentLoaded", () => {

    const grid =
        document.getElementById(
            "productsGrid"
        ) ||
        document.getElementById(
            "productGrid"
        );


    const searchInput =
        document.getElementById(
            "productSearch"
        );


    const counter =
        document.getElementById(
            "visibleProducts"
        );


    const filterButtons =
        document.querySelectorAll(
            "[data-filter]"
        );


    let products = [];

    let activeFilter = "all";


    if (
        typeof firebase === "undefined" ||
        !firebase.apps.length ||
        !firebase.firestore
    ) {

        console.error(
            "Firestore não carregado."
        );

        return;
    }


    const db =
        firebase.firestore();


    /* =====================================================
       FIRESTORE
    ===================================================== */

    db.collection("products")
        .onSnapshot(
            snapshot => {

                products =
                    snapshot.docs
                        .map(document => ({

                            id:
                                document.id,

                            ...document.data()

                        }))
                        .filter(
                            product =>
                                product.active !==
                                false
                        );


                render();

            },
            error => {

                console.error(
                    "Erro no catálogo:",
                    error
                );

            }
        );


    /* =====================================================
       FILTRO
    ===================================================== */

    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                activeFilter =
                    (
                        button.dataset.filter ||
                        "all"
                    ).toLowerCase();


                render();

            }
        );

    });


    searchInput?.addEventListener(
        "input",
        render
    );


    /* =====================================================
       RENDER
    ===================================================== */

    function render() {

        if (!grid) {
            return;
        }


        const query =
            normalize(
                searchInput?.value || ""
            );


        const filtered =
            products.filter(product => {

                const family =
                    String(
                        product.family || ""
                    ).toLowerCase();


                const matchesFamily =
                    activeFilter === "all" ||
                    family ===
                        activeFilter;


                const searchText =
                    normalize(`

                        ${product.name || ""}

                        ${product.family || ""}

                        ${product.variant || ""}

                        ${product.description || ""}

                    `);


                const matchesSearch =
                    !query ||
                    searchText.includes(
                        query
                    );


                return (
                    matchesFamily &&
                    matchesSearch
                );

            });


        if (counter) {

            counter.textContent =
                filtered.length;

        }


        if (!filtered.length) {

            grid.innerHTML = `

                <div class="no-results">

                    <strong>
                        NENHUM PRODUTO
                    </strong>

                    <span>
                        Nenhum modelo encontrado.
                    </span>

                </div>

            `;

            return;
        }


        grid.innerHTML =
            filtered.map(product => `

                <article
                    class="product-card"
                    data-category="${escapeHTML(
                        String(
                            product.family ||
                            ""
                        ).toLowerCase()
                    )}"
                >

                    <a
                        href="produto.html?id=${encodeURIComponent(
                            product.id
                        )}"
                        class="product-card-link"
                    >

                        <div class="product-image">

                            ${product.imageURL
                                ? `
                                    <img
                                        src="${escapeHTML(
                                            product.imageURL
                                        )}"
                                        alt="${escapeHTML(
                                            product.name ||
                                            "Produto"
                                        )}"
                                        loading="lazy"
                                    >
                                  `
                                : `
                                    <div class="
                                        hstn-placeholder
                                    ">

                                        <span>
                                            SMART EYEWEAR
                                        </span>

                                        <strong>
                                            ${escapeHTML(
                                                product.family ||
                                                "META"
                                            )}
                                        </strong>

                                    </div>
                                  `
                            }

                        </div>


                        <div class="product-card-content">

                            <span class="product-family">

                                ${escapeHTML(
                                    product.family ||
                                    "META VISION"
                                )}

                            </span>


                            <h2>

                                ${escapeHTML(
                                    product.name ||
                                    "Produto"
                                )}

                            </h2>


                            <p>

                                ${escapeHTML(
                                    product.variant ||
                                    ""
                                )}

                            </p>


                            <div class="product-card-bottom">

                                <strong>

                                    ${escapeHTML(
                                        product.price ||
                                        "SOB CONSULTA"
                                    )}

                                </strong>

                                <span>
                                    VER PRODUTO
                                    →
                                </span>

                            </div>

                        </div>

                    </a>

                </article>

            `).join("");

    }


    function normalize(value) {

        return String(value)
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .toLowerCase()
            .trim();

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
