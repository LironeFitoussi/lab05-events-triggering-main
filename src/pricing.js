const DISCOUNT_THRESHOLD = 1000;
const DISCOUNT_LARGE_ORDER = 0.10;
const DISCOUNT_PREMIUM = 0.15;
const DISCOUNT_COMBINED = 0.20;

function calculateDiscount(amount, isPremium) {
  const isLargeOrder = amount >= DISCOUNT_THRESHOLD;

  if (isLargeOrder && isPremium) return DISCOUNT_COMBINED;
  if (isPremium) return DISCOUNT_PREMIUM;
  if (isLargeOrder) return DISCOUNT_LARGE_ORDER;
  return 0;
}

function calculateFinalPrice(amount, isPremium = false) {
  if (typeof amount !== 'number' || amount < 0) {
    throw new TypeError('amount must be a non-negative number');
  }
  const discount = calculateDiscount(amount, isPremium);
  return parseFloat((amount * (1 - discount)).toFixed(2));
}

function getPricingBreakdown(amount, isPremium = false) {
  const discount = calculateDiscount(amount, isPremium);
  const finalPrice = calculateFinalPrice(amount, isPremium);
  return {
    originalAmount: amount,
    discountRate: discount,
    discountAmount: parseFloat((amount * discount).toFixed(2)),
    finalPrice,
  };
}

module.exports = { calculateDiscount, calculateFinalPrice, getPricingBreakdown };
