export const normalizeList = (result, keys = []) => {
  if (Array.isArray(result)) return result;

  for (const key of keys) {
    if (Array.isArray(result?.[key])) return result[key];
  }

  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.items)) return result.items;
  if (Array.isArray(result?.orders)) return result.orders;
  if (Array.isArray(result?.requests)) return result.requests;
  if (Array.isArray(result?.service_requests)) return result.service_requests;
  if (Array.isArray(result?.appointments)) return result.appointments;
  if (Array.isArray(result?.bookings)) return result.bookings;
  if (Array.isArray(result?.boardings)) return result.boardings;
  if (Array.isArray(result?.payments)) return result.payments;
  if (Array.isArray(result?.transactions)) return result.transactions;
  if (Array.isArray(result?.logs)) return result.logs;
  if (Array.isArray(result?.history)) return result.history;
  if (Array.isArray(result?.reports)) return result.reports;
  if (Array.isArray(result?.customers)) return result.customers;
  if (Array.isArray(result?.inventory)) return result.inventory;
  if (Array.isArray(result?.shipments)) return result.shipments;
  if (Array.isArray(result?.confinements)) return result.confinements;
  if (Array.isArray(result?.boarding)) return result.boarding;
  if (Array.isArray(result?.employees)) return result.employees;
  if (Array.isArray(result?.salaries)) return result.salaries;
  if (Array.isArray(result?.payrolls)) return result.payrolls;
  if (Array.isArray(result?.records)) return result.records;
  if (Array.isArray(result?.services)) return result.services;
  if (Array.isArray(result?.patients)) return result.patients;
  if (Array.isArray(result?.pets)) return result.pets;
  if (Array.isArray(result?.medical_records)) return result.medical_records;
  if (Array.isArray(result?.veterinary_records)) return result.veterinary_records;
  if (Array.isArray(result?.boarding_requests)) return result.boarding_requests;
  if (Array.isArray(result?.medical_confinements)) return result.medical_confinements;
  if (Array.isArray(result?.inventory_logs)) return result.inventory_logs;

  return [];
};

export const safeMap = (array, callback) => {
  if (!Array.isArray(array)) return [];
  return array.map(callback);
};

export const safeArray = (data) => {
  return Array.isArray(data) ? data : [];
};
