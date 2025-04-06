// متغيرات المتجر
let cart = [];
const cartOverlay = document.querySelector('.cart-overlay');
const cartDOM = document.querySelector('.cart');
const cartContent = document.querySelector('.cart-content');
const cartTotal = document.querySelector('.cart-total');
const cartCount = document.querySelector('.cart-count');
const cartIcon = document.querySelector('.cart-icon');
const closeCart = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const checkoutBtn = document.querySelector('.checkout');
const orderFormOverlay = document.querySelector('.order-form-overlay');
const closeForm = document.querySelector('.close-form');
const customerForm = document.getElementById('customer-form');

// فتح وإغلاق سلة التسوق
cartIcon.addEventListener('click', () => {
    cartOverlay.style.display = 'flex';
});

closeCart.addEventListener('click', () => {
    cartOverlay.style.display = 'none';
});

// فتح وإغلاق نموذج الطلب
closeForm.addEventListener('click', () => {
    orderFormOverlay.style.display = 'none';
});

// إضافة منتج إلى السلة
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
        const productId = button.getAttribute('data-id');
        const productName = button.getAttribute('data-name');
        const productPrice = button.getAttribute('data-price');
        
        // التحقق مما إذا كان المنتج موجودًا بالفعل في السلة
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.amount += 1;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                amount: 1
            });
        }
        
        updateCart();
        cartOverlay.style.display = 'flex';
    });
});

// تحديث السلة
function updateCart() {
    // تحديث عدد العناصر في السلة
    const itemsCount = cart.reduce((total, item) => total + item.amount, 0);
    cartCount.textContent = itemsCount;
    
    // تحديث إجمالي السعر
    const total = cart.reduce((total, item) => total + (item.price * item.amount), 0);
    cartTotal.textContent = total;
    
    // عرض العناصر في السلة
    cartContent.innerHTML = '';
    
    if (cart.length === 0) {
        cartContent.innerHTML = '<p>السلة فارغة</p>';
        return;
    }
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        
        cartItem.innerHTML = `
            <img src="https://via.placeholder.com/50x50" alt="${item.name}">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${item.price} دج </div>
            </div>
            <div class="cart-item-amount">
                <button class="amount-btn decrease" data-id="${item.id}">-</button>
                <span>${item.amount}</span>
                <button class="amount-btn increase" data-id="${item.id}">+</button>
            </div>
            <div class="cart-item-remove" data-id="${item.id}">
                <i class="fas fa-trash"></i>
            </div>
        `;
        
        cartContent.appendChild(cartItem);
    });
    
    // إضافة أحداث لأزرار الزيادة والنقصان والحذف
    document.querySelectorAll('.decrease').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            
            if (item.amount > 1) {
                item.amount -= 1;
            } else {
                cart = cart.filter(item => item.id !== id);
            }
            
            updateCart();
        });
    });
    
    document.querySelectorAll('.increase').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const item = cart.find(item => item.id === id);
            item.amount += 1;
            updateCart();
        });
    });
    
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            cart = cart.filter(item => item.id !== id);
            updateCart();
        });
    });
}

// تفريغ السلة
clearCartBtn.addEventListener('click', () => {
    cart = [];
    updateCart();
});

// إتمام الطلب
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('السلة فارغة، يرجى إضافة منتجات أولاً');
        return;
    }
    
    cartOverlay.style.display = 'none';
    orderFormOverlay.style.display = 'flex';
});

// إرسال الطلب
customerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const notes = document.getElementById('notes').value;
    
    // إنشاء رسالة الطلب
    let orderMessage = `طلب جديد من ${name}\n`;
    orderMessage += `رقم الهاتف: ${phone}\n`;
    orderMessage += `العنوان: ${address}\n`;
    orderMessage += `ملاحظات: ${notes || 'لا توجد ملاحظات'}\n\n`;
    orderMessage += `المنتجات:\n`;
    
    cart.forEach(item => {
        orderMessage += `${item.name} - ${item.amount} × ${item.price} دج = ${item.amount * item.price} دج\n`;
    });
    
    orderMessage += `\nالمجموع: ${cartTotal.textContent} دج`;
    
    // هنا يجب إضافة معرف قناة التلجرام الخاصة بك
    const telegramBotToken = '7920850270:AAEoIyp8cTCKRn0DFayPCgxcU_35BwFuElU';
    const chatId = '7808389478';
    
    // إرسال الطلب إلى التلجرام
    fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: orderMessage
        })
    })
    .then(response => response.json())
    .then(data => {
        alert('تم إرسال طلبك بنجاح! سنتصل بك قريباً لتأكيد الطلب.');
        cart = [];
        updateCart();
        customerForm.reset();
        orderFormOverlay.style.display = 'none';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.');
    });
});

// تهيئة السلة عند تحميل الصفحة
updateCart();