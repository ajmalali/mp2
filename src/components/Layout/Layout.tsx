import { Link, NavLink, Outlet } from "react-router";
import { useData } from "../../data/DataContext";
import { useScrollMemory } from "../../hooks/useScrollMemory";
import SpaceBackground from "../SpaceBackground/SpaceBackground";
import LoadingState from "../LoadingState/LoadingState";
import ErrorState from "../ErrorState/ErrorState";
import logoUrl from "../../assets/rick-and-morty-logo.svg";
import styles from "./Layout.module.css";

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;

export default function Layout() {
  const { status, error, staleSince, reload } = useData();
  useScrollMemory();

  return (
    <>
      <SpaceBackground />
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link
              to="/search"
              className={styles.brand}
              aria-label="Rick and Morty Explorer home"
            >
              <img
                className={styles.logo}
                src={logoUrl}
                alt="Rick and Morty"
                width={170}
                height={52}
              />
              <span className={styles.brandSub}>Explorer</span>
            </Link>
            <nav className={styles.nav} aria-label="Main">
              <NavLink to="/search" className={navClass}>
                Search
              </NavLink>
              <NavLink to="/gallery" className={navClass}>
                Gallery
              </NavLink>
            </nav>
          </div>
          <span className={styles.slime} aria-hidden="true" />
        </header>

        {staleSince !== null && (
          <div className={styles.banner} role="status">
            The API could not be reached, so you are seeing data cached on{" "}
            {new Date(staleSince).toLocaleString()}.
            <button
              type="button"
              className={styles.bannerButton}
              onClick={reload}
            >
              Try again
            </button>
          </div>
        )}

        <main className={styles.main}>
          {status === "loading" && (
            <LoadingState message="Opening a portal to the Rick and Morty API…" />
          )}
          {status === "error" && (
            <ErrorState
              message={error ?? "Something went wrong."}
              onRetry={reload}
            />
          )}
          {status === "ready" && <Outlet />}
        </main>

        <footer className={styles.footer}>
          <p>
            Data from{" "}
            <a
              href="https://rickandmortyapi.com/"
              target="_blank"
              rel="noreferrer"
            >
              The Rick and Morty API
            </a>
          </p>
          <p className={styles.legal}>
            Rick and Morty and its logo are trademarks of Adult Swim / Cartoon
            Network.
          </p>
        </footer>
      </div>
    </>
  );
}
