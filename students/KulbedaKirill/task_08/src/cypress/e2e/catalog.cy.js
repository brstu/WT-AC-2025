// cypress/e2e/catalog.cy.js

describe('Каталог гаджетов', () => {
  it('открывает главную страницу', () => {
    cy.visit('http://localhost:8080');
    cy.contains('Магазин гаджетов');
  });

  it('фильтрует товары по категории', () => {
    cy.visit('http://localhost:8080');
    cy.contains('Телефоны').click();
    cy.get('.product').should('have.length.at.least', 1);
  });
});
