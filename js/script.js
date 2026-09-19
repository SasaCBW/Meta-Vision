/* =========================================================
   META VISION
   GLOBAL SCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const loader =
        document.getElementById("loader");

    const header =
        document.getElementById("header");

    const heroProduct =
        document.getElementById("heroProduct");

    const heroGlasses =
        document.getElementById("heroGlasses");

    const cursorLight =
        document.getElementById("cursorLight");

    const mobileMenuButton =
        document.getElementById("mobileMenuButton");

    const mobileMenu =
        document.getElementById("mobileMenu");

    const mobileMenuClose =
        document.getElementById("mobileMenuClose");

    const currentYear =
        document.getElementById("currentYear");

    const cartCount =
        document.getElementById("cartCount");


    /* =====================================================
       LOADER
       Nunca deixa o site preso na tela inicial
    ===================================================== */

    let loaderClosed = false;


    function closeLoader() {

        if (
            !loader ||
            loaderClosed
        ) {
            return;
        }


        loaderClosed = true;


        loader.classList.add(
            "hidden"
        );


        loader.classList.add(
            "loader-hidden"
        );


        setTimeout(() => {

            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
            loader.style.pointerEvents = "none";

        }, 100);


        setTimeout(() => {

            loader.style.display = "none";

            document.body.classList.add(
                "site-loaded"
            );

        }, 700);

    }


    /*
       Fecha normalmente depois de 1,5 segundo.
    */

    setTimeout(
        closeLoader,
        1500
    );


    /*
       Proteção extra:
       mesmo se algum recurso demorar,
       fecha obrigatoriamente.
    */

    setTimeout(
        closeLoader,
        4000
    );


    /* =====================================================
       ANO AUTOMÁTICO
    ===================================================== */

    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }


    /* =====================================================
       CONTADOR DO CARRINHO
    ===================================================== */

    function updateCartCounter() {

        let cart = [];


        try {

            cart =
                JSON.parse(
                    localStorage.getItem(
                        "metaVisionCart"
                    )
                ) || [];

        } catch (error) {

            console.warn(
                "META VISION // Carrinho inválido.",
                error
            );

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


    updateCartCounter();


    /*
       Permite atualizar o contador
       quando outro script altera o carrinho.
    */

    window.updateMetaVisionCart =
        updateCartCounter;


    window.addEventListener(
        "storage",
        event => {

            if (
                event.key ===
                "metaVisionCart"
            ) {

                updateCartCounter();

            }

        }
    );


    /* =====================================================
       HEADER AO ROLAR
    ===================================================== */

    function updateHeader() {

        if (!header) {
            return;
        }


        if (
            window.scrollY > 40
        ) {

            header.classList.add(
                "scrolled"
            );

        } else {

            header.classList.remove(
                "scrolled"
            );

        }

    }


    updateHeader();


    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive: true
        }
    );


    /* =====================================================
       MENU MOBILE
    ===================================================== */

    function openMobileMenu() {

        if (!mobileMenu) {
            return;
        }


        mobileMenu.classList.add(
            "active"
        );


        mobileMenu.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "menu-open"
        );

    }


    function closeMobileMenu() {

        if (!mobileMenu) {
            return;
        }


        mobileMenu.classList.remove(
            "active"
        );


        mobileMenu.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "menu-open"
        );

    }


    mobileMenuButton?.addEventListener(
        "click",
        openMobileMenu
    );


    mobileMenuClose?.addEventListener(
        "click",
        closeMobileMenu
    );


    /*
       Fecha o menu quando clicar
       em qualquer link dentro dele.
    */

    mobileMenu
        ?.querySelectorAll("a")
        .forEach(link => {

            link.addEventListener(
                "click",
                closeMobileMenu
            );

        });


    /*
       ESC fecha menu.
    */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeMobileMenu();

            }

        }
    );


    /* =====================================================
       CURSOR LIGHT
    ===================================================== */

    let mouseX = 0;
    let mouseY = 0;

    let currentX = 0;
    let currentY = 0;


    if (cursorLight) {

        document.addEventListener(
            "mousemove",
            event => {

                mouseX =
                    event.clientX;

                mouseY =
                    event.clientY;

            }
        );


        function animateCursor() {

            currentX +=
                (
                    mouseX -
                    currentX
                ) * 0.12;


            currentY +=
                (
                    mouseY -
                    currentY
                ) * 0.12;


            cursorLight.style.transform =
                `translate3d(
                    ${currentX}px,
                    ${currentY}px,
                    0
                )`;


            requestAnimationFrame(
                animateCursor
            );

        }


        animateCursor();

    }


    /* =====================================================
       HERO 3D
    ===================================================== */

    if (
        heroProduct &&
        heroGlasses
    ) {

        heroProduct.addEventListener(
            "mousemove",
            event => {

                /*
                   Em telas touch não precisamos
                   executar o efeito.
                */

                if (
                    window.matchMedia(
                        "(pointer: coarse)"
                    ).matches
                ) {

                    return;

                }


                const rect =
                    heroProduct
                        .getBoundingClientRect();


                const x =
                    (
                        event.clientX -
                        rect.left
                    ) /
                    rect.width;


                const y =
                    (
                        event.clientY -
                        rect.top
                    ) /
                    rect.height;


                const rotateY =
                    (
                        x - 0.5
                    ) * 14;


                const rotateX =
                    (
                        0.5 - y
                    ) * 10;


                const moveX =
                    (
                        x - 0.5
                    ) * 15;


                const moveY =
                    (
                        y - 0.5
                    ) * 10;


                heroGlasses.style.transform = `

                    translate3d(
                        ${moveX}px,
                        ${moveY}px,
                        0
                    )

                    rotateX(
                        ${rotateX}deg
                    )

                    rotateY(
                        ${rotateY}deg
                    )

                    scale(1.02)

                `;

            }
        );


        heroProduct.addEventListener(
            "mouseleave",
            () => {

                heroGlasses.style.transform =
                    "translate3d(0,0,0) rotateX(0deg) rotateY(0deg) scale(1)";

            }
        );

    }


    /* =====================================================
       PARALLAX NO SCROLL
    ===================================================== */

    let ticking = false;


    function updateParallax() {

        if (heroGlasses) {

            const scroll =
                Math.min(
                    window.scrollY,
                    800
                );


            heroGlasses.style.setProperty(
                "--scroll-y",
                `${scroll * 0.035}px`
            );

        }


        ticking = false;

    }


    window.addEventListener(
        "scroll",
        () => {

            if (!ticking) {

                requestAnimationFrame(
                    updateParallax
                );


                ticking = true;

            }

        },
        {
            passive: true
        }
    );


    /* =====================================================
       REVEAL ON SCROLL
    ===================================================== */

    const revealElements =
        document.querySelectorAll(
            ".reveal"
        );


    if (
        "IntersectionObserver" in window
    ) {

        const revealObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target
                                    .classList
                                    .add(
                                        "visible"
                                    );


                                revealObserver
                                    .unobserve(
                                        entry.target
                                    );

                            }

                        }
                    );

                },
                {
                    threshold: 0.12,

                    rootMargin:
                        "0px 0px -40px 0px"
                }
            );


        revealElements.forEach(
            element => {

                revealObserver.observe(
                    element
                );

            }
        );

    } else {

        /*
           Navegadores sem
           IntersectionObserver.
        */

        revealElements.forEach(
            element => {

                element.classList.add(
                    "visible"
                );

            }
        );

    }


    /* =====================================================
       LINKS INTERNOS SUAVES
    ===================================================== */

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const href =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !href ||
                        href === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            href
                        );


                    if (!target) {
                        return;
                    }


                    event.preventDefault();


                    target.scrollIntoView({

                        behavior:
                            "smooth",

                        block:
                            "start"

                    });

                }
            );

        });


    /* =====================================================
       EFEITO MAGNÉTICO NOS BOTÕES
    ===================================================== */

    const magneticElements =
        document.querySelectorAll(
            ".magnetic"
        );


    magneticElements.forEach(
        element => {

            element.addEventListener(
                "mousemove",
                event => {

                    if (
                        window.matchMedia(
                            "(pointer: coarse)"
                        ).matches
                    ) {

                        return;

                    }


                    const rect =
                        element
                            .getBoundingClientRect();


                    const x =
                        event.clientX -
                        rect.left -
                        rect.width / 2;


                    const y =
                        event.clientY -
                        rect.top -
                        rect.height / 2;


                    element.style.transform =
                        `translate(
                            ${x * 0.12}px,
                            ${y * 0.12}px
                        )`;

                }
            );


            element.addEventListener(
                "mouseleave",
                () => {

                    element.style.transform =
                        "translate(0,0)";

                }
            );

        }
    );


    /* =====================================================
       EFEITO NOS CARDS
    ===================================================== */

    const cards =
        document.querySelectorAll(
            ".tech-card, .model-card"
        );


    cards.forEach(card => {

        card.addEventListener(
            "mousemove",
            event => {

                if (
                    window.matchMedia(
                        "(pointer: coarse)"
                    ).matches
                ) {

                    return;

                }


                const rect =
                    card
                        .getBoundingClientRect();


                const x =
                    (
                        event.clientX -
                        rect.left
                    ) /
                    rect.width;


                const y =
                    (
                        event.clientY -
                        rect.top
                    ) /
                    rect.height;


                const rotateY =
                    (
                        x - 0.5
                    ) * 4;


                const rotateX =
                    (
                        0.5 - y
                    ) * 4;


                card.style.transform = `

                    perspective(1000px)

                    rotateX(
                        ${rotateX}deg
                    )

                    rotateY(
                        ${rotateY}deg
                    )

                    translateY(-3px)

                `;

            }
        );


        card.addEventListener(
            "mouseleave",
            () => {

                card.style.transform =
                    "";

            }
        );

    });


    /* =====================================================
       PERFORMANCE / ACESSIBILIDADE
    ===================================================== */

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );


    if (reducedMotion.matches) {

        document.documentElement
            .classList
            .add(
                "reduce-motion"
            );

    }


    /* =====================================================
       SISTEMA PRONTO
    ===================================================== */

    console.log(
        "%c META VISION ",
        "background:#00f5ff;color:#000;font-weight:bold;padding:6px 12px;"
    );


    console.log(
        "VISION SYSTEM // READY"
    );

});


