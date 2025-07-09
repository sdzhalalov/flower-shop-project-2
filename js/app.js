// Bloom & Blossom - Основной JavaScript файл

class BloomApp {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem("bloom_cart") || "[]");
    this.currentCategory = "all";
    this.products = [];
    this.categories = [];
    this.chatId = localStorage.getItem("bloom_chat_id");

    this.init();
  }

  init() {
    this.loadCategories();
    this.loadProducts();
    this.setupEventListeners();
    this.updateCartUI();
    this.initChat();
  }

  // Загрузка категорий
  async loadCategories() {
    try {
      const response = await fetch("api/categories.php");
      const result = await response.json();

      if (result.success) {
        this.categories = result.data;
        this.renderCategoryFilters();
      }
    } catch (error) {
      console.error("Ошибка загрузки категорий:", error);
    }
  }

  // Загрузка товаров
  async loadProducts(category = null) {
    try {
      let url = "api/products.php";
      if (category && category !== "all") {
        url += `?category=${category}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        this.products = result.data;
        this.renderProducts();
      }
    } catch (error) {
      console.error("Ошибка загрузки товаров:", error);
    }
  }

  // Отрисовка фильтров категорий
  renderCategoryFilters() {
    const filtersContainer = document.getElementById("categoryFilters");
    if (!filtersContainer) return;

    let html = `
            <button class="filter-btn ${this.currentCategory === "all" ? "active" : ""}" 
                    onclick="app.filterByCategory('all')">
                Все товары
            </button>
        `;

    this.categories.forEach((category) => {
      html += `
                <button class="filter-btn ${this.currentCategory === category.slug ? "active" : ""}" 
                        onclick="app.filterByCategory('${category.slug}')">
                    ${category.name} (${category.products_count})
                </button>
            `;
    });

    filtersContainer.innerHTML = html;
  }

  // Фильтрация по категориям
  filterByCategory(category) {
    this.currentCategory = category;
    this.loadProducts(category);
    this.renderCategoryFilters();
  }

  // Отрисовка товаров
  renderProducts() {
    const productsContainer = document.getElementById("productsGrid");
    if (!productsContainer) return;

    if (this.products.length === 0) {
      productsContainer.innerHTML = `
                <div class="text-center" style="grid-column: 1 / -1;">
                    <p>Товары не найдены</p>
                </div>
            `;
      return;
    }

    let html = "";
    this.products.forEach((product) => {
      const inStock = product.stock_quantity > 0;
      const inCart = this.cart.find((item) => item.id === product.id);

      html += `
                <div class="product-card fade-in" data-product-id="${product.id}">
                    <div class="product-image">
                        ${
                          product.image
                            ? `<img src="uploads/${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">`
                            : "🌸"
                        }
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-description">${product.description}</p>
                        <div class="product-price">${this.formatPrice(product.price)}</div>
                        <div class="product-stock">
                            ${inStock ? `В наличии: ${product.stock_quantity} шт.` : "Нет в наличии"}
                        </div>
                        <button class="add-to-cart" 
                                onclick="app.addToCart(${product.id})"
                                ${!inStock ? "disabled" : ""}>
                            ${inCart ? "В корзине" : "Добавить в корзину"}
                        </button>
                    </div>
                </div>
            `;
    });

    productsContainer.innerHTML = html;
  }

  // Добавление в корзину
  addToCart(productId) {
    const product = this.products.find((p) => p.id === productId);
    if (!product || product.stock_quantity <= 0) return;

    const existingItem = this.cart.find((item) => item.id === productId);

    if (existingItem) {
      if (existingItem.quantity < product.stock_quantity) {
        existingItem.quantity++;
      } else {
        this.showNotification("Недостаточно товара на складе");
        return;
      }
    } else {
      this.cart.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1,
        image: product.image,
      });
    }

    this.saveCart();
    this.updateCartUI();
    this.renderProducts(); // Обновляем отображение товаров
    this.showNotification("Товар добавлен в корзину");
  }

  // Удаление из корзины
  removeFromCart(productId) {
    this.cart = this.cart.filter((item) => item.id !== productId);
    this.saveCart();
    this.updateCartUI();
    this.renderCartItems();
    this.renderProducts();
  }

  // Изменение количества в корзине
  updateQuantity(productId, change) {
    const item = this.cart.find((item) => item.id === productId);
    if (!item) return;

    const product = this.products.find((p) => p.id === productId);
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      this.removeFromCart(productId);
    } else if (newQuantity <= (product ? product.stock_quantity : 999)) {
      item.quantity = newQuantity;
      this.saveCart();
      this.updateCartUI();
      this.renderCartItems();
    } else {
      this.showNotification("Недостаточно товара на складе");
    }
  }

  // Обновление UI корзины
  updateCartUI() {
    const cartCount = document.getElementById("cartCount");
    const cartTotal = document.getElementById("cartTotal");

    const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = this.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    if (cartCount) {
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? "flex" : "none";
    }

    if (cartTotal) {
      cartTotal.textContent = this.formatPrice(totalPrice);
    }
  }

  // Отрисовка товаров в корзине
  renderCartItems() {
    const cartItemsContainer = document.getElementById("cartItems");
    if (!cartItemsContainer) return;

    if (this.cart.length === 0) {
      cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <p>Корзина пуста</p>
                    <p>Добавьте товары из каталога</p>
                </div>
            `;
      return;
    }

    let html = "";
    this.cart.forEach((item) => {
      html += `
                <div class="cart-item">
                    <div class="cart-item-image">
                        ${
                          item.image
                            ? `<img src="uploads/${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`
                            : "🌸"
                        }
                    </div>
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${this.formatPrice(item.price * item.quantity)}</div>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="app.updateQuantity(${item.id}, -1)">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="app.updateQuantity(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <button class="remove-item" onclick="app.removeFromCart(${item.id})">×</button>
                </div>
            `;
    });

    cartItemsContainer.innerHTML = html;
  }

  // Открытие корзины
  openCart() {
    const cartModal = document.getElementById("cartModal");
    const cartOverlay = document.getElementById("cartOverlay");

    if (cartModal && cartOverlay) {
      cartModal.classList.add("open");
      cartOverlay.classList.add("show");
      this.renderCartItems();
      document.body.style.overflow = "hidden";
    }
  }

  // Закрытие корзины
  closeCart() {
    const cartModal = document.getElementById("cartModal");
    const cartOverlay = document.getElementById("cartOverlay");

    if (cartModal && cartOverlay) {
      cartModal.classList.remove("open");
      cartOverlay.classList.remove("show");
      document.body.style.overflow = "";
    }
  }

  // Переход к оформлению заказа
  checkout() {
    if (this.cart.length === 0) {
      this.showNotification("Корзина пуста");
      return;
    }

    this.closeCart();
    this.showOrderForm();
  }

  // Показ формы заказа
  showOrderForm() {
    const orderForm = document.getElementById("orderFormContainer");
    if (orderForm) {
      orderForm.style.display = "block";
      orderForm.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Оформление заказа
  async submitOrder(formData) {
    if (this.cart.length === 0) {
      this.showNotification("Корзина пуста");
      return;
    }

    const orderData = {
      customer_name: formData.get("customer_name"),
      customer_phone: formData.get("customer_phone"),
      customer_address: formData.get("customer_address"),
      comment: formData.get("comment"),
      items: this.cart,
    };

    try {
      const response = await fetch("api/orders.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.success) {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        this.hideOrderForm();
        this.showNotification(
          `Заказ ${result.order_number} успешно оформлен! Мы свяжемся с вами в ближайшее время.`,
        );
      } else {
        this.showNotification(
          "Ошибка при оформлении заказа: " + result.message,
        );
      }
    } catch (error) {
      console.error("Ошибка:", error);
      this.showNotification("Произошла ошибка при оформлении заказа");
    }
  }

  // Скрытие формы заказа
  hideOrderForm() {
    const orderForm = document.getElementById("orderFormContainer");
    if (orderForm) {
      orderForm.style.display = "none";
    }
  }

  // Инициализация чата
  initChat() {
    if (!this.chatId) {
      this.createChat();
    }
    this.loadChatMessages();
  }

  // Создание нового чата
  async createChat() {
    try {
      const formData = new FormData();
      formData.append("action", "create_chat");
      formData.append("customer_name", "Гость");

      const response = await fetch("api/chat.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        this.chatId = result.chat_id;
        localStorage.setItem("bloom_chat_id", this.chatId);
      }
    } catch (error) {
      console.error("Ошибка создания чата:", error);
    }
  }

  // Загрузка сообщений чата
  async loadChatMessages() {
    if (!this.chatId) return;

    try {
      const response = await fetch(`api/chat.php?chat_id=${this.chatId}`);
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
    const chatMessages = document.getElementById("chatMessages");
    if (!chatMessages) return;

    let html = "";
    messages.forEach((message) => {
      const messageClass =
        message.sender_type === "customer" ? "user" : "admin";
      html += `
                <div class="chat-message ${messageClass}">
                    ${message.message}
                </div>
            `;
    });

    chatMessages.innerHTML = html;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Отправка сообщения в чат
  async sendChatMessage(message) {
    if (!this.chatId || !message.trim()) return;

    try {
      const formData = new FormData();
      formData.append("action", "send_message");
      formData.append("chat_id", this.chatId);
      formData.append("message", message);
      formData.append("sender_type", "customer");
      formData.append("sender_name", "Гость");

      const response = await fetch("api/chat.php", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        this.loadChatMessages();

        // Очищаем поле ввода
        const chatInput = document.getElementById("chatInput");
        if (chatInput) {
          chatInput.value = "";
        }

        // Автоответ через 2 секунды
        setTimeout(() => {
          this.sendAutoResponse(message);
        }, 2000);
      }
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
    }
  }

  // Автоответ
  async sendAutoResponse(userMessage) {
    const autoResponses = {
      привет:
        'Здравствуйте! Добро пожаловать в "Bloom & Blossom"! Поможем выбрать идеальный букет.',
      цена: "Цены на букеты указаны в каталоге. Действуют скидки на большие заказы. Доставка от 500 руб.",
      время:
        "Мы работаем ежедневно с 8:00 до 22:00. Доставка цветов круглосуточно! Телефон: +7 (495) 555-77-88",
      доставка:
        "Доставка по Москве 2-3 часа (500 руб), срочная доставка за 1 час (1000 руб). Заказы принимаем круглосуточно.",
      букет:
        "У нас большой выбор букетов: розы, тюльпаны, пионы, хризантемы. Создаем индивидуальные композиции.",
      адрес:
        "Наш адрес: г. Москва, ул. Цветочная, д. 25. Есть удобная парковка для клиентов.",
    };

    const message = userMessage.toLowerCase();
    let response = null;

    for (const [trigger, autoResponse] of Object.entries(autoResponses)) {
      if (message.includes(trigger)) {
        response = autoResponse;
        break;
      }
    }

    if (!response) {
      response =
        "Спасибо за ваше сообщение! Наш менеджер ответит вам в ближайшее время.";
    }

    // Отправляем автоответ
    try {
      const formData = new FormData();
      formData.append("action", "send_message");
      formData.append("chat_id", this.chatId);
      formData.append("message", response);
      formData.append("sender_type", "admin");
      formData.append("sender_name", "Bloom & Blossom");

      const responseData = await fetch("api/chat.php", {
        method: "POST",
        body: formData,
      });

      const result = await responseData.json();

      if (result.success) {
        this.loadChatMessages();
      }
    } catch (error) {
      console.error("Ошибка автоответа:", error);
    }
  }

  // Открытие чата
  openChat() {
    const chatWidget = document.getElementById("chatWidget");
    if (chatWidget) {
      chatWidget.classList.add("open");
      this.loadChatMessages();
    }
  }

  // Закрытие чата
  closeChat() {
    const chatWidget = document.getElementById("chatWidget");
    if (chatWidget) {
      chatWidget.classList.remove("open");
    }
  }

  // Настройка обработчиков событий
  setupEventListeners() {
    // Мобильное меню
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const navMenu = document.getElementById("navMenu");

    if (mobileMenuBtn && navMenu) {
      mobileMenuBtn.addEventListener("click", () => {
        navMenu.classList.toggle("open");
      });
    }

    // Корзина
    const cartBtn = document.getElementById("cartBtn");
    const closeCartBtn = document.getElementById("closeCart");
    const cartOverlay = document.getElementById("cartOverlay");
    const checkoutBtn = document.getElementById("checkoutBtn");

    if (cartBtn) cartBtn.addEventListener("click", () => this.openCart());
    if (closeCartBtn)
      closeCartBtn.addEventListener("click", () => this.closeCart());
    if (cartOverlay)
      cartOverlay.addEventListener("click", () => this.closeCart());
    if (checkoutBtn)
      checkoutBtn.addEventListener("click", () => this.checkout());

    // Форма заказа
    const orderForm = document.getElementById("orderForm");
    if (orderForm) {
      orderForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(orderForm);
        this.submitOrder(formData);
      });
    }

    // Чат
    const chatButton = document.getElementById("chatButton");
    const closeChatBtn = document.getElementById("closeChat");
    const chatForm = document.getElementById("chatForm");

    if (chatButton) chatButton.addEventListener("click", () => this.openChat());
    if (closeChatBtn)
      closeChatBtn.addEventListener("click", () => this.closeChat());

    if (chatForm) {
      chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const chatInput = document.getElementById("chatInput");
        if (chatInput && chatInput.value.trim()) {
          this.sendChatMessage(chatInput.value.trim());
        }
      });
    }
  }

  // Сохранение корзины в localStorage
  saveCart() {
    localStorage.setItem("bloom_cart", JSON.stringify(this.cart));
  }

  // Форматирование цены
  formatPrice(price) {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price);
  }

  // Показ уведомления
  showNotification(message) {
    // Создаем элемент уведомления
    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: var(--shadow-hover);
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
        `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Удаляем через 3 секунды
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  }
}

// Инициализация приложения при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  window.app = new BloomApp();
});
