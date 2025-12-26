import { render, screen, waitFor } from "@testing-library/react";
import RecipesList from "./RecipesList";

// мок данных
const mockRecipes = [
  { id: 1, name: "Борщ", description: "Классический украинский суп" },
];

beforeEach(() => {
  // подменяем глобальный fetch
  global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(mockRecipes),
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

test("загружает и отображает список рецептов", async () => {
  render(<RecipesList />);

  await waitFor(() => screen.getByText(/Борщ/i));

  expect(screen.getByText(/Борщ/i)).toBeInTheDocument();
  expect(screen.getByText(/Классический украинский суп/i)).toBeInTheDocument();
});
