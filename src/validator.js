const VALID_STATUSES = ['pending', 'approved', 'rejected', 'shipped'];

function validateOrder(order) {
  const errors = [];

  if (!order || typeof order !== 'object') {
    return { valid: false, errors: ['Order must be an object'] };
  }

  if (!order.id || typeof order.id !== 'string') {
    errors.push('Order id must be a non-empty string');
  }

  if (!order.customerId || typeof order.customerId !== 'string') {
    errors.push('customerId must be a non-empty string');
  }

  if (typeof order.amount !== 'number' || order.amount <= 0) {
    errors.push('amount must be a positive number');
  }

  if (!VALID_STATUSES.includes(order.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  if (!Array.isArray(order.items) || order.items.length === 0) {
    errors.push('items must be a non-empty array');
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateOrder, VALID_STATUSES };
