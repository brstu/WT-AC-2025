describe('Библиотека подкастов', () => {
  it('отображает список подкастов и позволяет выбрать', () => {
    cy.visit('/');
    cy.get('[data-testid="podcast-card"]').should('have.length', 2);
    cy.contains('React Podcast').click();
    cy.contains('Сейчас играет: React Podcast').should('be.visible');
    cy.get('audio').should('exist');
  });
});