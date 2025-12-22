describe('Memes Gallery E2E Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should load the homepage', () => {
    cy.contains('Memes Gallery').should('be.visible');
    cy.get('input[placeholder="Search memes..."]').should('be.visible');
    cy.get('button').contains('Search').should('be.visible');
  });

  it('should display loading state', () => {
    cy.get('#loading').should('be.visible');
  });

  it('should load and display memes', () => {
    cy.get('.meme-card', { timeout: 10000 }).should('have.length.at.least', 1);
    
    cy.get('.meme-card').first().within(() => {
      cy.get('img').should('be.visible');
      cy.get('.meme-title').should('not.be.empty');
      cy.get('.meme-description').should('not.be.empty');
      cy.contains('❤️').should('be.visible');
      cy.contains('👁️').should('be.visible');
    });
  });

  it('should search memes', () => {
    cy.get('input[placeholder="Search memes..."]').type('doge');
    cy.get('button').contains('Search').click();
    
    cy.get('.meme-card', { timeout: 5000 }).should('have.length.at.least', 1);
    cy.get('.meme-title').first().should('contain.text', 'Doge');
  });

  it('should like a meme', () => {
    cy.get('.meme-card', { timeout: 10000 }).first().within(() => {
      cy.get('.like-count').then(($likeCount) => {
        const initialLikes = parseInt($likeCount.text());
        
        cy.get('.like-button').click();
        
        cy.get('.like-count', { timeout: 3000 })
          .should(($newLikeCount) => {
            const newLikes = parseInt($newLikeCount.text());
            expect(newLikes).to.equal(initialLikes + 1);
          });
      });
    });
  });

  it('should handle empty search results', () => {
    cy.get('input[placeholder="Search memes..."]').type('nonexistentmeme123');
    cy.get('button').contains('Search').click();
    
    cy.get('.no-results', { timeout: 5000 }).should('be.visible');
    cy.contains('No memes found').should('be.visible');
  });

  it('should have working navigation', () => {
    cy.get('nav').should('be.visible');
    cy.get('nav a').should('have.length.at.least', 2);
    
    cy.get('nav a').contains('Home').click();
    cy.url().should('include', '/');
    
    if (Cypress.$('nav a:contains("About")').length) {
      cy.get('nav a').contains('About').click();
      cy.url().should('include', '/about');
    }
  });

  it('should be responsive', () => {
    cy.viewport('iphone-6');
    cy.get('.meme-card').should('be.visible');
    
    cy.viewport('macbook-15');
    cy.get('.meme-card').should('be.visible');
  });

  it('should have accessible elements', () => {
    cy.get('input[placeholder="Search memes..."]')
      .should('have.attr', 'aria-label', 'Search for memes');
    
    cy.get('.meme-card img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt').and('not.be.empty');
    });
  });
});