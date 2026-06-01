interface FetchError {
  status?: number;
  data?: { message?: string; details?: unknown };
}

export const getErrorMessage = (err: unknown): string => {
  if (!err) return 'Something went wrong';
  const e = err as FetchError;
  if (e.data?.message) return e.data.message;
  if (typeof e === 'object' && 'message' in (e as { message?: string })) {
    return (e as { message?: string }).message ?? 'Something went wrong';
  }
  return 'Something went wrong';
};
