const { validateOrder } = require('./validator');
const { calculateFinalPrice } = require('./pricing');

const STATUS_TRANSITIONS = {
  pending: ['approved', 'rejected'],
  approved: ['shipped'],
  rejected: [],
  shipped: [],
};

function createOrder({ id, customerId, items, isPremium = false }) {
  if (!id || !customerId || !Array.isArray(items) || items.length === 0) {
    throw new Error('Missing required order fields');
  }

  const amount = items.reduce((sum, item) => {
    if (typeof item.price !== 'number' || typeof item.quantity !== 'number') {
      throw new TypeError('Each item must have numeric price and quantity');
    }
    return sum + item.price * item.quantity;
  }, 0);

  const order = {
    id,
    customerId,
    items,
    amount: parseFloat(amount.toFixed(2)),
    finalPrice: calculateFinalPrice(amount, isPremium),
    isPremium,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const { valid, errors } = validateOrder(order);
  if (!valid) throw new Error(`Invalid order: ${errors.join('; ')}`);

  return order;
}

function updateStatus(order, newStatus) {
  const allowed = STATUS_TRANSITIONS[order.status];
  if (!allowed) throw new Error(`Unknown current status: ${order.status}`);
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot transition from '${order.status}' to '${newStatus}'`);
  }
  return { ...order, status: newStatus, updatedAt: new Date().toISOString() };
}

function canShip(order) {
  return order.status === 'approved' && order.amount > 0;
}

module.exports = { createOrder, updateStatus, canShip };
