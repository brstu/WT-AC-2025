// Минимальный e2e тест
describe('Portal', () => {
  it('open page', () => {
    cy.visit('/');
    cy.contains('Портал стажировок');
  });

  it('check button', () => {
    cy.visit('/');
    cy.get('.btn').first().click();
  });
});
