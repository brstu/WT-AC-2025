import React, { useState, useEffect } from "react";
import RecipesCard from "./RecipesCard";

export default function RecipesList() {
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/recipes")
      .then(res => res.json())
      .then(data => {
        console.log("Полученные рецепты:", data);
        setRecipes(data);
      })
      .catch(err => console.error("Ошибка загрузки рецептов:", err));
  }, []);

  return (
    <div className="recipes-list">
      {recipes.length === 0 ? (
        <p>Загрузка...</p>
      ) : (
        recipes.map(r => <RecipesCard key={r.id} recipe={r} />)
      )}
    </div>
  );
}
