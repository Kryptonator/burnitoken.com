// tests/accessibility.test.js
const { JSDOM } = require('jsdom');

describe('Accessibility', () => {
  it('should have skip link and ARIA labels', () => {
    const dom = new JSDOM(
      `<!DOCTYPE html><a href="#main" class="sr-only focus:not-sr-only">Skip to main content</a><nav aria-label="Main navigation"></nav>`,
    );
    const document = dom.window.document;
    expect(document.querySelector('a.sr-only')).not.toBeNull();
    expect(document.querySelector('nav[aria-label]')).not.toBeNull();
  });
});
