describe('E2E Test', () => {
  it('should load page', () => {
    cy.visit('/');
    cy.contains('Фитнес Упражнения');
  });

  it('should show exercises', () => {
    cy.visit('/');
    cy.contains('Отжимания');
  });
});
