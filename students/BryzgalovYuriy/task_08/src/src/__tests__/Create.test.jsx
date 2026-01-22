import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Create from "../pages/Create";
import { describe, it, expect, vi } from "vitest";

const navMock = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => navMock
}));

vi.mock("../api", () => ({
  createItem: vi.fn(async () => ({ id: 1, title: "New Startup", done: false }))
}));

describe("Create", () => {
  it("submits form and navigates to list", async () => {
    const user = userEvent.setup();
    render(<Create />);

    await user.type(screen.getByPlaceholderText("Название"), "New Startup");
    await user.click(screen.getByRole("button", { name: "Создать" }));

    expect(navMock).toHaveBeenCalledWith("/");
  });
});
