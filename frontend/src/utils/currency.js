export const formatCurrency = (value, options = {}) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(Number(value) || 0);
