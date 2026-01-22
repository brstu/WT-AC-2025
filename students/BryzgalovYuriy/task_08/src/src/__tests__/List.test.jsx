import { render, screen } from "@testing-library/react";
import List from "../pages/List";
import { describe, it, expect, vi } from "vitest";

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({
    data: [{ id: 1, title: "Startup One" }],
    isLoading: false,
    error: null,
    refetch: vi.fn()
  })
}));

vi.mock("react-router-dom", () => ({
  Link: ({ children }) => <span>{children}</span>
}));

describe("List", () => {
  it("renders items from query", () => {
    render(<List />);
    expect(screen.getByText("Startup One")).toBeInTheDocument();
  });
});
