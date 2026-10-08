import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Home, About } from './pages'
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About  />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App