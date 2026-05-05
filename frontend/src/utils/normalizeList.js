export const normalizeList = (result, keys = []) => {
  if (Array.isArray(result)) return result;

  for (const key of keys) {
    if (Array.isArray(result?.[key])) return result[key];
  }

  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.orders)) return result.orders;
  if (Array.isArray(result?.requests)) return result.requests;
  if (Array.isArray(result?.appointments)) return result.appointments;
  if (Array.isArray(result?.payments)) return result.payments;

  return [];
};
