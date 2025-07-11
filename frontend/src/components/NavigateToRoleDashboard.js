import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function NavigateToRoleDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/');

    try {
      const decoded = jwtDecode(token);
      const role = decoded.role;

      if (role === 'admin') navigate('/admin');
      else if (role === 'owner') navigate('/owner');
      else navigate('/user');
    } catch {
      navigate('/');
    }
  }, [navigate]);

  return null;
}

export default NavigateToRoleDashboard;
