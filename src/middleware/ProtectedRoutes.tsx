import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoutes = ({
  children,
  user,
  redirectTo = '/login',
  openNotification,
}: any) => {
  if (!user) {
    openNotification('error', 'Not authorized', 'You need to login first');
    return <Navigate to={redirectTo} />;
  }
  return children ? children : <Outlet />;
};

const SessionRoutes = ({
  children,
  user,
  redirectTo = '/tickets',
  openNotification,
}: any) => {
  if (user) {
    return <Navigate to={redirectTo} />;
  }
  return children ? children : <Outlet />;
};

const AdminRoutes = ({
  children,
  user,
  redirectTo = '/home',
  openNotification,
}: any) => {
  if (!user.user.rol.includes('admin')) {
    return <Navigate to={redirectTo} />;
  }
  return children ? children : <Outlet />;
};


export {ProtectedRoutes, SessionRoutes, AdminRoutes};
