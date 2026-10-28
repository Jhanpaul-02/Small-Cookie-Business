import './styles.css'

export default function NavBar({ boxCount = 0 }) {
  return (
    <>
      <div className="announcement-bar">
        <span>A little joy, baked fresh.</span>
        <span aria-hidden="true">•</span>
        <span>Small batches, made with care</span>
      </div>

      <header className="site-header">
        <div className="site-header__inner">
          <a className="brand" href="#home" aria-label="Khaleb's Cookies home">
            <svg className="brand__icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
            <span className="brand__copy">
              <strong>Khaleb's Cookies</strong>
              <small>SMALL BATCH. BIG HEART.</small>
            </span>
          </a>

          <nav className="site-nav" aria-label="Main navigation">
            <a className="site-nav__link" href="#cookies">
              Shop cookies
            </a>
            <a className="site-nav__link" href="#how-to-order">How to order</a>
          </nav>

          <div className="cart-indicator">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 8.5h14l1 11H4l1-11Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path
                d="M9 8.5V6a3 3 0 0 1 6 0v2.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M10 12.5h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <span>Your box · {boxCount}</span>
          </div>
        </div>
      </header>
    </>
  )
}
