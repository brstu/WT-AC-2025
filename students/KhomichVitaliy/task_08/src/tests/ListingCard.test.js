import { render, screen } from "@testing-library/react";
import ListingCard from "../src/ListingCard";

test("renders listing title", () => {
  render(<ListingCard title="Cozy Apartment" />);
  expect(screen.getByText(/Cozy Apartment/i)).toBeInTheDocument();
});
