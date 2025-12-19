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
      <div className="product-detail-page-loading">
        <Spinner />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page-error">
        <h2>Product not found</h2>
        <Link to="/" className="product-detail-page-link">
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
      <Link to="/" className="product-detail-page-back">
        ← Back to Shop
      </Link>

      <div className="product-detail-page-container">
        <div className="product-detail-page-image">
          <img src={product.image} alt={product.name} />
        </div>

        <div className="product-detail-page-info">
          <h1 className="product-detail-page-title">{product.name}</h1>

          <div className="product-detail-page-rating">
            ⭐ Rating: {product.rating}/5
          </div>

          <p className="product-detail-page-description">
            {product.description}
          </p>

          <div className="product-detail-page-category">
            <span className="product-detail-page-label">Category:</span>
            <span className="product-detail-page-value">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </span>
          </div>

          <div className="product-detail-page-price">
            <span className="product-detail-page-label">Price:</span>
            <span className="product-detail-page-amount">${product.price}</span>
          </div>

          <div className="product-detail-page-stock">
            <span className="product-detail-page-label">In Stock:</span>
            <span className={`product-detail-page-stock-value${product.stock === 0 ? '-out' : ''}`}>
              {product.stock === 0 ? 'Out of Stock' : `${product.stock} units`}
            </span>
          </div>

          {product.stock > 0 && (
            <div className="product-detail-page-actions">
              <div className="product-detail-page-quantity">
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
                className="product-detail-page-add-btn"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
          )}

          {product.stock === 0 && (
            <button className="product-detail-page-add-btn" disabled>
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
