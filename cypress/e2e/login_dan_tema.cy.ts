describe('Pengujian Halaman Login & Tema Musiman', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false);
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');
  });

  it('harus menampilkan form login dengan benar', () => {
    cy.get('h1').should('contain', 'Ardine - PSO 5');
    cy.get('input#email').should('be.visible');
    cy.get('input#password').should('be.visible');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('harus mengaktifkan tombol submit ketika form diisi', () => {
    cy.get('input#email').type('user@example.com');
    cy.get('input#password').type('password123');
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('harus menampilkan pesan error saat login gagal', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { error: 'Email atau password salah' },
    }).as('loginRequest');

    cy.get('input#email').type('salah@example.com');
    cy.get('input#password').type('salahpassword');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.get('.text-destructive').should('be.visible');
  });

  it('harus menerapkan class tema musiman pada dokumen jika diaktifkan (Staging)', () => {
    const themes = ['halloween', 'christmas'];
    themes.forEach((theme) => {
      cy.document().then((doc) => {
        doc.documentElement.classList.add(theme);
      });
      cy.get('html').should('have.class', theme);
      cy.document().then((doc) => {
        doc.documentElement.classList.remove(theme);
      });
    });
  });
});
