/// <reference types="cypress" />

describe('Diary App E2E', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/');
  });

  it('creates a new entry', () => {
    cy.get('a').contains('Add New Entry').click();
    cy.url().should('include', '/new');
    cy.get('input[type="date"]').type('2023-01-01');
    cy.get('textarea').type('E2E test entry');
    cy.get('input[type="text"]').type('tag1,tag2');
    cy.get('button').contains('Save').click();
    cy.url().should('eq', 'http://localhost:3000/');
    cy.contains('E2E test entry');
  });

  it('edits an existing entry', () => {
    localStorage.setItem(
      'diaryEntries',
      JSON.stringify([
        { id: 'test-id', date: '2023-01-01', text: 'Original', tags: [] },
      ])
    );
    cy.visit('/');
    cy.get('a').contains('Edit').click();
    cy.get('textarea').clear().type('Edited entry');
    cy.get('button').contains('Save').click();
    cy.contains('Edited entry');
    localStorage.clear();
  });
});
