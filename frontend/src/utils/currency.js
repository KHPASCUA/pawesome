export const formatCurrency = (value, options = {}) => {
  // Sanitize options to prevent invalid fraction digits
  const safeOptions = { ...options };
  
  // Ensure fraction digits are within valid range (0-100)
  if (safeOptions.minimumFractionDigits !== undefined) {
    safeOptions.minimumFractionDigits = Math.max(0, Math.min(100, Number(safeOptions.minimumFractionDigits) || 0));
  }
  if (safeOptions.maximumFractionDigits !== undefined) {
    safeOptions.maximumFractionDigits = Math.max(0, Math.min(100, Number(safeOptions.maximumFractionDigits) || 2));
  }
  
  // Ensure minimum <= maximum
  if (safeOptions.minimumFractionDigits !== undefined && safeOptions.maximumFractionDigits !== undefined) {
    if (safeOptions.minimumFractionDigits > safeOptions.maximumFractionDigits) {
      safeOptions.maximumFractionDigits = safeOptions.minimumFractionDigits;
    }
  }
  
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...safeOptions,
  }).format(Number(value) || 0);
};
