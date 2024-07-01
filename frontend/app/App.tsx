import React from 'react'
import { BrowserRouter, BrowserRouter as Router } from 'react-router-dom'
import PageList from "./PageList"

const App: React.FC = () => {
  return (
    <>
        <BrowserRouter>
            <PageList />
        </BrowserRouter>
    </>
  )
}

export default App
