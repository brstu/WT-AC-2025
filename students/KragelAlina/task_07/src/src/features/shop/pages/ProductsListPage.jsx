import { useState } from 'react';
import { useGetProductsQuery, useGetCategoriesQuery } from '../api/shopApi';
import { ProductCard } from '../components/ProductCard';
import { Spinner } from '../../../components/ui/Spinner';
import './ProductsListPage.css';

export function ProductsListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data, isLoading, error } = useGetProductsQuery({
    page,
    limit: 6,
    search,
    category: selectedCategory,
  });

  const { data: categories } = useGetCategoriesQuery();

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPage(1);
  };

  if (error) {
    return (
      <div className="products-list-page__error">
        <p>Error loading products</p>
      </div>
    );
  }

  const products = data?.data || [];
  const pagination = data?.pagination || { page: 1, pages: 1 };

  return (
    <div className="products-list-page">
      <div className="products-list-page__header">
        <h1>Shop</h1>
        <p>Discover our amazing products</p>
      </div>

      <div className="products-list-page__controls">
        <div className="products-list-page__search">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={handleSearchChange}
            className="products-list-page__input"
          />
        </div>

        {categories && categories.length > 0 && (
          <div className="products-list-page__filter">
            <select value={selectedCategory} onChange={handleCategoryChange}>
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="products-list-page__loading">
          <Spinner />
        </div>
      ) : products.length === 0 ? (
        <div className="products-list-page__empty">
          <p>No products found</p>
        </div>
      ) : (
        <>
          <div className="products-list-page__grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="products-list-page__pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="products-list-page__btn"
              >
                Previous
              </button>

              <span className="products-list-page__page-info">
                Page {page} of {pagination.pages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="products-list-page__btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
