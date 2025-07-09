// Админ-панель JavaScript

class AdminPanel {
  constructor() {
    this.currentUser = null;
    this.currentSection = "dashboard";
    this.currentChatId = null;
    this.products = [];
    this.categories = [];

    this.init();
  }

  async init() {
    await this.checkAuth();
    this.setupEventListeners();
    this.loadDashboard();
  }

  // Проверка авторизации
  async checkAuth() {
    try {
      const response = await fetch("../api/auth.php");
      const result = await response.json();

      if (!result.logged_in) {
        window.location.href = "login.html";
        return;
      }

      this.currentUser = result.user;
      this.updateUserInfo();
    } catch (error) {
      console.error("Ошибка проверки авторизации:", error);
      window.location.href = "login.html";
    }
  }

  // Обновление информации о пользователе
  updateUserInfo() {
    document.getElementById("userName").textContent = this.currentUser.name;
    document.getElementById("userRole").textContent =
      this.currentUser.role === "admin" ? "Администратор" : "Модератор";
  }

  // Настройка обработчиков событий
  setupEventListeners() {
    // Навигация
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const section = item.dataset.section;
        this.showSection(section);
      });
    });

    // Формы
    document.getElementById("productForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveProduct();
    });

    document.getElementById("categoryForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.saveCategory();
    });

    // Фильтры
    document
      .getElementById("orderStatusFilter")
      .addEventListener("change", (e) => {
        this.loadOrders(e.target.value);
      });

    // Чат
    document.getElementById("adminChatForm").addEventListener("submit", (e) => {
      e.preventDefault();
      this.sendAdminMessage();
    });
  }

  // Переключение секций
  showSection(section) {
    // Скрываем все секции
    document.querySelectorAll(".admin-section").forEach((s) => {
      s.classList.remove("active");
    });

    // Убираем активный класс с навигации
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });

    // Показываем нужную секцию
    document.getElementById(`${section}-section`).classList.add("active");
    document
      .querySelector(`[data-section="${section}"]`)
      .classList.add("active");

    // Обновляем заголовок
    const titles = {
      dashboard: "Дашборд",
      orders: "Заказы",
      products: "Товары",
      categories: "Категории",
      chat: "Чат",
      settings: "Настройки",
    };

    document.getElementById("pageTitle").textContent = titles[section];
    this.currentSection = section;

    // Загружаем данные для секции
    this.loadSectionData(section);
  }

  // Загрузка данных для секции
  async loadSectionData(section) {
    switch (section) {
      case "dashboard":
        this.loadDashboard();
        break;
      case "orders":
        this.loadOrders();
        break;
      case "products":
        this.loadProducts();
        break;
      case "categories":
        this.loadCategories();
        break;
      case "chat":
        this.loadChats();
        break;
      case "settings":
        this.loadSettings();
        break;
    }
  }

  // Загрузка дашборда
  async loadDashboard() {
    try {
      // Загружаем статистику
      const [ordersRes, productsRes, chatsRes] = await Promise.all([
        fetch("../api/orders.php"),
        fetch("../api/products.php"),
        fetch("../api/chat.php"),
      ]);

      const [orders, products, chats] = await Promise.all([
        ordersRes.json(),
        productsRes.json(),
        chatsRes.json(),
      ]);

      if (orders.success) {
        document.getElementById("totalOrders").textContent =
          orders.pagination.total;
        const pendingCount = orders.data.filter(
          (o) => o.status === "pending",
        ).length;
        document.getElementById("pendingOrders").textContent = pendingCount;

        // Последние заказы
        this.renderRecentOrders(orders.data.slice(0, 5));
      }

      if (products.success) {
        document.getElementById("totalProducts").textContent =
          products.data.length;
      }

      if (chats.success) {
        const openChatsCount = chats.data.filter(
          (c) => c.status === "open",
        ).length;
        document.getElementById("openChats").textContent = openChatsCount;
      }
    } catch (error) {
      console.error("Ошибка загрузки дашборда:", error);
    }
  }

  // Отрисовка последних заказов
  renderRecentOrders(orders) {
    const table = document.getElementById("recentOrdersTable");

    let html = "";
    orders.forEach((order) => {
      html += `
                <tr>
                    <td>${order.order_number}</td>
                    <td>${order.customer_name}</td>
                    <td>${this.formatPrice(order.total_amount)}</td>
                    <td><span class="status-badge status-${order.status}">${this.getStatusText(order.status)}</span></td>
                    <td>${this.formatDate(order.created_at)}</td>
                </tr>
            `;
    });

    table.innerHTML = html;
  }

  // Загрузка заказов
  async loadOrders(status = "") {
    try {
      let url = "../api/orders.php";
      if (status) url += `?status=${status}`;

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        this.renderOrders(result.data);
      }
    } catch (error) {
      console.error("Ошибка загрузки заказов:", error);
    }
  }

  // Отрисовка заказов
  renderOrders(orders) {
    const table = document.getElementById("ordersTable");

    let html = "";
    orders.forEach((order) => {
      html += `
                <tr>
                    <td>${order.order_number}</td>
                    <td>${order.customer_name}</td>
                    <td>${order.customer_phone}</td>
                    <td title="${order.customer_address}">${this.truncateText(order.customer_address, 30)}</td>
                    <td>${this.formatPrice(order.total_amount)}</td>
                    <td>
                        <select onchange="admin.updateOrderStatus(${order.id}, this.value)">
                            <option value="pending" ${order.status === "pending" ? "selected" : ""}>Новый</option>
                            <option value="processing" ${order.status === "processing" ? "selected" : ""}>В обработке</option>
                            <option value="completed" ${order.status === "completed" ? "selected" : ""}>Завершен</option>
                            <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>Отменен</option>
                        </select>
                    </td>
                    <td>${this.formatDate(order.created_at)}</td>
                    <td>
                        <button class="action-btn btn-view" onclick="admin.viewOrder(${order.id})">Просмотр</button>
                    </td>
                </tr>
            `;
    });

    table.innerHTML = html;
  }

  // Обновление статуса заказа
  async updateOrderStatus(orderId, status) {
    try {
      const response = await fetch("../api/orders.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status }),
      });

      const result = await response.json();

      if (result.success) {
        this.showNotification("Статус заказа обновлен");
      } else {
        this.showNotification("Ошибка обновления статуса", "error");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      this.showNotification("Произошла ошибка", "error");
    }
  }

  // Просмотр деталей заказа
  async viewOrder(orderId) {
    try {
      const response = await fetch(`../api/orders.php?id=${orderId}`);
      const result = await response.json();

      if (result.success) {
        const order = result.data;
        let itemsHtml = "";

        order.items.forEach((item) => {
          itemsHtml += `
                        <tr>
                            <td>${item.product_name}</td>
                            <td>${item.quantity}</td>
                            <td>${this.formatPrice(item.product_price)}</td>
                            <td>${this.formatPrice(item.total)}</td>
                        </tr>
                    `;
        });

        const modalHtml = `
                    <div class="modal-header">
                        <h3>Заказ ${order.order_number}</h3>
                        <button class="modal-close" onclick="admin.closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="order-details">
                            <h4>Информация о клиенте</h4>
                            <p><strong>Имя:</strong> ${order.customer_name}</p>
                            <p><strong>Телефон:</strong> ${order.customer_phone}</p>
                            <p><strong>Адрес:</strong> ${order.customer_address}</p>
                            ${order.comment ? `<p><strong>Комментарий:</strong> ${order.comment}</p>` : ""}
                            
                            <h4>Товары</h4>
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>Товар</th>
                                        <th>Количество</th>
                                        <th>Цена</th>
                                        <th>Сумма</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                            </table>
                            
                            <div style="text-align: right; margin-top: 20px;">
                                <strong>Итого: ${this.formatPrice(order.total_amount)}</strong>
                            </div>
                        </div>
                    </div>
                `;

        document.querySelector("#modalOverlay .modal").innerHTML = modalHtml;
        this.showModal();
      }
    } catch (error) {
      console.error("Ошибка загрузки заказа:", error);
    }
  }

  // Загрузка товаров
  async loadProducts() {
    try {
      const response = await fetch("../api/products.php");
      const result = await response.json();

      if (result.success) {
        this.products = result.data;
        this.renderProducts();
      }
    } catch (error) {
      console.error("Ошибка загрузки товаров:", error);
    }
  }

  // Отрисовка товаров
  renderProducts() {
    const table = document.getElementById("productsTable");

    let html = "";
    this.products.forEach((product) => {
      html += `
                <tr>
                    <td>${product.name}</td>
                    <td>${product.category_name || "Без категории"}</td>
                    <td>${this.formatPrice(product.price)}</td>
                    <td>${product.stock_quantity}</td>
                    <td><span class="status-badge ${product.is_active ? "status-completed" : "status-cancelled"}">${product.is_active ? "Активен" : "Неактивен"}</span></td>
                    <td>
                        <button class="action-btn btn-edit" onclick="admin.editProduct(${product.id})">Редактировать</button>
                        <button class="action-btn btn-delete" onclick="admin.deleteProduct(${product.id})">Удалить</button>
                    </td>
                </tr>
            `;
    });

    table.innerHTML = html;
  }

  // Загрузка категорий
  async loadCategories() {
    try {
      const response = await fetch("../api/categories.php");
      const result = await response.json();

      if (result.success) {
        this.categories = result.data;
        this.renderCategories();
        this.updateCategorySelects();
      }
    } catch (error) {
      console.error("Ошибка загрузки категорий:", error);
    }
  }

  // Отрисовка категорий
  renderCategories() {
    const table = document.getElementById("categoriesTable");

    let html = "";
    this.categories.forEach((category) => {
      html += `
                <tr>
                    <td>${category.name}</td>
                    <td>${category.slug}</td>
                    <td>${category.products_count}</td>
                    <td>${category.sort_order}</td>
                    <td>
                        <button class="action-btn btn-edit" onclick="admin.editCategory(${category.id})">Редактировать</button>
                        <button class="action-btn btn-delete" onclick="admin.deleteCategory(${category.id})">Удалить</button>
                    </td>
                </tr>
            `;
    });

    table.innerHTML = html;
  }

  // Обновление селектов категорий
  updateCategorySelects() {
    const select = document.getElementById("productCategorySelect");

    let html = '<option value="">Выберите категорию</option>';
    this.categories.forEach((category) => {
      html += `<option value="${category.id}">${category.name}</option>`;
    });

    select.innerHTML = html;
  }

  // Загрузка чатов
  async loadChats() {
    try {
      const response = await fetch("../api/chat.php");
      const result = await response.json();

      if (result.success) {
        this.renderChatsList(result.data);
      }
    } catch (error) {
      console.error("Ошибка загрузки чатов:", error);
    }
  }

  // Отрисовка списка чатов
  renderChatsList(chats) {
    const container = document.getElementById("chatsList");

    let html = "";
    chats.forEach((chat) => {
      const unreadClass = chat.unread_count > 0 ? "chat-unread" : "";
      html += `
                <div class="chat-item ${unreadClass}" onclick="admin.selectChat(${chat.id}, '${chat.chat_id}')">
                    <div class="chat-item-name">
                        ${chat.customer_name || "Гость"}
                        ${chat.unread_count > 0 ? `<span style="color: var(--primary-color);">(${chat.unread_count})</span>` : ""}
                    </div>
                    <div class="chat-item-preview">
                        ${chat.customer_phone || "Без телефона"} • ${this.formatDate(chat.last_message_time || chat.created_at)}
                    </div>
                </div>
            `;
    });

    container.innerHTML = html;
  }

  // Выбор чата
  async selectChat(chatId, chatSlug) {
    this.currentChatId = chatId;

    // Обновляем активный чат
    document.querySelectorAll(".chat-item").forEach((item) => {
      item.classList.remove("active");
    });
    event.target.closest(".chat-item").classList.add("active");

    // Обновляем заголовок
    document.getElementById("currentChatTitle").textContent =
      `Чат #${chatSlug}`;

    // Включаем ввод сообщений
    document.getElementById("adminChatInput").disabled = false;
    document.querySelector("#adminChatForm button").disabled = false;

    // Загружаем сообщения
    await this.loadChatMessages(chatSlug);

    // Отмечаем сообщения как прочитанные
    this.markChatAsRead(chatId);
  }

  // Загрузка сообщений чата
  async loadChatMessages(chatSlug) {
    try {
      const response = await fetch(`../api/chat.php?chat_id=${chatSlug}`);
      const result = await response.json();

      if (result.success) {
        this.renderChatMessages(result.data);
      }
    } catch (error) {
      console.error("Ошибка загрузки сообщений:", error);
    }
  }

  // Отрисовка сообщений чата
  renderChatMessages(messages) {
    const container = document.getElementById("adminChatMessages");

    let html = "";
    messages.forEach((message) => {
      const messageClass =
        message.sender_type === "customer" ? "user" : "admin";
      html += `
                <div class="chat-message ${messageClass}">
                    <div style="font-size: 11px; color: var(--text-light); margin-bottom: 4px;">
                        ${message.sender_name} • ${this.formatDateTime(message.created_at)}
                    </div>
                    ${message.message}
                </div>
            `;
    });

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  }

  // Отправка сообщения администратором
  async sendAdminMessage() {
    const input = document.getElementById("adminChatInput");
    const message = input.value.trim();

    if (!message || !this.currentChatId) return;

    try {
      // Получаем slug чата
      const chatSlug = document
        .getElementById("currentChatTitle")
        .textContent.replace("Чат #", "");

      const formData = new FormData();
      formData.append("action", "send_message");
      formData.append("chat_id", chatSlug);
      formData.append("message", message);
      formData.append("sender_type", "admin");
      formData.append("sender_name", this.currentUser.name);
      formData.append("user_id", this.currentUser.id);

      const response = await fetch("../api/chat.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        input.value = "";
        this.loadChatMessages(chatSlug);
      }
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
    }
  }

  // Отметка чата как прочитанного
  async markChatAsRead(chatId) {
    try {
      const formData = new FormData();
      formData.append("action", "mark_read");
      formData.append("chat_id", chatId);

      await fetch("../api/chat.php", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Ошибка отметки чата:", error);
    }
  }

  // Загрузка настроек
  async loadSettings() {
    try {
      const response = await fetch("../api/settings.php");
      const result = await response.json();

      if (result.success) {
        this.renderSettings(result.data);
      }
    } catch (error) {
      console.error("Ошибка загрузки настроек:", error);
    }
  }

  // Отрисовка настроек
  renderSettings(settings) {
    const container = document.getElementById("settingsForm");

    const groups = {
      "Основные настройки": ["site_name", "site_description"],
      "Контактная информация": [
        "contact_phone",
        "contact_email",
        "contact_address",
        "work_hours",
        "delivery_info",
      ],
      "Системные настройки": ["chat_enabled", "auto_responses_enabled"],
    };

    let html = "";

    Object.entries(groups).forEach(([groupName, keys]) => {
      html += `
                <div class="settings-group">
                    <h3>${groupName}</h3>
                    <div class="settings-grid">
            `;

      keys.forEach((key) => {
        if (settings[key] !== undefined) {
          const value = settings[key];
          const isBoolean = typeof value === "boolean";

          html += `
                        <div class="form-group">
                            <label class="form-label">${this.getSettingLabel(key)}</label>
                            ${
                              isBoolean
                                ? `<select name="${key}">
                                    <option value="true" ${value ? "selected" : ""}>Включено</option>
                                    <option value="false" ${!value ? "selected" : ""}>Отключено</option>
                                </select>`
                                : key.includes("description") ||
                                    key.includes("info")
                                  ? `<textarea name="${key}" class="form-textarea">${value}</textarea>`
                                  : `<input type="text" name="${key}" class="form-input" value="${value}">`
                            }
                        </div>
                    `;
        }
      });

      html += `
                    </div>
                </div>
            `;
    });

    container.innerHTML = html;
  }

  // Получение человекочитаемого названия настройки
  getSettingLabel(key) {
    const labels = {
      site_name: "Название сайта",
      site_description: "Описание сайта",
      contact_phone: "Телефон",
      contact_email: "Email",
      contact_address: "Адрес",
      work_hours: "Время работы",
      delivery_info: "Информация о доставке",
      chat_enabled: "Чат на сайте",
      auto_responses_enabled: "Автоответы в чате",
    };

    return labels[key] || key;
  }

  // Сохранение настроек
  async saveSettings() {
    const form = document.getElementById("settingsForm");
    const formData = new FormData(form);

    const settings = {};
    for (const [key, value] of formData.entries()) {
      settings[key] =
        value === "true" ? true : value === "false" ? false : value;
    }

    try {
      const response = await fetch("../api/settings.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (result.success) {
        this.showNotification("Настройки сохранены");
      } else {
        this.showNotification("Ошибка сохранения настроек", "error");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      this.showNotification("Произошла ошибка", "error");
    }
  }

  // Модальные окна
  showModal() {
    document.getElementById("modalOverlay").classList.add("show");
  }

  closeModal() {
    document.getElementById("modalOverlay").classList.remove("show");

    // Очищаем формы
    document.getElementById("productForm").reset();
    document.getElementById("categoryForm").reset();
  }

  // Показ формы добавления товара
  showAddProductModal() {
    document.getElementById("productModalTitle").textContent = "Добавить товар";
    document.getElementById("productForm").removeAttribute("data-id");
    this.showModal();
  }

  // Показ формы добавления категории
  showAddCategoryModal() {
    document.getElementById("categoryModalTitle").textContent =
      "Добавить категорию";
    document.getElementById("categoryForm").removeAttribute("data-id");
    this.showModal();
  }

  // Сохранение товара
  async saveProduct() {
    const form = document.getElementById("productForm");
    const formData = new FormData(form);
    const isEdit = form.hasAttribute("data-id");

    const productData = Object.fromEntries(formData.entries());

    if (isEdit) {
      productData.id = parseInt(form.getAttribute("data-id"));
    }

    try {
      const response = await fetch("../api/products.php", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const result = await response.json();

      if (result.success) {
        this.showNotification(isEdit ? "Товар обновлен" : "Товар добавлен");
        this.closeModal();
        this.loadProducts();
      } else {
        this.showNotification("Ошибка сохранения товара", "error");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      this.showNotification("Произошла ошибка", "error");
    }
  }

  // Сохранение категории
  async saveCategory() {
    const form = document.getElementById("categoryForm");
    const formData = new FormData(form);
    const isEdit = form.hasAttribute("data-id");

    const categoryData = Object.fromEntries(formData.entries());

    if (isEdit) {
      categoryData.id = parseInt(form.getAttribute("data-id"));
    }

    try {
      const response = await fetch("../api/categories.php", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });

      const result = await response.json();

      if (result.success) {
        this.showNotification(
          isEdit ? "Категория обновлена" : "Категория добавлена",
        );
        this.closeModal();
        this.loadCategories();
      } else {
        this.showNotification("Ошибка сохранения категории", "error");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      this.showNotification("Произошла ошибка", "error");
    }
  }

  // Утилиты
  formatPrice(price) {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price);
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("ru-RU");
  }

  formatDateTime(dateString) {
    return new Date(dateString).toLocaleString("ru-RU");
  }

  getStatusText(status) {
    const statuses = {
      pending: "Новый",
      processing: "В обработке",
      completed: "Завершен",
      cancelled: "Отменен",
    };
    return statuses[status] || status;
  }

  truncateText(text, length) {
    return text.length > length ? text.substring(0, length) + "..." : text;
  }

  showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "success" ? "var(--secondary-color)" : "#dc3545"};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: var(--shadow-hover);
            z-index: 10000;
            max-width: 300px;
        `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  }
}

// Глобальные функции
function toggleSidebar() {
  document.querySelector(".admin-sidebar").classList.toggle("open");
}

async function logout() {
  try {
    const formData = new FormData();
    formData.append("action", "logout");

    await fetch("../api/auth.php", {
      method: "POST",
      body: formData,
    });

    window.location.href = "login.html";
  } catch (error) {
    console.error("Ошибка выхода:", error);
    window.location.href = "login.html";
  }
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
  window.admin = new AdminPanel();
});