/* =========================================================
   PROTEÇÃO EXTERNA DO LOADER

   Mesmo que futuramente algum erro seja introduzido dentro
   do DOMContentLoaded, tentamos remover o loader novamente.
========================================================= */

window.addEventListener(
    "load",
    () => {

        setTimeout(
            () => {

                const loader =
                    document.getElementById(
                        "loader"
                    );


                if (!loader) {
                    return;
                }


                loader.classList.add(
                    "hidden"
                );


                loader.classList.add(
                    "loader-hidden"
                );


                loader.style.opacity =
                    "0";


                loader.style.visibility =
                    "hidden";


                loader.style.pointerEvents =
                    "none";


                setTimeout(
                    () => {

                        loader.style.display =
                            "none";

                    },
                    600
                );

            },
            1600
        );

    }
);


/* =========================================================
   FAILSAFE

   Se o evento load não acontecer rapidamente por causa de
   imagem/recurso externo, o loader ainda será removido.
========================================================= */

setTimeout(
    () => {

        const loader =
            document.getElementById(
                "loader"
            );


        if (!loader) {
            return;
        }


        loader.style.transition =
            "opacity .5s ease";


        loader.style.opacity =
            "0";


        loader.style.visibility =
            "hidden";


        loader.style.pointerEvents =
            "none";


        setTimeout(
            () => {

                loader.style.display =
                    "none";

            },
            550
        );

    },
    4500
);
