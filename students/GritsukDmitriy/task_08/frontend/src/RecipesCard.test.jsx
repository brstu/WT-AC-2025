import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom"; // <- обязательно
import RecipesCard from "./RecipesCard";

const sampleRecipe = {
  id: 1,
  name: "Борщ",
  description: "Классический украинский суп",
};

test("отображает название и описание рецепта", () => {
  render(<RecipesCard recipe={sampleRecipe} />);

  expect(screen.getByText(/Борщ/i)).toBeInTheDocument();
  expect(screen.getByText(/Классический украинский суп/i)).toBeInTheDocument();
});
