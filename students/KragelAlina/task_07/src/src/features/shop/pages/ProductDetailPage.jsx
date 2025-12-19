import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGetProductByIdQuery } from '../api/shopApi';
import { addToCart } from '../../../store/cartSlice';
import { Spinner } from '../../../components/ui/Spinner';
import './ProductDetailPage.css';

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useGetProductByIdQuery(id);

  if (isLoading) {
    return (
      <div className="product-detail-page__loading">
        <Spinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page__error">
        <h2>Product not found</h2>
        <Link to="/" className="product-detail-page__link">
          Back to Shop
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
    }));
    setQuantity(1);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setQuantity(Math.max(1, Math.min(value, product.stock)));
  };

  return (
    <div className="product-detail-page">
      <Link to="/" className="product-detail-page__back">
        ← Back to Shop
      </Link>

      <div className="product-detail-page__container">
        <div className="product-detail-page__image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="product-detail-page__info">
          <h1 className="product-detail-page__title">{product.name}</h1>

          <div className="product-detail-page__rating">
            ⭐ Rating: {product.rating}/5
          </div>

          <p className="product-detail-page__description">
            {product.description}
          </p>

          <div className="product-detail-page__category">
            <span className="product-detail-page__label">Category:</span>
            <span className="product-detail-page__value">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </span>
          </div>

          <div className="product-detail-page__price">
            <span className="product-detail-page__label">Price:</span>
            <span className="product-detail-page__amount">${product.price}</span>
          </div>

          <div className="product-detail-page__stock">
            <span className="product-detail-page__label">In Stock:</span>
            <span className={`product-detail-page__stock-value ${product.stock === 0 ? 'out' : ''}`}>
              {product.stock === 0 ? 'Out of Stock' : `${product.stock} units`}
            </span>
          </div>

          {product.stock > 0 && (
            <div className="product-detail-page__actions">
              <div className="product-detail-page__quantity">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={handleQuantityChange}
                />
              </div>

              <button
                className="product-detail-page__add-btn"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
          )}

          {product.stock === 0 && (
            <button className="product-detail-page__add-btn" disabled>
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
