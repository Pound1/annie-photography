import { useState, type FormEvent } from 'react'
import styles from './Contact.module.css'

const DEFAULT_SUBJECT = 'New photography enquiry'
const DEFAULT_MESSAGE = `Hi Annie,

I'm interested in a [wedding / portrait / landscape] shoot, roughly around [date] near [location].

A bit about what I'm after:
-

Looking forward to hearing from you!`

function encode(data: Record<string, string>) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
    .join('&')
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function Contact() {
  const [status, setStatus] = useState<Status>('idle')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState(DEFAULT_SUBJECT)
  const [message, setMessage] = useState(DEFAULT_MESSAGE)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({
          'form-name': 'contact',
          name,
          email,
          subject,
          message,
        }),
      })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className={`container ${styles.wrap}`}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Contact</p>
          <h1>Thanks for reaching out</h1>
          <p>Annie will get back to you as soon as she can.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`container ${styles.wrap}`}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Contact</p>
        <h1>Let&apos;s work together</h1>
        <p>Interested in booking a session? Edit the template below and send it over.</p>
      </div>

      <form
        name="contact"
        data-netlify="true"
        data-netlify-honeypot="bot-field"
        onSubmit={handleSubmit}
      >
        <input type="hidden" name="form-name" value="contact" />
        <p hidden>
          <label>
            Don&apos;t fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" />
          </label>
        </p>

        <div className={styles.field}>
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Your email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="subject">Subject</label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div className={styles.submitRow}>
          <button className="btn btn-primary" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
        </div>

        {status === 'error' && (
          <p className={`${styles.status} ${styles.statusError}`}>
            Something went wrong &mdash; please try again, or email directly.
          </p>
        )}
      </form>
    </div>
  )
}
