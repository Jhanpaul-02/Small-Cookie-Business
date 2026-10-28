import './styles.css'

const steps = [
  {
    number: '01',
    title: 'Choose your cookies',
    description: 'Pick the boxes you want and adjust the quantity with + and −.',
  },
  {
    number: '02',
    title: 'Check your box',
    description: 'Review your selected boxes and the total in Your cookie box.',
  },
  {
    number: '03',
    title: 'Click checkout',
    description: 'When everything looks right, continue from checkout.',
  },
  {
    number: '04',
    title: 'Proceed to payment',
    description: 'Follow the payment instructions to complete your order.',
  },
]

export default function HowToOrder() {
  return (
    <section
      className="how-to-order"
      id="how-to-order"
      aria-labelledby="how-to-order-heading"
    >
      <div className="how-to-order__inner">
        <div className="how-to-order__heading">
          <p className="how-to-order__eyebrow">HOW TO ORDER</p>
          <h2 id="how-to-order-heading">A few simple steps to cookie time.</h2>
          <p>Choose your boxes, check your order, and follow the steps to pay.</p>
        </div>

        <ol className="how-to-order__steps">
          {steps.map((step) => (
            <li className="how-to-order__step" key={step.number}>
              <span className="how-to-order__number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>

        <a className="how-to-order__button" href="#cookies">
          Choose your cookies <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  )
}
