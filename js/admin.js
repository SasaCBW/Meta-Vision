document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       FIREBASE
    ===================================================== */

    if (
        typeof firebase === "undefined" ||
        !firebase.apps.length
    ) {

        window.location.replace(
            "admin-login.html"
        );

        return;
    }


    const auth =
        firebase.auth();

    const db =
        firebase.firestore();

    const storage =
        firebase.storage();


    /* =====================================================
       ESTADO
    ===================================================== */

    let allOrders = [];
    let allProducts = [];
    let allMessages = [];

    let selectedImageFile = null;
    let currentImageURL = "";
    let currentStoragePath = "";


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const sidebar =
        document.getElementById(
            "adminSidebar"
        );

    const productModal =
        document.getElementById(
            "productModal"
        );

    const productForm =
        document.getElementById(
            "productForm"
        );

    const productImage =
        document.getElementById(
            "productImage"
        );

    const imagePreview =
        document.getElementById(
            "adminImagePreview"
        );


    /* =====================================================
       AUTENTICAÇÃO
    ===================================================== */

    auth.onAuthStateChanged(user => {

        if (!user) {

            window.location.replace(
                "admin-login.html"
            );

            return;
        }


        const email =
            document.getElementById(
                "adminEmail"
            );


        if (email) {

            email.textContent =
                user.email ||
                "Administrador";
        }


        startAdmin();

    });


    /* =====================================================
       LOGOUT
    ===================================================== */

    document
        .getElementById("logoutButton")
        ?.addEventListener(
            "click",
            async () => {

                await auth.signOut();

                window.location.replace(
                    "admin-login.html"
                );

            }
        );


    /* =====================================================
       MENU MOBILE
    ===================================================== */

    document
        .getElementById("openSidebar")
        ?.addEventListener(
            "click",
            () => {

                sidebar?.classList.add(
                    "open"
                );

            }
        );


    document
        .getElementById("closeSidebar")
        ?.addEventListener(
            "click",
            () => {

                sidebar?.classList.remove(
                    "open"
                );

            }
        );


    /* =====================================================
       NAVEGAÇÃO
    ===================================================== */

    document
        .querySelectorAll(
            ".admin-nav"
        )
        .forEach(button => {

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
        .querySelectorAll(
            "[data-go]"
        )
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


        document
            .getElementById(
                `${section}Section`
            )
            ?.classList.add(
                "active"
            );


        document
            .querySelector(
                `[data-section="${section}"]`
            )
            ?.classList.add(
                "active"
            );


        const titles = {

            dashboard:
                "DASHBOARD",

            orders:
                "PEDIDOS",

            products:
                "PRODUTOS",

            stock:
                "ESTOQUE",

            messages:
                "MENSAGENS",

            clients:
                "CLIENTES"

        };


        const title =
            document.getElementById(
                "pageTitle"
            );


        if (title) {

            title.textContent =
                titles[section] ||
                "ADMIN";

        }


        sidebar?.classList.remove(
            "open"
        );

    }


    /* =====================================================
       START
    ===================================================== */

    function startAdmin() {

        listenOrders();
        listenProducts();
        listenMessages();
        startClock();


        const status =
            document.getElementById(
                "firestoreStatus"
            );


        if (status) {

            status.textContent =
                "ONLINE";

            status.classList.add(
                "online"
            );

        }

    }


    /* =====================================================
       PEDIDOS
    ===================================================== */

    function listenOrders() {

        db.collection("orders")
            .onSnapshot(snapshot => {

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
                renderClients();
                updateDashboard();

            });

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
            document.getElementById(
                "orderFilter"
            )?.value || "all";


        const orders =
            filter === "all"
                ? allOrders
                : allOrders.filter(
                    order =>
                        (
                            order.status ||
                            "pending"
                        ) === filter
                );


        if (!orders.length) {

            container.innerHTML =
                emptyState(
                    "fa-bag-shopping",
                    "NENHUM PEDIDO",
                    "Os pedidos aparecerão aqui."
                );

            return;
        }


        container.innerHTML =
            orders.map(order => {

                const customer =
                    order.customer || {};


                const products =
                    Array.isArray(
                        order.products
                    )
                        ? order.products
                        : [];


                const productText =
                    products.map(product => {

                        return `${escapeHTML(
                            product.name ||
                            "Produto"
                        )} × ${Number(
                            product.quantity || 1
                        )}`;

                    }).join(" • ");


                return `

                    <article class="admin-list-item">

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
                                ${productText}
                            </p>

                            <small>

                                ${escapeHTML(
                                    customer.email || ""
                                )}

                                ${customer.phone
                                    ? " • " +
                                      escapeHTML(
                                          customer.phone
                                      )
                                    : ""
                                }

                            </small>

                            <span class="status-pill">

                                ${statusLabel(
                                    order.status ||
                                    "pending"
                                )}

                            </span>

                        </div>


                        <div class="item-actions">

                            <button
                                data-order="${order.firestoreId}"
                                data-status="confirmed"
                            >
                                CONFIRMAR
                            </button>

                            <button
                                data-order="${order.firestoreId}"
                                data-status="completed"
                            >
                                CONCLUIR
                            </button>

                            <button
                                class="danger"
                                data-order="${order.firestoreId}"
                                data-status="cancelled"
                            >
                                CANCELAR
                            </button>

                        </div>

                    </article>

                `;

            }).join("");


        container
            .querySelectorAll(
                "[data-order][data-status]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await db
                            .collection("orders")
                            .doc(
                                button.dataset.order
                            )
                            .update({

                                status:
                                    button.dataset.status,

                                updatedAt:
                                    firebase.firestore
                                        .FieldValue
                                        .serverTimestamp()

                            });


                        showToast(
                            "PEDIDO ATUALIZADO",
                            statusLabel(
                                button.dataset.status
                            )
                        );

                    }
                );

            });

    }


    document
        .getElementById("orderFilter")
        ?.addEventListener(
            "change",
            renderOrders
        );


    /* =====================================================
       PRODUTOS
    ===================================================== */

    function listenProducts() {

        db.collection("products")
            .onSnapshot(snapshot => {

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

            });

    }


    function renderProducts() {

        const container =
            document.getElementById(
                "productsList"
            );


        if (!container) {
            return;
        }


        if (!allProducts.length) {

            container.innerHTML =
                emptyState(
                    "fa-glasses",
                    "CATÁLOGO VAZIO",
                    "Cadastre seu primeiro produto."
                );

            return;
        }


        container.innerHTML =
            allProducts.map(product => `

                <article class="admin-list-item">

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
                                product.stock || 0
                            )}

                            •

                            ${escapeHTML(
                                product.price ||
                                "Sob consulta"
                            )}

                        </small>

                        ${product.imageURL
                            ? `
                                <div class="
                                    product-admin-thumbnail
                                ">
                                    <img
                                        src="${escapeHTML(
                                            product.imageURL
                                        )}"
                                        alt=""
                                    >
                                </div>
                              `
                            : ""
                        }

                    </div>


                    <div class="item-actions">

                        <button
                            data-edit-product="
                                ${product.firestoreId}
                            "
                        >
                            EDITAR
                        </button>

                        <button
                            class="danger"
                            data-delete-product="
                                ${product.firestoreId}
                            "
                        >
                            EXCLUIR
                        </button>

                    </div>

                </article>

            `).join("");


        container
            .querySelectorAll(
                "[data-edit-product]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const product =
                            allProducts.find(
                                item =>
                                    item.firestoreId ===
                                    button.dataset
                                        .editProduct
                            );


                        if (product) {

                            openProductModal(
                                product
                            );

                        }

                    }
                );

            });


        container
            .querySelectorAll(
                "[data-delete-product]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteProduct(
                            button.dataset
                                .deleteProduct
                        );

                    }
                );

            });

    }


    /* =====================================================
       MODAL
    ===================================================== */

    document
        .getElementById(
            "newProductButton"
        )
        ?.addEventListener(
            "click",
            () => openProductModal()
        );


    document
        .getElementById(
            "closeProductModal"
        )
        ?.addEventListener(
            "click",
            closeProductModal
        );


    document
        .getElementById(
            "productModalOverlay"
        )
        ?.addEventListener(
            "click",
            closeProductModal
        );


    function openProductModal(
        product = null
    ) {

        productForm.reset();

        selectedImageFile = null;
        currentImageURL = "";
        currentStoragePath = "";


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


            currentImageURL =
                product.imageURL || "";


            currentStoragePath =
                product.storagePath || "";


            if (
                currentImageURL &&
                imagePreview
            ) {

                imagePreview.innerHTML = `

                    <img
                        src="${escapeHTML(
                            currentImageURL
                        )}"
                        alt="Imagem atual"
                    >

                `;

            }

        } else {

            resetImagePreview();

        }


        productModal.classList.add(
            "active"
        );


        document.body.style.overflow =
            "hidden";

    }


    function closeProductModal() {

        productModal.classList.remove(
            "active"
        );


        document.body.style.overflow =
            "";

    }


    /* =====================================================
       PREVIEW
    ===================================================== */

    productImage?.addEventListener(
        "change",
        () => {

            const file =
                productImage.files?.[0];


            if (!file) {

                selectedImageFile = null;

                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Selecione uma imagem."
                );

                productImage.value = "";

                return;
            }


            if (
                file.size >
                5 * 1024 * 1024
            ) {

                alert(
                    "A imagem deve ter no máximo 5 MB."
                );

                productImage.value = "";

                return;
            }


            selectedImageFile =
                file;


            const url =
                URL.createObjectURL(file);


            imagePreview.innerHTML = `

                <img
                    src="${url}"
                    alt="Prévia"
                >

            `;

        }
    );


    function resetImagePreview() {

        if (!imagePreview) {
            return;
        }


        imagePreview.innerHTML = `

            <span>
                NENHUMA IMAGEM SELECIONADA
            </span>

        `;

    }


    /* =====================================================
       UPLOAD
    ===================================================== */

    async function uploadProductImage() {

        if (!selectedImageFile) {

            return {
                imageURL:
                    currentImageURL,

                storagePath:
                    currentStoragePath
            };

        }


        const extension =
            selectedImageFile.name
                .split(".")
                .pop()
                .toLowerCase()
                .replace(
                    /[^a-z0-9]/g,
                    ""
                ) || "jpg";


        const path =
            `products/${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}.${extension}`;


        const reference =
            storage.ref(path);


        await reference.put(
            selectedImageFile,
            {
                contentType:
                    selectedImageFile.type
            }
        );


        const imageURL =
            await reference
                .getDownloadURL();


        return {

            imageURL:
                imageURL,

            storagePath:
                path

        };

    }


    /* =====================================================
       SALVAR PRODUTO
    ===================================================== */

    productForm?.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const editingId =
                document.getElementById(
                    "editingProductId"
                ).value;


            const saveButton =
                productForm.querySelector(
                    ".save-product-button"
                );


            saveButton.disabled =
                true;


            const original =
                saveButton.querySelector(
                    "span"
                ).textContent;


            saveButton.querySelector(
                "span"
            ).textContent =
                selectedImageFile
                    ? "ENVIANDO IMAGEM..."
                    : "SALVANDO...";


            try {

                const uploaded =
                    await uploadProductImage();


                const data = {

                    name:
                        document
                            .getElementById(
                                "productName"
                            )
                            .value
                            .trim(),

                    family:
                        document
                            .getElementById(
                                "productFamily"
                            )
                            .value,

                    variant:
                        document
                            .getElementById(
                                "productVariant"
                            )
                            .value
                            .trim(),

                    stock:
                        Math.max(
                            0,
                            Number(
                                document
                                    .getElementById(
                                        "productStock"
                                    )
                                    .value
                            )
                        ),

                    price:
                        document
                            .getElementById(
                                "productPrice"
                            )
                            .value
                            .trim()
                        || "Sob consulta",

                    description:
                        document
                            .getElementById(
                                "productDescription"
                            )
                            .value
                            .trim(),

                    imageURL:
                        uploaded.imageURL ||
                        "",

                    storagePath:
                        uploaded.storagePath ||
                        "",

                    active:
                        true,

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                };


                if (editingId) {

                    await db
                        .collection("products")
                        .doc(editingId)
                        .update(data);

                } else {

                    data.createdAt =
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp();


                    await db
                        .collection("products")
                        .add(data);

                }


                closeProductModal();


                showToast(
                    "PRODUTO SALVO",
                    data.name
                );


            } catch (error) {

                console.error(error);


                alert(
                    "Não foi possível salvar o produto. Verifique o Firebase Storage e as regras."
                );


            } finally {

                saveButton.disabled =
                    false;


                saveButton.querySelector(
                    "span"
                ).textContent =
                    original;

            }

        }
    );


    /* =====================================================
       EXCLUIR PRODUTO
    ===================================================== */

    async function deleteProduct(id) {

        const product =
            allProducts.find(
                item =>
                    item.firestoreId === id
            );


        if (!product) {
            return;
        }


        if (
            !confirm(
                `Excluir "${product.name}"?`
            )
        ) {

            return;
        }


        try {

            if (product.storagePath) {

                try {

                    await storage
                        .ref(
                            product.storagePath
                        )
                        .delete();

                } catch (storageError) {

                    console.warn(
                        "Imagem não removida:",
                        storageError
                    );

                }

            }


            await db
                .collection("products")
                .doc(id)
                .delete();


            showToast(
                "PRODUTO EXCLUÍDO",
                product.name
            );


        } catch (error) {

            console.error(error);

            alert(
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


        if (!allProducts.length) {

            container.innerHTML =
                emptyState(
                    "fa-boxes-stacked",
                    "SEM ESTOQUE",
                    "Cadastre produtos primeiro."
                );

            return;
        }


        container.innerHTML =
            allProducts.map(product => `

                <article class="stock-card">

                    <span>
                        ${escapeHTML(
                            product.family ||
                            "PRODUCT"
                        )}
                    </span>

                    <h3>
                        ${escapeHTML(
                            product.name
                        )}
                    </h3>

                    <strong class="stock-number">

                        ${Number(
                            product.stock || 0
                        )}

                    </strong>

                    <small>
                        UNIDADES DISPONÍVEIS
                    </small>

                </article>

            `).join("");

    }


    /* =====================================================
       MENSAGENS
    ===================================================== */

    function listenMessages() {

        db.collection("messages")
            .onSnapshot(snapshot => {

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

            });

    }


    function renderMessages() {

        const container =
            document.getElementById(
                "messagesList"
            );


        if (!container) {
            return;
        }


        if (!allMessages.length) {

            container.innerHTML =
                emptyState(
                    "fa-message",
                    "SEM MENSAGENS",
                    "Os contatos aparecerão aqui."
                );

            return;
        }


        container.innerHTML =
            allMessages.map(message => `

                <article class="admin-list-item">

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
                                message.email || ""
                            )}

                            •

                            ${escapeHTML(
                                message.phone || ""
                            )}

                        </small>

                    </div>


                    <div class="item-actions">

                        <button
                            data-read="
                                ${message.firestoreId}
                            "
                        >
                            MARCAR LIDA
                        </button>

                        <button
                            class="danger"
                            data-delete-message="
                                ${message.firestoreId}
                            "
                        >
                            EXCLUIR
                        </button>

                    </div>

                </article>

            `).join("");


        container
            .querySelectorAll(
                "[data-read]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        await db
                            .collection("messages")
                            .doc(
                                button.dataset.read
                            )
                            .update({
                                read: true
                            });

                    }
                );

            });


        container
            .querySelectorAll(
                "[data-delete-message]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    async () => {

                        if (
                            !confirm(
                                "Excluir mensagem?"
                            )
                        ) {
                            return;
                        }


                        await db
                            .collection("messages")
                            .doc(
                                button.dataset
                                    .deleteMessage
                            )
                            .delete();

                    }
                );

            });

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


        const clients =
            new Map();


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
                    .trim()
                    .toLowerCase();


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


            clients.get(key).orders++;

        });


        if (!clients.size) {

            container.innerHTML =
                emptyState(
                    "fa-user",
                    "SEM CLIENTES",
                    "Os clientes aparecerão após os pedidos."
                );

            return;
        }


        container.innerHTML =
            Array.from(
                clients.values()
            )
            .map(client => `

                <article class="client-card">

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

                </article>

            `).join("");

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


        const unread =
            allMessages.filter(
                message =>
                    !message.read
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


        container.innerHTML =
            latest.map(order => `

                <div class="latest-item">

                    <div>

                        <strong>
                            ${escapeHTML(
                                order.customer?.name ||
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

                </div>

            `).join("");

    }


    /* =====================================================
       CLOCK
    ===================================================== */

    function startClock() {

        const clock =
            document.getElementById(
                "adminClock"
            );


        const update = () => {

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

        };


        update();

        setInterval(
            update,
            1000
        );

    }


    /* =====================================================
       HELPERS
    ===================================================== */

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


    function statusLabel(status) {

        return {

            pending:
                "PENDENTE",

            confirmed:
                "CONFIRMADO",

            completed:
                "CONCLUÍDO",

            cancelled:
                "CANCELADO"

        }[status] ||
        String(status).toUpperCase();

    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    function setText(id, value) {

        const element =
            document.getElementById(id);


        if (element) {

            element.textContent =
                value;

        }

    }


    function emptyState(
        icon,
        title,
        message
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
                    ${escapeHTML(message)}
                </span>

            </div>

        `;

    }


    function showToast(
        title,
        message
    ) {

        setText(
            "toastTitle",
            title
        );

        setText(
            "toastMessage",
            message
        );


        const toast =
            document.getElementById(
                "adminToast"
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
            3500
        );

    }

});
