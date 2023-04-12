import { Link, NavLink } from 'react-router-dom';
import styles from './Header.module.css';

const Header = ({ user, removeSession, openNotification }: any) => {
  return (
    <nav className={styles.header}>
      <Link to="/">
        <h2>Tickets App</h2>
      </Link>
      <ul>
        {user ? (
          <>
            <li>
              <NavLink to="/tickets">Tickets</NavLink>
            </li>
            {user.user.rol.includes('admin') && (
              <li>
                <NavLink to="/users">Users</NavLink>
              </li>
            )}
            <li>
              <NavLink to="/profile">Profile</NavLink>
            </li>
            <li>
              <Link
                to="/login"
                onClick={() => {
                  openNotification(
                    'success',
                    'Logout success',
                    'See you soon!'
                  );
                  removeSession();
                }}
              >
                Logout
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/login">Login</NavLink>
            </li>
            <li>
              <NavLink to="/sign-up">Sign up</NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Header;
