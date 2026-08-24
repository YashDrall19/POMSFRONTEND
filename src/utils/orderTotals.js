const numericValue = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
};

export const getLineTotal = (item = {}) => {
  const savedTotal = numericValue(item.line_total ?? item.total);
  if (savedTotal !== null) return savedTotal;

  const quantity = Number(item.qty || 0);
  const price = Number(item.price || 0);
  const gst = Number(item.gst || 0);
  const discountPercent = Number(item.discount || 0);
  const base = quantity * price;

  return base + (base * gst) / 100 - (base * discountPercent) / 100;
};

// Saved order totals are the source of truth. The fallback supports an unsaved
// quotation preview and older transactions created before the totals were saved.
export const getOrderTotals = (order = {}) => {
  const calculatedTotal = (order.items || []).reduce((sum, item) => sum + getLineTotal(item), 0);
  const totalPrice = numericValue(order.total_price) ?? calculatedTotal;
  const specialDiscount = numericValue(order.special_discount) ?? 0;
  const grandTotal = numericValue(order.grand_total) ?? (totalPrice - specialDiscount);

  return { totalPrice, specialDiscount, grandTotal };
};

export const formatOrderAmount = (amount, currency) => {
  const formatted = Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency ? `${currency} ${formatted}` : formatted;
};
