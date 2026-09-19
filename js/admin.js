document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const sidebar =
        document.getElementById("adminSidebar");

    const openSidebar =
        document.getElementById("openSidebar");

    const closeSidebar =
        document.getElementById("closeSidebar");

    const logoutButton =
        document.getElementById("logoutButton");

    const adminEmail =
        document.getElementById("adminEmail");

    const pageTitle =
        document.getElementById("pageTitle");

    const productModal =
        document.getElementById("productModal");

    const productModalOverlay =
        document.getElementById("productModalOverlay");

    const closeProductModal =
        document.getElementById("closeProductModal");

    const newProductButton =
        document.getElementById("newProductButton");

    const productForm =
        document.getElementById("productForm");

    const orderFilter =
        document.getElementById("orderFilter");


    let currentUser = null;

    let allOrders = [];

    let allProducts = [];

    let allMessages = [];


    /* =====================================================
       FIREBASE
    ===================================================== */

    if (
        typeof firebase === "undefined" ||
        !firebase.apps.length
    ) {

        window.location.href =
            "admin-login.html";

        return;

    }


    const auth =
        firebase.auth();

    const database =
        firebase.firestore();


    /* =====================================================
       AUTENTICAÇÃO
    ===================================================== */

    auth.onAuthStateChanged(async user => {

        if (!user) {

            window.location.replace(
                "admin-login.html"
            );

            return;

        }


        currentUser = user;


        if (adminEmail) {

            adminEmail.textContent =
                user.email || "Administrador";

        }


        await startAdmin();

    });


    /* =====================================================
       LOGOUT
    ===================================================== */

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async () => {

                try {

                    await auth.signOut();

                    window.location.replace(
                        "admin-login.html"
                    );

                } catch (error) {

                    console.error(error);

                    showToast(
                        "ERRO",
                        "Não foi possível sair."
                    );

                }

            }
        );

    }


    /* =====================================================
       SIDEBAR
    ===================================================== */

    if (openSidebar) {

        openSidebar.addEventListener(
            "click",
            () => {

                sidebar.classList.add(
                    "open"
                );

            }
        );

    }


    if (closeSidebar) {

        closeSidebar.addEventListener(
            "click",
            () => {

                sidebar.classList.remove(
                    "open"
                );

            }
        );

    }


    /* =====================================================
       NAVEGAÇÃO
    ===================================================== */

    const navButtons =
        document.querySelectorAll(
            ".admin-nav"
        );


    navButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showSection(
                    button.dataset.section
                );

            }
        );

    });


    document
        .querySelectorAll("[data-go]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    showSection(
                        button.dataset.go
                    );

                }
            );

        });


    function showSection(section) {

        document
            .querySelectorAll(
                ".admin-section"
            )
            .forEach(element => {

                element.classList.remove(
                    "active"
                );

            });


        document
            .querySelectorAll(
                ".admin-nav"
            )
            .forEach(element => {

                element.classList.remove(
                    "active"
                );

            });


        const sectionElement =
            document.getElementById(
                `${section}Section`
            );


        const navElement =
            document.querySelector(
                `[data-section="${section}"]`
            );


        if (sectionElement) {

            sectionElement.classList.add(
                "active"
            );

        }


        if (navElement) {

            navElement.classList.add(
                "active"
            );

        }


        if (pageTitle) {

            const titles = {
                dashboard: "DASHBOARD",
                orders: "PEDIDOS",
                products: "PRODUTOS",
                stock: "ESTOQUE",
                messages: "MENSAGENS",
                clients: "CLIENTES"
            };


            pageTitle.textContent =
                titles[section] ||
                "ADMIN";

        }


        sidebar.classList.remove(
            "open"
        );

    }


    /* =====================================================
       INICIAR
    ===================================================== */

    async function startAdmin() {

        const firestoreStatus =
            document.getElementById(
                "firestoreStatus"
            );


        try {

            await database
                .collection("system")
                .limit(1)
                .get();


            if (firestoreStatus) {

                firestoreStatus.textContent =
                    "ONLINE";

                firestoreStatus.classList.add(
                    "online"
                );

            }

        } catch (error) {

            console.error(
                "Firestore:",
                error
            );


            if (firestoreStatus) {

                firestoreStatus.textContent =
                    "BLOCKED";

            }

        }


        /*
           Importa dados que foram criados
           localmente durante os testes.
        */

        await importLocalData();


        listenOrders();

        listenProducts();

        listenMessages();

        startClock();

    }


    /* =====================================================
       IMPORTAÇÃO LOCAL
    ===================================================== */

    async function importLocalData() {

        /*
           Essa função permite aproveitar
           pedidos/mensagens criados antes
           da integração com Firebase.

           Depois que os dados forem
           importados, eles são removidos
           do armazenamento local.
        */


        const localOrders =
            readLocalArray(
                "metaVisionOrders"
            );


        for (const order of localOrders) {

            try {

                await database
                    .collection("orders")
                    .doc(order.id)
                    .set(
                        {
                            ...order,

                            imported:
                                true,

                            updatedAt:
                                firebase.firestore
                                    .FieldValue
                                    .serverTimestamp()
                        },
                        {
                            merge: true
                        }
                    );

            } catch (error) {

                console.error(
                    "Erro importando pedido:",
                    error
                );

                return;

            }

        }


        if (localOrders.length) {

            localStorage.removeItem(
                "metaVisionOrders"
            );

        }


        const localMessages =
            readLocalArray(
                "metaVisionMessages"
            );


        for (const message of localMessages) {

            try {

                await database
                    .collection("messages")
                    .doc(message.id)
                    .set(
                        {
                            ...message,

                            imported:
                                true,

                            read:
                                false,

                            updatedAt:
                                firebase.firestore
                                    .FieldValue
                                    .serverTimestamp()
                        },
                        {
                            merge: true
                        }
                    );

            } catch (error) {

                console.error(
                    "Erro importando mensagem:",
                    error
                );

                return;

            }

        }


        if (localMessages.length) {

            localStorage.removeItem(
                "metaVisionMessages"
            );

        }

    }


    function readLocalArray(key) {

        try {

            return (
                JSON.parse(
                    localStorage.getItem(
                        key
                    )
                ) || []
            );

        } catch (error) {

            return [];

        }

    }


    /* =====================================================
       PEDIDOS
    ===================================================== */

    function listenOrders() {

        database
            .collection("orders")
            .onSnapshot(
                snapshot => {

                    allOrders =
                        snapshot.docs.map(
                            document => ({
                                firestoreId:
                                    document.id,

                                ...document.data()
                            })
                        );


                    allOrders.sort(
                        (a, b) =>
                            getTime(b.createdAt) -
                            getTime(a.createdAt)
                    );


                    renderOrders();

                    updateDashboard();

                    renderClients();

                },
                error => {

                    console.error(
                        "Pedidos:",
                        error
                    );

                }
            );

    }


    function renderOrders() {

        const container =
            document.getElementById(
                "ordersList"
            );


        if (!container) {
            return;
        }


        const filter =
            orderFilter
                ? orderFilter.value
                : "all";


        const filtered =
            filter === "all"
                ? allOrders
                : allOrders.filter(
                    order =>
                        (
                            order.status ||
                            "pending"
                        ) === filter
                );


        container.innerHTML = "";


        if (!filtered.length) {

            container.innerHTML =
                emptyState(
                    "fa-bag-shopping",
                    "NENHUM PEDIDO",
                    "Os pedidos aparecerão aqui."
                );

            return;

        }


        filtered.forEach(order => {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "admin-list-item";


            const customer =
                order.customer || {};


            const products =
                Array.isArray(
                    order.products
                )
                    ? order.products
                    : [];


            const quantity =
                products.reduce(
                    (total, product) =>
                        total +
                        Number(
                            product.quantity ||
                            1
                        ),
                    0
                );


            const status =
                order.status ||
                "pending";


            item.innerHTML = `

                <div class="item-main">

                    <span>
                        ${escapeHTML(
                            order.id ||
                            order.firestoreId
                        )}
                    </span>

                    <h3>
                        ${escapeHTML(
                            customer.name ||
                            "Cliente"
                        )}
                    </h3>

                    <p>
                        ${quantity}
                        produto(s) •
                        ${escapeHTML(
                            customer.city ||
                            "Cidade não informada"
                        )}
                    </p>

                    <small>
                        ${escapeHTML(
                            customer.email ||
                            ""
                        )}

                        ${customer.phone
                            ? " • " +
                              escapeHTML(
                                  customer.phone
                              )
                            : ""
                        }
                    </small>

                    <span class="
                        status-pill
                        ${status === "cancelled"
                            ? "cancelled"
                            : ""
                        }
                    ">
                        ${statusLabel(status)}
                    </span>

                </div>


                <div class="item-actions">

                    <button
                        type="button"
                        data-order-status="confirmed"
                    >
                        CONFIRMAR
                    </button>

                    <button
                        type="button"
                        data-order-status="completed"
                    >
                        CONCLUIR
                    </button>

                    <button
                        type="button"
                        class="danger"
                        data-order-status="cancelled"
                    >
                        CANCELAR
                    </button>

                </div>

            `;


            item
                .querySelectorAll(
                    "[data-order-status]"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            updateOrderStatus(
                                order.firestoreId,
                                button.dataset
                                    .orderStatus
                            );

                        }
                    );

                });


            container.appendChild(
                item
            );

        });

    }


    async function updateOrderStatus(
        id,
        status
    ) {

        try {

            await database
                .collection("orders")
                .doc(id)
                .update({

                    status:
                        status,

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });


            showToast(
                "PEDIDO ATUALIZADO",
                statusLabel(status)
            );

        } catch (error) {

            console.error(error);

            showToast(
                "ERRO",
                "Não foi possível atualizar."
            );

        }

    }


    if (orderFilter) {

        orderFilter.addEventListener(
            "change",
            renderOrders
        );

    }


    /* =====================================================
       PRODUTOS
    ===================================================== */

    function listenProducts() {

        database
            .collection("products")
            .onSnapshot(
                snapshot => {

                    allProducts =
                        snapshot.docs.map(
                            document => ({
                                firestoreId:
                                    document.id,

                                ...document.data()
                            })
                        );


                    renderProducts();

                    renderStock();

                    updateDashboard();

                },
                error => {

                    console.error(
                        "Produtos:",
                        error
                    );

                }
            );

    }


    function renderProducts() {

        const container =
            document.getElementById(
                "productsList"
            );


        if (!container) {
            return;
        }


        container.innerHTML = "";


        if (!allProducts.length) {

            container.innerHTML =
                emptyState(
                    "fa-glasses",
                    "CATÁLOGO VAZIO",
                    "Cadastre o primeiro produto."
                );

            return;

        }


        allProducts.forEach(product => {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "admin-list-item";


            item.innerHTML = `

                <div class="item-main">

                    <span>
                        ${escapeHTML(
                            product.family ||
                            "META VISION"
                        )}
                    </span>

                    <h3>
                        ${escapeHTML(
                            product.name ||
                            "Produto"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            product.variant ||
                            ""
                        )}
                    </p>

                    <small>
                        ESTOQUE:
                        ${Number(
                            product.stock ||
                            0
                        )}
                        •
                        ${escapeHTML(
                            product.price ||
                            "Sob consulta"
                        )}
                    </small>

                </div>


                <div class="item-actions">

                    <button
                        type="button"
                        data-edit-product
                    >
                        EDITAR
                    </button>

                    <button
                        type="button"
                        class="danger"
                        data-delete-product
                    >
                        EXCLUIR
                    </button>

                </div>

            `;


            item
                .querySelector(
                    "[data-edit-product]"
                )
                .addEventListener(
                    "click",
                    () => {

                        openProductEditor(
                            product
                        );

                    }
                );


            item
                .querySelector(
                    "[data-delete-product]"
                )
                .addEventListener(
                    "click",
                    () => {

                        deleteProduct(
                            product.firestoreId
                        );

                    }
                );


            container.appendChild(
                item
            );

        });

    }


    /* =====================================================
       MODAL PRODUTO
    ===================================================== */

    function openProductEditor(
        product = null
    ) {

        productForm.reset();


        document.getElementById(
            "editingProductId"
        ).value =
            product
                ? product.firestoreId
                : "";


        document.getElementById(
            "productModalTitle"
        ).textContent =
            product
                ? "EDITAR PRODUTO"
                : "NOVO PRODUTO";


        if (product) {

            document.getElementById(
                "productName"
            ).value =
                product.name || "";


            document.getElementById(
                "productFamily"
            ).value =
                product.family ||
                "Vanguard";


            document.getElementById(
                "productVariant"
            ).value =
                product.variant || "";


            document.getElementById(
                "productStock"
            ).value =
                Number(
                    product.stock || 0
                );


            document.getElementById(
                "productPrice"
            ).value =
                product.price || "";


            document.getElementById(
                "productDescription"
            ).value =
                product.description || "";

        }


        productModal.classList.add(
            "active"
        );


        document.body.style.overflow =
            "hidden";

    }


    function closeProductEditor() {

        productModal.classList.remove(
            "active"
        );


        document.body.style.overflow =
            "";

    }


    if (newProductButton) {

        newProductButton.addEventListener(
            "click",
            () =>
                openProductEditor()
        );

    }


    if (closeProductModal) {

        closeProductModal.addEventListener(
            "click",
            closeProductEditor
        );

    }


    if (productModalOverlay) {

        productModalOverlay.addEventListener(
            "click",
            closeProductEditor
        );

    }


    if (productForm) {

        productForm.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const editingId =
                    document.getElementById(
                        "editingProductId"
                    ).value;


                const productData = {

                    name:
                        document.getElementById(
                            "productName"
                        ).value.trim(),

                    family:
                        document.getElementById(
                            "productFamily"
                        ).value,

                    variant:
                        document.getElementById(
                            "productVariant"
                        ).value.trim(),

                    stock:
                        Number(
                            document.getElementById(
                                "productStock"
                            ).value
                        ),

                    price:
                        document.getElementById(
                            "productPrice"
                        ).value.trim()
                        || "Sob consulta",

                    description:
                        document.getElementById(
                            "productDescription"
                        ).value.trim(),

                    active:
                        true,

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                };


                try {

                    if (editingId) {

                        await database
                            .collection("products")
                            .doc(editingId)
                            .update(
                                productData
                            );

                    } else {

                        productData.createdAt =
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp();


                        await database
                            .collection("products")
                            .add(
                                productData
                            );

                    }


                    closeProductEditor();


                    showToast(
                        "PRODUTO SALVO",
                        productData.name
                    );

                } catch (error) {

                    console.error(error);

                    showToast(
                        "ERRO",
                        "Não foi possível salvar."
                    );

                }

            }
        );

    }


    async function deleteProduct(id) {

        const confirmed =
            window.confirm(
                "Deseja excluir este produto?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await database
                .collection("products")
                .doc(id)
                .delete();


            showToast(
                "PRODUTO EXCLUÍDO",
                "Catálogo atualizado."
            );

        } catch (error) {

            console.error(error);

            showToast(
                "ERRO",
                "Não foi possível excluir."
            );

        }

    }


    /* =====================================================
       ESTOQUE
    ===================================================== */

    function renderStock() {

        const container =
            document.getElementById(
                "stockList"
            );


        if (!container) {
            return;
        }


        container.innerHTML = "";


        if (!allProducts.length) {

            container.innerHTML =
                emptyState(
                    "fa-boxes-stacked",
                    "SEM ESTOQUE",
                    "Cadastre produtos primeiro."
                );

            return;

        }


        allProducts.forEach(product => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "stock-card";


            card.innerHTML = `

                <span>
                    ${escapeHTML(
                        product.family ||
                        "PRODUCT"
                    )}
                </span>

                <h3>
                    ${escapeHTML(
                        product.name ||
                        "Produto"
                    )}
                </h3>

                <strong class="stock-number">
                    ${Number(
                        product.stock ||
                        0
                    )}
                </strong>

                <small>
                    UNIDADES DISPONÍVEIS
                </small>

            `;


            container.appendChild(
                card
            );

        });

    }


    /* =====================================================
       MENSAGENS
    ===================================================== */

    function listenMessages() {

        database
            .collection("messages")
            .onSnapshot(
                snapshot => {

                    allMessages =
                        snapshot.docs.map(
                            document => ({
                                firestoreId:
                                    document.id,

                                ...document.data()
                            })
                        );


                    allMessages.sort(
                        (a, b) =>
                            getTime(b.createdAt) -
                            getTime(a.createdAt)
                    );


                    renderMessages();

                    updateDashboard();

                },
                error => {

                    console.error(
                        "Mensagens:",
                        error
                    );

                }
            );

    }


    function renderMessages() {

        const container =
            document.getElementById(
                "messagesList"
            );


        if (!container) {
            return;
        }


        container.innerHTML = "";


        if (!allMessages.length) {

            container.innerHTML =
                emptyState(
                    "fa-message",
                    "SEM MENSAGENS",
                    "Novos contatos aparecerão aqui."
                );

            return;

        }


        allMessages.forEach(message => {

            const item =
                document.createElement(
                    "article"
                );


            item.className =
                "admin-list-item";


            item.innerHTML = `

                <div class="item-main">

                    <span>
                        ${escapeHTML(
                            message.subject ||
                            "CONTATO"
                        )}
                    </span>

                    <h3>
                        ${escapeHTML(
                            message.name ||
                            "Cliente"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            message.message ||
                            ""
                        )}
                    </p>

                    <small>
                        ${escapeHTML(
                            message.email ||
                            ""
                        )}

                        ${message.phone
                            ? " • " +
                              escapeHTML(
                                  message.phone
                              )
                            : ""
                        }
                    </small>

                </div>


                <div class="item-actions">

                    <button
                        type="button"
                        data-read-message
                    >
                        MARCAR LIDA
                    </button>

                    <button
                        type="button"
                        class="danger"
                        data-delete-message
                    >
                        EXCLUIR
                    </button>

                </div>

            `;


            item
                .querySelector(
                    "[data-read-message]"
                )
                .addEventListener(
                    "click",
                    async () => {

                        try {

                            await database
                                .collection(
                                    "messages"
                                )
                                .doc(
                                    message.firestoreId
                                )
                                .update({
                                    read: true
                                });


                            showToast(
                                "MENSAGEM",
                                "Marcada como lida."
                            );

                        } catch (error) {

                            console.error(error);

                        }

                    }
                );


            item
                .querySelector(
                    "[data-delete-message]"
                )
                .addEventListener(
                    "click",
                    () => {

                        deleteMessage(
                            message.firestoreId
                        );

                    }
                );


            container.appendChild(
                item
            );

        });

    }


    async function deleteMessage(id) {

        const confirmed =
            window.confirm(
                "Excluir esta mensagem?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await database
                .collection("messages")
                .doc(id)
                .delete();


            showToast(
                "MENSAGEM EXCLUÍDA",
                "Caixa de entrada atualizada."
            );

        } catch (error) {

            console.error(error);

        }

    }


    /* =====================================================
       CLIENTES
    ===================================================== */

    function renderClients() {

        const container =
            document.getElementById(
                "clientsList"
            );


        if (!container) {
            return;
        }


        const clients = new Map();


        allOrders.forEach(order => {

            const customer =
                order.customer || {};


            const key =
                (
                    customer.email ||
                    customer.phone ||
                    customer.name ||
                    ""
                )
                    .toLowerCase()
                    .trim();


            if (!key) {
                return;
            }


            if (!clients.has(key)) {

                clients.set(
                    key,
                    {
                        ...customer,
                        orders: 0
                    }
                );

            }


            clients.get(key).orders += 1;

        });


        container.innerHTML = "";


        if (!clients.size) {

            container.innerHTML =
                emptyState(
                    "fa-user",
                    "SEM CLIENTES",
                    "Clientes aparecerão após os pedidos."
                );

            return;

        }


        clients.forEach(client => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "client-card";


            card.innerHTML = `

                <span>
                    CLIENT // PROFILE
                </span>

                <h3>
                    ${escapeHTML(
                        client.name ||
                        "Cliente"
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        client.email ||
                        "Sem e-mail"
                    )}
                    <br>

                    ${escapeHTML(
                        client.phone ||
                        "Sem telefone"
                    )}
                </p>

                <small>
                    ${client.orders}
                    PEDIDO(S)
                </small>

            `;


            container.appendChild(
                card
            );

        });

    }


    /* =====================================================
       DASHBOARD
    ===================================================== */

    function updateDashboard() {

        const pending =
            allOrders.filter(
                order =>
                    (
                        order.status ||
                        "pending"
                    ) === "pending"
            ).length;


        setText(
            "dashboardOrders",
            allOrders.length
        );

        setText(
            "dashboardPending",
            pending
        );

        setText(
            "dashboardProducts",
            allProducts.length
        );

        setText(
            "dashboardMessages",
            allMessages.length
        );


        setText(
            "ordersBadge",
            pending
        );


        const unread =
            allMessages.filter(
                message =>
                    !message.read
            ).length;


        setText(
            "messagesBadge",
            unread
        );


        renderLatestOrders();

    }


    function renderLatestOrders() {

        const container =
            document.getElementById(
                "latestOrders"
            );


        if (!container) {
            return;
        }


        container.innerHTML = "";


        const latest =
            allOrders.slice(0, 5);


        if (!latest.length) {

            container.innerHTML =
                emptyState(
                    "fa-bag-shopping",
                    "SEM PEDIDOS",
                    "Nenhum pedido recebido."
                );

            return;

        }


        latest.forEach(order => {

            const customer =
                order.customer || {};


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "latest-item";


            div.innerHTML = `

                <div>

                    <strong>
                        ${escapeHTML(
                            customer.name ||
                            "Cliente"
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            order.id ||
                            order.firestoreId
                        )}
                    </span>

                </div>

                <span class="status-pill">
                    ${statusLabel(
                        order.status ||
                        "pending"
                    )}
                </span>

            `;


            container.appendChild(
                div
            );

        });

    }


    /* =====================================================
       RELÓGIO
    ===================================================== */

    function startClock() {

        const clock =
            document.getElementById(
                "adminClock"
            );


        function update() {

            if (!clock) {
                return;
            }


            clock.textContent =
                new Date()
                    .toLocaleTimeString(
                        "pt-BR",
                        {
                            hour:
                                "2-digit",

                            minute:
                                "2-digit"
                        }
                    );

        }


        update();

        setInterval(
            update,
            1000
        );

    }


    /* =====================================================
       HELPERS
    ===================================================== */

    function statusLabel(status) {

        const labels = {
            pending:
                "PENDENTE",

            confirmed:
                "CONFIRMADO",

            completed:
                "CONCLUÍDO",

            cancelled:
                "CANCELADO"
        };


        return (
            labels[status] ||
            String(status).toUpperCase()
        );

    }


    function setText(id, value) {

        const element =
            document.getElementById(id);


        if (element) {

            element.textContent =
                value;

        }

    }


    function getTime(value) {

        if (!value) {
            return 0;
        }


        if (
            typeof value.toDate ===
            "function"
        ) {

            return value
                .toDate()
                .getTime();

        }


        const date =
            new Date(value);


        return Number.isNaN(
            date.getTime()
        )
            ? 0
            : date.getTime();

    }


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


    function emptyState(
        icon,
        title,
        text
    ) {

        return `

            <div class="admin-empty">

                <i class="
                    fa-solid
                    ${icon}
                "></i>

                <strong>
                    ${escapeHTML(title)}
                </strong>

                <span>
                    ${escapeHTML(text)}
                </span>

            </div>

        `;

    }


    function showToast(
        title,
        message
    ) {

        const toast =
            document.getElementById(
                "adminToast"
            );


        if (!toast) {
            return;
        }


        setText(
            "toastTitle",
            title
        );

        setText(
            "toastMessage",
            message
        );


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

});
