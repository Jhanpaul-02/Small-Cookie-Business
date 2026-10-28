import cookiesPhoto from '../../assets/cookies-hero.jpg'
import './styles.css'

const products = [
  {
    id: 'cookies',
    name: 'Cookies',
    description: 'A box of freshly baked cookies, ready to share.',
    price: 200,
    style: 'cookies',
  },
  {
    id: 'crinkles',
    name: 'Crinkles',
    description: 'A box of soft, chocolatey crinkles.',
    price: 200,
    style: 'crinkles',
  },
  {
    id: 'smores',
    name: "S'mores Cookies",
    description: 'A sweet cookie box inspired by the campfire favorite.',
    price: 270,
    style: 'smores',
  },
]

function formatPrice(amount) {
  return `₱${amount.toLocaleString('en-PH')}`
}

export default function ShopPage({ boxQuantities, onQuantityChange }) {
  const selectedProducts = products.filter(
    (product) => (boxQuantities[product.id] ?? 0) > 0,
  )
  const totalBoxes = products.reduce(
    (total, product) => total + (boxQuantities[product.id] ?? 0),
    0,
  )
  const boxTotal = products.reduce(
    (total, product) =>
      total + product.price * (boxQuantities[product.id] ?? 0),
    0,
  )

  return (
    <section className="shop-page" id="cookies" aria-labelledby="shop-heading">
      <div className="shop-page__inner">
        <div className="shop-page__intro">
          <h2 id="shop-heading">A box of your favorites.</h2>
          <p>
            Mix, match, and make it yours. Every cookie is baked fresh for your
            order.
          </p>
        </div>

        <p className="shop-page__batch">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle
              cx="12"
              cy="12"
              r="8.5"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M12 7v5l3 2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Next batch: <strong>coming soon</strong></span>
        </p>
      </div>

      <div className="shop-page__content">
        <div className="shop-products" aria-label="Cookie boxes">
          {products.map((product) => {
            const quantity = boxQuantities[product.id] ?? 0

            return (
              <article className="shop-product" key={product.id}>
                <div className={`shop-product__visual shop-product__visual--${product.style}`}>
                  <img src={cookiesPhoto} alt="" />
                  <span>SMALL BATCH</span>
                </div>
                <div className="shop-product__details">
                  <h3>{product.name}</h3>
                  <p>{product.description}</p>
                  <div className="shop-product__purchase">
                    <div className="shop-product__price">
                      <strong>{formatPrice(product.price)}</strong>
                      <span>per box</span>
                    </div>
                    <div
                      className="shop-product__quantity"
                      role="group"
                      aria-label={`${product.name} box quantity`}
                    >
                      <button
                        type="button"
                        aria-label={`Remove one box of ${product.name}`}
                        onClick={() => onQuantityChange(product.id, -1)}
                        disabled={quantity === 0}
                      >
                        −
                      </button>
                      <span aria-live="polite">{quantity}</span>
                      <button
                        type="button"
                        aria-label={`Add one box of ${product.name}`}
                        onClick={() => onQuantityChange(product.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <aside className="cookie-box" aria-labelledby="cookie-box-heading">
          <div className="cookie-box__heading">
            <h3 id="cookie-box-heading">Your cookie box</h3>
            <span aria-live="polite">
              {totalBoxes} {totalBoxes === 1 ? 'box' : 'boxes'}
            </span>
          </div>
          {selectedProducts.length === 0 ? (
            <div className="cookie-box__empty">
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
              </svg>
              <strong>Your box is waiting.</strong>
              <p>Your selected boxes will appear here.</p>
            </div>
          ) : (
            <div className="cookie-box__items" aria-live="polite">
              {selectedProducts.map((product) => {
                const quantity = boxQuantities[product.id] ?? 0

                return (
                  <div className="cookie-box__item" key={product.id}>
                    <div>
                      <strong>{product.name}</strong>
                      <small>
                        {quantity} {quantity === 1 ? 'box' : 'boxes'} ×{' '}
                        {formatPrice(product.price)} per box
                      </small>
                    </div>
                    <strong>{formatPrice(product.price * quantity)}</strong>
                  </div>
                )
              })}
            </div>
          )}
          <div className="cookie-box__total" aria-live="polite">
            <span>Box total</span>
            <strong>{formatPrice(boxTotal)}</strong>
          </div>
          <p className="cookie-box__note">All products are sold by the box.</p>
        </aside>
      </div>
    </section>
  )
}
