import styles from './About.module.css'

export default function About() {
  return (
    <section id="about" className={styles.section}>
      <div className={styles.photoWrap}>
        <div className={styles.decorativeCircle} />
        {/* Swap for: <img className={styles.photo} src="/about.jpg" alt="Annierose Pound" /> */}
        <div className={styles.photo} role="img" aria-label="Annierose Pound" />
      </div>
      <div className={styles.body}>
        <p className={styles.eyebrow}>About</p>
        <h2>Hi, I&apos;m Annierose</h2>
        <p>
          I&apos;m a photographer who loves capturing honest, unposed moments
          outdoors &mdash; the quiet ones and the joyful ones. I work with
          people who want photos that feel like them, and landscapes that
          feel like where they were taken.
        </p>
        <p>
          Most of my work happens outside, chasing good light across
          landscapes and portraits alike. If you&apos;re planning a shoot,
          let&apos;s talk about what you have in mind.
        </p>
      </div>
    </section>
  )
}
