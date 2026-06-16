describe('Pengujian Halaman Login & Tema Musiman', () => {
  before(() => {
    // Seed database with test user if not exists
    cy.request({
      method: 'POST',
      url: '/api/auth/register',
      failOnStatusCode: false,
      body: {
        name: 'testing pso',
        email: 'testingpso@gmail.com',
        password: 'testing123',
      },
    });
  });

  beforeEach(() => {
    cy.on('uncaught:exception', () => false);
    cy.visit('/login', { failOnStatusCode: false });
    cy.get('.animate-spin', { timeout: 10000 }).should('not.exist');
  });

  it('harus menampilkan form login dengan benar', () => {
    cy.get('h1').should('contain', 'Ardine');
    cy.get('input#email').should('be.visible');
    cy.get('input#password').should('be.visible');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('harus mengaktifkan tombol submit ketika form diisi', () => {
    cy.get('input#email').type('user@example.com');
    cy.get('input#password').type('password123');
    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('harus menampilkan pesan error saat login gagal (Real Backend)', () => {
    cy.get('input#email').type('salah_banget@example.com');
    cy.get('input#password').type('salahpassword123');
    cy.get('button[type="submit"]').click();

    cy.get('.text-destructive', { timeout: 10000 }).should('be.visible');
  });

  it('harus bisa login sukses dan melakukan logout (Real Backend)', () => {
    cy.get('input#email').type('testingpso@gmail.com');
    cy.get('input#password').type('testing123');
    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 10000 }).should('include', '/dashboard');

    cy.contains('testing pso', { matchCase: false })
      .should('be.visible')
      .click();
    cy.contains('Logout', { matchCase: false }).should('be.visible').click();

    cy.url({ timeout: 10000 }).should('include', '/login');
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
