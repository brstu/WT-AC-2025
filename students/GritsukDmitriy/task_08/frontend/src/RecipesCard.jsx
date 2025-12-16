import React from "react";

export default function RecipesCard({ recipe }) {
  return (
    <div className="card">
      <div className="card-body">
        <h3>{recipe.name}</h3>
        <p>{recipe.description}</p>
      </div>
    </div>
  );
}

