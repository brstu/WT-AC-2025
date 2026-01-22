import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "@/app/store";
import TournamentsList from "../pages/TournamentsList";

test("отображается индикатор загрузки", () => {
  render(
    <Provider store={store}>
      <TournamentsList />
    </Provider>
  );

  expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();
});
