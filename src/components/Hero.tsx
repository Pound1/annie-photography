import { Link } from 'react-router-dom'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.section}>
      <div className={styles.hero}>
        {/* Swap for: <img className={styles.heroImage} src="/hero.jpg" alt="" /> */}
        <div className={styles.scrim} />
        <div className={styles.heroText}>
          <h1>Annierose Pound Photography</h1>
          <p>Natural in nature &mdash; landscapes &amp; portraits with love</p>
          <div style={{ marginTop: '26px' }}>
            <Link className="btn btn-primary" to="/contact">
              Get In Touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
