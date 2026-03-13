import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__logo">
          <Link to="/admin" className="logo" style={{ textDecoration: "none" }}>
            <span className="logo__lp">Logic</span>
            <span className="logo__pro">Pro</span>
            <span className="logo__dot" />
          </Link>
        </div>
        <nav className="admin__nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              "admin__nav-item" + (isActive ? " active" : "")
            }
          >
            Nemovitosti
          </NavLink>
          <NavLink
            to="/admin/inzerat/novy"
            className={({ isActive }) =>
              "admin__nav-item" + (isActive ? " active" : "")
            }
          >
            Novy inzerat
          </NavLink>
          <NavLink
            to="/admin/poptavky"
            className={({ isActive }) =>
              "admin__nav-item" + (isActive ? " active" : "")
            }
          >
            Poptavky
          </NavLink>
          <div className="admin__nav-divider" />
          <a href="/" className="admin__nav-item">
            Zpet na web
          </a>
        </nav>
        <div className="admin__nav-bottom">
          <button
            type="button"
            className="admin__nav-item"
            onClick={handleSignOut}
          >
            Odhlasit se
          </button>
        </div>
      </aside>
      <main className="admin__content">
        <Outlet />
      </main>
    </div>
  );
}
