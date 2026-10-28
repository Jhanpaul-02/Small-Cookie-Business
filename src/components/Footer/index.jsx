import './styles.css'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <a
          className="footer-brand"
          href="#home"
          aria-label="Khaleb's Cookies home"
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20.1 13.2A8.4 8.4 0 1 1 10.8 3.9a3.2 3.2 0 0 0 9.3 9.3Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="8.3" cy="8.7" r="1" fill="currentColor" />
            <circle cx="6.8" cy="13.4" r="0.8" fill="currentColor" />
            <circle cx="12.1" cy="16.5" r="0.9" fill="currentColor" />
          </svg>
          <span>
            <strong>Khaleb's Cookies</strong>
            <small>SMALL BATCH. BIG HEART.</small>
          </span>
        </a>

        <div className="footer-contact">
          <span>your-email@example.com</span>
          <p>Questions, celebrations, or just saying hello.</p>
        </div>

        <div className="footer-meta">
          <div className="footer-links">
            <span>Instagram</span>
            <span aria-hidden="true">·</span>
            <span>FAQs</span>
            <span aria-hidden="true">·</span>
            <span>Order policy</span>
          </div>
          <p>© {currentYear} Khaleb's Cookies. Baked with love.</p>
        </div>
      </div>
    </footer>
  )
}
