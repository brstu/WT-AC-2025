import React from "react";

export default function ListingCard({ title, price }) {
  return (
    <div className="listing-card">
      <h2>{title}</h2>
      <p>{price}</p>
      <a href="#" className="listing-link">Details</a>
    </div>
  );
}
