import React from "react";
import RecipesList from "./RecipesList";

export default function App() {
  return (
    <div className="container">
      <header>
        <h1>🍲 Каталог рецептов</h1>
      </header>
      <main>
        <RecipesList />
      </main>
    </div>
  );
}
