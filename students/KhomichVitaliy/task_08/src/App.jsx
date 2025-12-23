import React from "react";
import ListingCard from "./ListingCard";

export default function App() {
  const listings = [
    { id: 1, title: "Cozy Apartment", price: "$500" },
    { id: 2, title: "Modern Loft", price: "$800" },
    { id: 3, title: "Studio Downtown", price: "$400" }
  ];

  return (
    <div style={{ fontFamily: "sans-serif", padding: "1rem" }}>
      <h1>Available Rentals</h1>
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          title={listing.title}
          price={listing.price}
        />
      ))}
    </div>
  );
}
