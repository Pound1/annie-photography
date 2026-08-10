import styles from './Footer.module.css'

const CONTACT_EMAIL = 'apound45@gmail.com'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span className={styles.brand}>AP</span>
        <p>&copy; {year} Annierose Pound Photography</p>
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </div>
    </footer>
  )
}
