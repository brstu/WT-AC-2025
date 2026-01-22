import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../../store/cartSlice';
import './ProductCard.css';

export function ProductCard({ product }) {
  const dispatch = useDispatch();

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    }));
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card__link">
        <div className="product-card__image">
          <img src={product.image} alt={product.name} />
          {product.stock === 0 && <div className="product-card__out-of-stock">Out of Stock</div>}
        </div>
        <div className="product-card__body">
          <h3 className="product-card__title">{product.name}</h3>
          <p className="product-card__description">{product.description}</p>
          <div className="product-card__rating">
            ⭐ {product.rating}
          </div>
        </div>
      </Link>
      <div className="product-card__footer">
        <span className="product-card__price">${product.price}</span>
        <button
          className="product-card__btn"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
