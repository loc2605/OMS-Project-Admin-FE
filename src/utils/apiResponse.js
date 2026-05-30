/** Standard API envelope: { success, status, message, result } */
export const isApiSuccess = (data) => Boolean(data?.success);

export const getApiResult = (data, fallback = null) =>
  isApiSuccess(data) ? data.result : fallback;
