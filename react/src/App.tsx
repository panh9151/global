import { useState } from 'react'
import Routing from './Routing'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Routing />
  )
}

export default App
