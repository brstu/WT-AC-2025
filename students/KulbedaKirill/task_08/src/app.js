var cart = [];
var total = 0;

function addToCart(id) {
    var product;
    if (id == 1) {
        product = { id: 1, name: 'Смартфон Galaxy S21', price: 45000 };
    } else if (id == 2) {
        product = { id: 2, name: 'Ноутбук HP Pavilion', price: 65000 };
    } else if (id == 3) {
        product = { id: 3, name: 'Планшет iPad Air', price: 55000 };
    } else if (id == 4) {
        product = { id: 4, name: 'iPhone 13 Pro', price: 85000 };
    } else if (id == 5) {
        product = { id: 5, name: 'MacBook Pro', price: 150000 };
    } else if (id == 6) {
        product = { id: 6, name: 'Samsung Galaxy Tab', price: 35000 };
    }
    
    cart.push(product);
    total = total + product.price;
    
    updateCart();
    alert('Товар добавлен в корзину!');
}

function updateCart() {
    document.getElementById('cart-count').innerHTML = cart.length;
    document.getElementById('total').innerHTML = total;
    
    var cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';
    
    for (var i = 0; i < cart.length; i++) {
        var item = document.createElement('div');
        item.innerHTML = cart[i].name + ' - ' + cart[i].price + ' руб';
        cartItems.appendChild(item);
    }
}

function filterCategory(category) {
    var products = document.querySelectorAll('.product');
    
    for (var i = 0; i < products.length; i++) {
        if (category == 'all') {
            products[i].style.display = 'block';
        } else {
            if (products[i].getAttribute('data-category') == category) {
                products[i].style.display = 'block';
            } else {
                products[i].style.display = 'none';
            }
        }
    }
}

document.getElementById('search').addEventListener('input', function() {
    var searchValue = this.value.toLowerCase();
    var products = document.querySelectorAll('.product');
    
    for (var i = 0; i < products.length; i++) {
        var title = products[i].querySelector('.title').innerHTML.toLowerCase();
        if (title.indexOf(searchValue) > -1) {
            products[i].style.display = 'block';
        } else {
            products[i].style.display = 'none';
        }
    }
});

function calculateTotal() {
    var sum = 0;
    for (var i = 0; i < cart.length; i++) {
        sum = sum + cart[i].price;
    }
    return sum;
}

function getCartCount() {
    return cart.length;
}

function clearCart() {
    cart = [];
    total = 0;
    updateCart();
}
