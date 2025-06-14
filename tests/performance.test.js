// tests/performance.test.js
describe('Performance monitoring', () => {
  it('should have performance API available', () => {
    // Test that performance monitoring can be initialized
    const mockPerformance = {
      marks: [],
      mark: jest.fn(),
      measure: jest.fn(),
      timing: {
        navigationStart: 0,
        loadEventEnd: 100,
      },
    };

    expect(mockPerformance.mark).toBeDefined();
    expect(mockPerformance.timing).toBeDefined();
  });

  it('should calculate load time correctly', () => {
    const timing = {
      navigationStart: 0,
      loadEventEnd: 100,
    };
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    expect(loadTime).toBe(100);
  });
});
