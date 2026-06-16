describe('Fitur Time Tracking (Start/Stop Timer)', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false);
  });

  it('harus bisa login, menjalankan timer, dan menghentikannya', () => {
    cy.visit('/login');

    cy.get('input#email').type('testingpso@gmail.com');
    cy.get('input#password').type('testing123');
    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 10000 }).should('include', '/dashboard');

    cy.get('body').then(($body) => {
      if ($body.text().includes('Stop Timer')) {
        cy.contains('button', 'Stop Timer').click();
        cy.wait(2000);
      }
    });

    cy.contains('button', 'Start Timer').should('be.visible').click();

    cy.get('[role="dialog"]').should('be.visible');

    cy.get('select#project')
      .find('option', { timeout: 10000 })
      .should('have.length.greaterThan', 1);
    cy.get('select#project').select(1);

    cy.get('[role="dialog"]').contains('button', 'Start Timer').click();

    cy.contains('button', 'Stop').should('be.visible');

    cy.wait(3000);

    cy.contains('button', 'Stop').should('be.visible').click({ force: true });

    cy.contains('button', 'Start Timer', { timeout: 10000 }).should(
      'be.visible'
    );
  });
});
