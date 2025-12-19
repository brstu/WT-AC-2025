import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../../../store/cartSlice';
import './CartPage.css';

export function CartPage() {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear the entire cart?')) {
      dispatch(clearCart());
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="cart-page__title">Shopping Cart</h1>
        <div className="cart-page__empty">
          <p>Your cart is empty</p>
          <Link to="/" className="cart-page__link">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-page__title">Shopping Cart</h1>

      <div className="cart-page__container">
        <div className="cart-page__items">
          {cart.map((item) => (
            <div key={item.id} className="cart-page__item">
              <img src={item.image} alt={item.name} className="cart-page__image" />

              <div className="cart-page__details">
                <h3 className="cart-page__item-name">{item.name}</h3>
                <p className="cart-page__item-price">${item.price}</p>
              </div>

              <div className="cart-page__quantity">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="cart-page__qty-btn"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                  className="cart-page__qty-input"
                />
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="cart-page__qty-btn"
                >
                  +
                </button>
              </div>

              <div className="cart-page__subtotal">
                ${(item.price * item.quantity).toFixed(2)}
              </div>

              <button
                onClick={() => handleRemove(item.id)}
                className="cart-page__remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="cart-page__summary">
          <h2 className="cart-page__summary-title">Order Summary</h2>

          <div className="cart-page__summary-row">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="cart-page__summary-row">
            <span>Tax (10%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <div className="cart-page__summary-row cart-page__summary-total">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button className="cart-page__checkout-btn">
            Proceed to Checkout
          </button>

          <Link to="/" className="cart-page__continue-link">
            Continue Shopping
          </Link>

          <button
            onClick={handleClear}
            className="cart-page__clear-btn"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  );
}
