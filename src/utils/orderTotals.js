const numericValue = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
};

// A line item's discount is applied after GST. Keep this calculation in one
// place so the entry screen, saved payload, and printed quotation agree.
export const calculateLineItem = (item = {}) => {
  const quantity = Number(item.qty || 0);
  const price = Number(item.price || 0);
  const gst = Number(item.gst || 0);
  const discountPercent = Number(item.discount || 0);
  const subtotal = quantity * price;
  const gstAmount = (subtotal * gst) / 100;
  const total = subtotal + gstAmount;
  const discountAmount = (total * discountPercent) / 100;
  const grandTotal = total - discountAmount;

  return { subtotal, gstAmount, total, discountAmount, grandTotal };
};

export const getLineItemTotals = (item = {}) => {
  const calculated = calculateLineItem(item);

  const gstAmount = numericValue(item.gst_amount) ?? calculated.gstAmount;
  const total = numericValue(item.total) ?? calculated.total;
  const discountAmount = numericValue(item.discount_amount) ?? calculated.discountAmount;
  const grandTotal = numericValue(item.grand_total ?? item.line_total) ?? (total - discountAmount);

  return { ...calculated, gstAmount, total, discountAmount, grandTotal };
};

export const getLineTotal = (item = {}) => getLineItemTotals(item).grandTotal;

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
  // return currency ? `${currency} ${formatted}` : formatted;
  return formatted;
};
