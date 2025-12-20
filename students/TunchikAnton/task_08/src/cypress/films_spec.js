describe('Фестиваль фильмов', () => {
  beforeEach(() => {
    cy.intercept('GET', '/api/films', {
      statusCode: 200,
      body: [
        {
          id: 1,
          title: 'Интерстеллар',
          director: 'Кристофер Нолан',
          year: 2014,
          rating: 8.6,
          duration: 169
        },
        {
          id: 2,
          title: 'Паразиты',
          director: 'Пон Чжун Хо',
          year: 2019,
          rating: 8.6,
          duration: 132
        }
      ]
    }).as('getFilms');
  });

  it('загружает главную страницу', () => {
    cy.visit('/');
    cy.contains('🎬 Фильмы фестиваля').should('be.visible');
  });

  it('отображает фильмы', () => {
    cy.visit('/');
    cy.wait('@getFilms');
    cy.contains('Интерстеллар').should('be.visible');
    cy.contains('Паразиты').should('be.visible');
  });

  it('добавляет фильм в закладки', () => {
    cy.visit('/');
    cy.wait('@getFilms');
    cy.contains('📌 В закладки').first().click();
    
    cy.on('window:alert', (text) => {
      expect(text).to.contain('Интерстеллар');
    });
  });
});