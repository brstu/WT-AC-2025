import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EventsList from "../pages/EventsList";
import { vi } from "vitest";

vi.mock("../api", () => {
  const mockMiddleware = () => (next: any) => (action: any) => next(action);
  return {
    eventsApi: {
      reducerPath: "eventsApi",
      reducer: (s = {}) => s,
      middleware: mockMiddleware,
    },
    useGetEventsQuery: () => ({
      data: [
        { id: 1, name: "Product A", location: "Store", date: "" },
      ],
      isLoading: false,
      error: undefined,
    }),
    useDeleteEventMutation: () => [vi.fn()],
  };
});

describe("EventsList (Mini-shop)", () => {
  test("renders shop title and product", () => {
    render(
      <MemoryRouter>
        <EventsList />
      </MemoryRouter>
    );

    expect(screen.getByText(/Мини‑магазин/)).toBeInTheDocument();
    expect(screen.getByText(/Product A/)).toBeInTheDocument();
  });
});

