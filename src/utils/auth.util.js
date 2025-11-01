export const getToken = () => localStorage.getItem('token');
export const getRole  = () => localStorage.getItem('role');
export const clearAuth = () => {
	try {
		localStorage.removeItem('token');
		localStorage.removeItem('role');
		localStorage.removeItem('user');
		localStorage.removeItem('email');
	} catch {}
};
