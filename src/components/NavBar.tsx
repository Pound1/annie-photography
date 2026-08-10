import { NavLink } from 'react-router-dom'
import styles from './NavBar.module.css'

const links = [
  { to: '/', label: 'About', end: true },
  { to: '/gallery', label: 'Albums' },
  { to: '/contact', label: 'Contact' },
]

export default function NavBar() {
  return (
    <header className={styles.nav}>
      <div className={`container ${styles.inner}`}>
        <NavLink to="/" className={styles.brand}>
          AP
        </NavLink>
        <nav>
          <ul className={styles.links}>
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    isActive ? styles.linkActive : undefined
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
