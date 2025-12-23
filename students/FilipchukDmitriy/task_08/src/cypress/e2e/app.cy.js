describe('Open Source Catalog', () => {
  it('opens the app', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Каталог');
  });

  it('has projects', () => {
    cy.visit('http://localhost:3000');
    cy.wait(1000);
    cy.get('.project-card').should('exist');
  });
});
