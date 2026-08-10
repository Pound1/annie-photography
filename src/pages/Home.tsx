import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import About from '../components/About'

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <section className="container" style={{ paddingBottom: 'var(--space-6)', textAlign: 'center' }}>
        <h2>See the work</h2>
        <p>Browse albums of landscapes, portraits, and nature.</p>
        <Link className="btn btn-secondary" to="/gallery">
          View the gallery
        </Link>
      </section>
    </>
  )
}
