describe("Rental Catalog", () => {
  it("loads home page", () => {
    cy.visit("http://localhost:3000");
    cy.contains("Available Rentals");
  });
});
