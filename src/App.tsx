import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Header, Login, Signup, Home, Profile, Tickets, Users } from './Components';
import { notification } from 'antd';
import { AdminRoutes, ProtectedRoutes, SessionRoutes } from './middleware/ProtectedRoutes';

type NotificationType = 'success' | 'info' | 'warning' | 'error';

function App() {
  const [user, setUser] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  useEffect(() => {
    syncSaveUser();
  }, []);

  const syncSaveUser = () => {
    if (localStorage.getItem('user')) {
      setUser(JSON.parse(localStorage.getItem('user')!));
    }
    if (sessionStorage.getItem('user')) {
      setUser(JSON.parse(sessionStorage.getItem('user')!));
    }
  };

  const login = (user: any, remember: boolean) => {
    setUser(user);
    if (remember) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      sessionStorage.setItem('user', JSON.stringify(user));
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const openNotificationWithIcon = (
    type: NotificationType,
    message: string,
    description: string
  ) => {
    api[type]({
      message,
      description,
    });
  };

  return (
    <div className="App">
      {contextHolder}
      <Header
        user={user}
        removeSession={logout}
        openNotification={openNotificationWithIcon}
      />
      <Routes>
        <Route
          element={
            <ProtectedRoutes
              user={user}
              openNotification={openNotificationWithIcon}
            />
          }
        >
          <Route index element={<Tickets user={user} />} />
          <Route path="/tickets" element={<Tickets user={user} />} />
          <Route path="/profile" element={<Profile userSession={user} setUser={setUser} />} />
        </Route>
        <Route
          element={
            <AdminRoutes
              user={user}
              openNotification={openNotificationWithIcon}
            />
          }
        >
          <Route path="/users" element={<Users user={user} />} />
        </Route>
        <Route
          element={
            <SessionRoutes
              user={user}
              openNotification={openNotificationWithIcon}
            />
          }
        >
          <Route
            path="/login"
            element={
              <Login
                user={user}
                setSession={login}
                openNotification={openNotificationWithIcon}
              />
            }
          />
          <Route
            path="/sign-up"
            element={<Signup user={user} setSession={login} />}
          />
        </Route>

        <Route path="*" element={<h1> 404 not found </h1>} />
      </Routes>
    </div>
  );
}

export default App;
