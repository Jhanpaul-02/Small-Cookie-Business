import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Admin from './page/Admin'
import NavBar from './components/NavBar'
import Homepage from './components/Homepage'
import Footer from './components/Footer'
import ShopPage from './page/Shop page'
import HowToOrder from './components/HowToOrder'

function App() {
  const [boxQuantities, setBoxQuantities] = useState({})
  const boxCount = Object.values(boxQuantities).reduce(
    (total, quantity) => total + quantity,
    0,
  )

  function handleQuantityChange(productId, change) {
    setBoxQuantities((currentQuantities) => ({
      ...currentQuantities,
      [productId]: Math.max(0, (currentQuantities[productId] ?? 0) + change),
    }))
  }

    return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <NavBar boxCount={boxCount} />
              <Homepage />
              <ShopPage
                boxQuantities={boxQuantities}
                onQuantityChange={handleQuantityChange}
              />
              <HowToOrder />
              <Footer />
            </>
          }
        />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
