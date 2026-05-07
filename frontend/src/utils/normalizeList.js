export const normalizeList = (
  result,
  possibleKeys = ["data", "employees", "salaries", "payrolls", "records"]
) => {
  if (!result) return [];
  if (Array.isArray(result)) return result;

  const fallbackKeys = [
    "data",
    "employees",
    "salaries",
    "payrolls",
    "records",
    "items",
    "orders",
    "requests",
    "appointments",
    "payments",
  ];
  const keys = [...new Set([...(possibleKeys || []), ...fallbackKeys])];

  for (const key of keys) {
    const value = result?.[key];

    if (Array.isArray(value)) return value;
    if (value && typeof value === "object") {
      const nested = normalizeList(value, possibleKeys);
      if (nested.length > 0) return nested;
    }
  }

  return [];
};
