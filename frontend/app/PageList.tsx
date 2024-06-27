import React from 'react'
import { Routes, Route, useNavigate } from "react-router-dom"

import Login from './(auth)/Login'
import Register from './(auth)/Register.web'

const PageList = () => {
  return (
    <>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    </>
  )
}

export default PageList
