describe('App E2E', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('shows title', () => {
    cy.contains('Фитнес Упражнения').should('be.visible');
  });

  it('shows exercises list', () => {
    cy.contains('Отжимания').should('be.visible');
    cy.contains('Приседания').should('be.visible');
  });

  it('filters by category', () => {
    cy.get('select').select('Грудь');
    cy.contains('Отжимания').should('be.visible');
  });
});
