describe('Blog Platform E2E Tests', () => {
  
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  // Тест загрузки страницы
  it('should load the page', () => {
    cy.contains('Блог-платформа').should('exist');
  });

  // Тест списка постов
  it('should have posts list', () => {
    cy.get('#posts-list').should('exist');
  });

  // Тест кнопки создания
  it('should display new post button', () => {
    cy.get('#new-post-btn').should('be.visible');
  });

  // Тест открытия модального окна
  it('can open modal', () => {
    cy.get('#new-post-btn').click();
    cy.get('#modal').should('exist');
  });

  // Тест формы в модальном окне
  it('modal has form', () => {
    cy.get('#new-post-btn').click();
    cy.get('#post-form').should('exist');
  });

  // Тест полей формы
  it('form has inputs', () => {
    cy.get('#new-post-btn').click();
    cy.get('#title-input').should('exist');
    cy.get('#content-input').should('exist');
  });

  // Тест ввода в форму
  it('can type in form', () => {
    cy.get('#new-post-btn').click();
    cy.get('#title-input').type('Тестовая статья');
    cy.get('#title-input').should('have.value', 'Тестовая статья');
  });
});
