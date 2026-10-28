import cookiesHero from '../../assets/cookies-hero.jpg'
import './styles.css'

export default function Homepage() {
  return (
    <main className="homepage">
      <section className="home-hero" id="home">
        <div className="home-hero__copy">
          <p className="home-hero__eyebrow">YOUR NEIGHBORHOOD COOKIE FIX</p>
          <h1>
            Good days start
            <br />
            with warm cookies.
          </h1>
          <p className="home-hero__description">
            Golden edges. Soft centers. The good butter. Handcrafted in small
            batches, ready to make your everyday a little sweeter.
          </p>

          <div className="home-hero__actions">
            <a className="home-hero__button" href="#cookies">
              Build your box
              <span aria-hidden="true">↓</span>
            </a>
            <span className="home-hero__aside">Baked with care, always.</span>
          </div>

          <div className="home-hero__note">
            <span aria-hidden="true">✦</span>
            Small batches, made to brighten your day.
          </div>
        </div>

        <div className="home-hero__photo">
          <img
            src={cookiesHero}
            alt="Golden chocolate chunk cookies on parchment"
          />
          <div className="home-hero__badge">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M20.8 8.8c0 5-8.8 10-8.8 10s-8.8-5-8.8-10a4.7 4.7 0 0 1 8.8-2.3 4.7 4.7 0 0 1 8.8 2.3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>
              <strong>Made by hand. With love.</strong>
              <small>Small batches, baked fresh.</small>
            </span>
          </div>
        </div>
      </section>
    </main>
  )
}
