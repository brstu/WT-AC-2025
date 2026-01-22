import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "@/app/store";
import EventsList from "../pages/EventsList";

test("отображается индикатор загрузки", () => {
  render(
    <Provider store={store}>
      <EventsList />
    </Provider>
  );

  expect(screen.getByText(/Загрузка/i)).toBeInTheDocument();
});
