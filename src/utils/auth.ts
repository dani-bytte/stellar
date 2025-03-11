export function isAuthenticated(): boolean {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return !!token;
}
