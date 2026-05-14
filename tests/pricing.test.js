const { calculateDiscount, calculateFinalPrice, getPricingBreakdown } = require('../src/pricing');

describe('calculateDiscount', () => {
  test('no discount for small non-premium order', () => {
    expect(calculateDiscount(500, false)).toBe(0);
  });

  test('10% discount for large order (>= 1000)', () => {
    expect(calculateDiscount(1000, false)).toBe(0.10);
    expect(calculateDiscount(1500, false)).toBe(0.10);
  });

  test('15% discount for premium customer', () => {
    expect(calculateDiscount(200, true)).toBe(0.15);
  });

  test('20% discount for premium + large order', () => {
    expect(calculateDiscount(1000, true)).toBe(0.20);
    expect(calculateDiscount(2000, true)).toBe(0.20);
  });
});

describe('calculateFinalPrice', () => {
  test('returns original amount when no discount', () => {
    expect(calculateFinalPrice(500)).toBe(500);
  });

  test('applies 10% discount for large order', () => {
    expect(calculateFinalPrice(1000)).toBe(900);
  });

  test('applies 15% discount for premium', () => {
    expect(calculateFinalPrice(200, true)).toBe(170);
  });

  test('applies 20% discount for premium + large', () => {
    expect(calculateFinalPrice(1000, true)).toBe(800);
  });

  test('throws on negative amount', () => {
    expect(() => calculateFinalPrice(-10)).toThrow(TypeError);
  });

  test('returns 0 for 0 amount', () => {
    expect(calculateFinalPrice(0)).toBe(0);
  });
});

describe('getPricingBreakdown', () => {
  test('returns full breakdown with discount applied', () => {
    const result = getPricingBreakdown(1000, false);
    expect(result.originalAmount).toBe(1000);
    expect(result.discountRate).toBe(0.10);
    expect(result.discountAmount).toBe(100);
    expect(result.finalPrice).toBe(900);
  });

  test('breakdown for no discount', () => {
    const result = getPricingBreakdown(300, false);
    expect(result.discountRate).toBe(0);
    expect(result.discountAmount).toBe(0);
    expect(result.finalPrice).toBe(300);
  });
});
