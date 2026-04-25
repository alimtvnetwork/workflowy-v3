import { Outlet } from "react-router-dom";

/**
 * AppLayout — top-level chrome wrapper.
 *
 * Phase-1 scaffold: currently a transparent passthrough so routes mount
 * inside a single layout boundary. Navbar, Sidebar, and panel slots will
 * land in P1.3 per `spec/31-app/01-features/03-layout-structure.md`.
 *
 * Wrapping all routes today means future chrome additions touch zero
 * route definitions.
 */
const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
    </div>
  );
};

export default AppLayout;
