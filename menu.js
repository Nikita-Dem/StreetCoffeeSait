// Menu page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Cart sidebar functionality
    const cartSidebar = document.getElementById('cartSidebar');
    const closeCart = document.getElementById('closeCart');
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Open cart when clicking on cart icon in header
    document.querySelector('.cart-icon').addEventListener('click', (e) => {
        e.preventDefault();
        cartSidebar.classList.add('active');
        updateCartSidebar();
    });
    
    // Close cart sidebar
    if (closeCart) {
        closeCart.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
        });
    }
    
    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        if (cartSidebar.classList.contains('active') && 
            !cartSidebar.contains(e.target) && 
            !e.target.closest('.cart-icon')) {
            cartSidebar.classList.remove('active');
        }
    });
    
    // Quantity controls
    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
        button.addEventListener('click', function() {
            const quantityDisplay = this.parentNode.querySelector('.quantity-display');
            let quantity = parseInt(quantityDisplay.textContent);
            quantityDisplay.textContent = quantity + 1;
        });
    });
    
    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
        button.addEventListener('click', function() {
            const quantityDisplay = this.parentNode.querySelector('.quantity-display');
            let quantity = parseInt(quantityDisplay.textContent);
            if (quantity > 1) {
                quantityDisplay.textContent = quantity - 1;
            }
        });
    });
    
    // Add to cart functionality
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const name = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));
            const image = this.getAttribute('data-image');
            const quantityControls = this.parentNode.querySelector('.quantity-controls');
            const quantity = parseInt(quantityControls.querySelector('.quantity-display').textContent);
            
            const item = {
                id: parseInt(id),
                name: name,
                price: price,
                image: image,
                quantity: quantity
            };
            
            cart.addItem(item);
            
            // Reset quantity
            quantityControls.querySelector('.quantity-display').textContent = 1;
            
            // Show success animation
            this.innerHTML = '<i class="fas fa-check"></i> Добавлено';
            this.style.background = '#4CAF50';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-cart-plus"></i> Добавить в корзину';
                this.style.background = '';
            }, 1500);
            
            // Open cart sidebar
            cartSidebar.classList.add('active');
            updateCartSidebar();
        });
    });
    
    // Update cart sidebar
    function updateCartSidebar() {
        if (!cartItems || !totalPrice) return;
        
        const items = cart.items;
        
        if (items.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Корзина пуста</p>
                </div>
            `;
            totalPrice.textContent = '0 ₽';
            return;
        }
        
        let total = 0;
        cartItems.innerHTML = '';
        
        items.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.price} ₽ × ${item.quantity}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="cart-quantity-btn minus" data-index="${index}">-</button>
                    <span class="cart-quantity">${item.quantity}</span>
                    <button class="cart-quantity-btn plus" data-index="${index}">+</button>
                    <button class="remove-item" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            cartItems.appendChild(cartItemElement);
        });
        
        totalPrice.textContent = `${total} ₽`;
        
        // Add event listeners to cart item controls
        document.querySelectorAll('.cart-quantity-btn.plus').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                cart.updateQuantity(cart.items[index].id, cart.items[index].quantity + 1);
                updateCartSidebar();
            });
        });
        
        document.querySelectorAll('.cart-quantity-btn.minus').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                cart.updateQuantity(cart.items[index].id, cart.items[index].quantity - 1);
                updateCartSidebar();
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                cart.removeItem(cart.items[index].id);
                updateCartSidebar();
            });
        });
    }
    
    // Filter menu items
    const filterButtons = document.querySelectorAll('.category-filter');
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Filter items
                document.querySelectorAll('.menu-item').forEach(item => {
                    if (category === 'all' || item.getAttribute('data-category') === category) {
                        item.style.display = 'block';
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, 10);
                    } else {
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(20px)';
                        setTimeout(() => {
                            item.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }
});