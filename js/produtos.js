/* =========================================================
   META VISION
   CATÁLOGO DE PRODUTOS
   GitHub Images + Firestore
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const grid =
        document.getElementById("productsGrid");

    const searchInput =
        document.getElementById("productSearch");

    const counter =
        document.getElementById("visibleProducts");

    const filterButtons =
        document.querySelectorAll("[data-filter]");


    /* =====================================================
       CATÁLOGO PADRÃO

       As imagens ficam dentro da pasta /img do GitHub.
    ===================================================== */

    const defaultProducts = [

        {
            id: "vanguard-road",
            family: "Vanguard",
            name: "Oakley Meta Vanguard",
            variant: "Prizm Road",
            description:
                "Smart eyewear esportivo com câmera, áudio integrado e recursos inteligentes.",
            price: "SOB CONSULTA",
            stock: 1,
            imageURL: "img/vanguard-road.webp",
            active: true
        },

        {
            id: "vanguard-black",
            family: "Vanguard",
            name: "Oakley Meta Vanguard",
            variant: "Prizm Black",
            description:
                "Design esportivo com acabamento escuro e tecnologia inteligente integrada.",
            price: "SOB CONSULTA",
            stock: 1,
            imageURL: "img/vanguard-black.webp",
            active: true
        },

        {
            id: "vanguard-sapphire",
            family: "Vanguard",
            name: "Oakley Meta Vanguard",
            variant: "Prizm Sapphire",
            description:
                "Smart eyewear Vanguard com visual esportivo e lentes Prizm Sapphire.",
            price: "SOB CONSULTA",
            stock: 1,
            imageURL: "img/vanguard-sapphire.webp",
            active: true
        },

        {
            id: "vanguard-24k",
            family: "Vanguard",
            name: "Oakley Meta Vanguard",
            variant: "Prizm 24K",
            description:
                "Tecnologia wearable combinada com um visual esportivo marcante.",
            price: "SOB CONSULTA",
            stock: 1,
            imageURL: "img/vanguard-24k.webp",
            active: true
        },

        {
            id: "hstn-black",
            family: "HSTN",
            name: "Oakley Meta HSTN",
            variant: "Prizm Black",
            description:
                "Smart eyewear com formato HSTN, áudio integrado e recursos conectados.",
            price: "SOB CONSULTA",
            stock: 1,
            imageURL: "img/hstn-black.webp",
            active: true
        },

        {
            id: "hstn-ruby",
            family: "HSTN",
            name: "Oakley Meta HSTN",
            variant: "Prizm Ruby",
            description:
                "Modelo HSTN com visual tecnológico e lentes Prizm Ruby.",
            price: "SOB CONSULTA",
            stock: 1,
            imageURL: "img/hstn-ruby.webp",
            active: true
        },

        {
            id: "hstn-grey",
            family: "HSTN",
            name: "Oakley Meta HSTN",
            variant: "Transitions Grey",
            description:
                "Modelo HSTN com visual versátil e tecnologia inteligente integrada.",
            price: "SOB CONSULTA",
            stock: 1,
            imageURL: "img/hstn-grey.webp",
            active: true
        },

        {
            id: "hstn-clear",
            family: "HSTN",
            name: "Oakley Meta HSTN",
            variant: "Clear",
            description:
                "Smart eyewear HSTN com acabamento clean e recursos conectados.",
            price: "SOB CONSULTA",
            stock: 1,
            imageURL: "img/hstn-clear.webp",
            active: true
        }

    ];


    /* =====================================================
       ESTADO
    ===================================================== */

    let products =
        [...defaultProducts];

    let activeFilter =
        "all";


    /* =====================================================
       FIRESTORE

       Se existirem produtos no Firebase, eles são adicionados
       ao catálogo.

       Não precisamos de Firebase Storage.
    ===================================================== */

    if (
        typeof firebase !== "undefined" &&
        firebase.apps?.length &&
        firebase.firestore
    ) {

        const db =
            firebase.firestore();


        db.collection("products")
            .onSnapshot(

                snapshot => {

                    if (snapshot.empty) {

                        products =
                            [...defaultProducts];

                        render();

                        return;
                    }


                    const firebaseProducts =
                        snapshot.docs
                            .map(document => {

                                const data =
                                    document.data();


                                return {

                                    id:
                                        document.id,

                                    ...data,

                                    imageURL:
                                        getProductImage(
                                            document.id,
                                            data
                                        )

                                };

                            })
                            .filter(
                                product =>
                                    product.active !== false
                            );


                    /*
                       Produtos cadastrados no painel têm
                       prioridade sobre produtos padrão
                       com o mesmo ID.
                    */

                    const productMap =
                        new Map();


                    defaultProducts.forEach(
                        product => {

                            productMap.set(
                                product.id,
                                product
                            );

                        }
                    );


                    firebaseProducts.forEach(
                        product => {

                            productMap.set(
                                product.id,
                                product
                            );

                        }
                    );


                    products =
                        Array.from(
                            productMap.values()
                        );


                    render();

                },

                error => {

                    console.warn(
                        "META VISION // Firestore indisponível:",
                        error
                    );


                    products =
                        [...defaultProducts];


                    render();

                }

            );

    } else {

        render();

    }


    /* =====================================================
       IMAGEM AUTOMÁTICA
    ===================================================== */

    function getProductImage(
        id,
        product
    ) {

        /*
           Se o produto cadastrado no Firestore já possuir
           caminho de imagem, usamos esse caminho.
        */

        if (
            product.imageURL &&
            String(product.imageURL).trim()
        ) {

            return String(
                product.imageURL
            ).trim();

        }


        /*
           Caso contrário, associamos pelo ID.
        */

        const imageMap = {

            "vanguard-road":
                "img/vanguard-road.webp",

            "vanguard-black":
                "img/vanguard-black.webp",

            "vanguard-sapphire":
                "img/vanguard-sapphire.webp",

            "vanguard-24k":
                "img/vanguard-24k.webp",

            "hstn-black":
                "img/hstn-black.webp",

            "hstn-ruby":
                "img/hstn-ruby.webp",

            "hstn-grey":
                "img/hstn-grey.webp",

            "hstn-clear":
                "img/hstn-clear.webp"

        };


        return (
            imageMap[id] ||
            "img/oakley-meta-vanguard.webp"
        );

    }


    /* =====================================================
       FILTROS
    ===================================================== */

    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                filterButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                activeFilter =
                    String(
                        button.dataset.filter ||
                        "all"
                    ).toLowerCase();


                render();

            }
        );

    });


    /* =====================================================
       PESQUISA
    ===================================================== */

    searchInput?.addEventListener(
        "input",
        render
    );


    /* =====================================================
       RENDER
    ===================================================== */

    function render() {

        if (!grid) {

            console.error(
                "META VISION // productsGrid não encontrado."
            );

            return;

        }


        const query =
            normalize(
                searchInput?.value ||
                ""
            );


        const filtered =
            products.filter(product => {

                const family =
                    normalize(
                        product.family ||
                        ""
                    );


                const matchesFamily =
                    activeFilter === "all" ||
                    family ===
                    normalize(
                        activeFilter
                    );


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


        /* =================================================
           SEM RESULTADOS
        ================================================= */

        if (!filtered.length) {

            grid.innerHTML = `

                <div class="no-results">

                    <i class="
                        fa-solid
                        fa-magnifying-glass
                    "></i>

                    <strong>
                        NENHUM PRODUTO ENCONTRADO
                    </strong>

                    <span>
                        Tente outro modelo ou categoria.
                    </span>

                </div>

            `;

            return;

        }


        /* =================================================
           CARDS
        ================================================= */

        grid.innerHTML =
            filtered.map(
                product => {

                    const image =
                        getProductImage(
                            product.id,
                            product
                        );


                    return `

                        <article
                            class="product-card reveal visible"
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

                                <!-- IMAGEM -->

                                <div class="product-image">

                                    <div class="product-image-glow"></div>


                                    <img
                                        src="${escapeHTML(image)}"
                                        alt="${escapeHTML(
                                            `${product.name || "Oakley Meta"} ${product.variant || ""}`
                                        )}"
                                        loading="lazy"
                                        onerror="
                                            this.onerror=null;
                                            this.src='img/oakley-meta-vanguard.webp';
                                        "
                                    >

                                    <span class="product-tech-label">
                                        SMART EYEWEAR
                                    </span>

                                </div>


                                <!-- CONTEÚDO -->

                                <div class="product-card-content">

                                    <div class="product-meta">

                                        <span class="product-family">

                                            ${escapeHTML(
                                                product.family ||
                                                "META VISION"
                                            )}

                                        </span>


                                        <span class="product-stock">

                                            ${Number(
                                                product.stock || 0
                                            ) > 0
                                                ? "DISPONÍVEL"
                                                : "CONSULTE"
                                            }

                                        </span>

                                    </div>


                                    <h2>

                                        ${escapeHTML(
                                            product.name ||
                                            "Oakley Meta"
                                        )}

                                    </h2>


                                    <p class="product-variant">

                                        ${escapeHTML(
                                            product.variant ||
                                            ""
                                        )}

                                    </p>


                                    <p class="product-description">

                                        ${escapeHTML(
                                            product.description ||
                                            "Smart eyewear com tecnologia integrada."
                                        )}

                                    </p>


                                    <div class="product-card-bottom">

                                        <strong>

                                            ${escapeHTML(
                                                product.price ||
                                                "SOB CONSULTA"
                                            )}

                                        </strong>


                                        <span class="view-product">

                                            VER PRODUTO

                                            <i class="
                                                fa-solid
                                                fa-arrow-right
                                            "></i>

                                        </span>

                                    </div>

                                </div>

                            </a>

                        </article>

                    `;

                }

            ).join("");

    }


    /* =====================================================
       NORMALIZAÇÃO
    ===================================================== */

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


    /* =====================================================
       SEGURANÇA HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(
            value ?? ""
        )
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );

    }


    console.log(
        "META VISION // Catálogo carregado"
    );

});
