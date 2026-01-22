import { render, screen } from "@testing-library/react";
import App from "../App";
import { describe, it, expect, vi } from "vitest";

vi.mock("react-router-dom", () => ({
  Link: ({ children }) => <span>{children}</span>,
  Outlet: () => <div>Outlet</div>
}));

describe("App", () => {
  it("renders header and nav", () => {
    render(<App />);
    expect(screen.getByText("Справочник стартапов")).toBeInTheDocument();
    expect(screen.getByText("Список")).toBeInTheDocument();
    expect(screen.getByText("Добавить")).toBeInTheDocument();
  });
});
