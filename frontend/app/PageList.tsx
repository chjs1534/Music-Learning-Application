import React from 'react'
import { Routes, Route, useNavigate } from "react-router-dom"

import Login from './(auth)/Login'
import Register from './(auth)/Register'
import Verification from './(auth)/Verification'
import Homepage from './(web)/Homepage'

const PageList = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/homepage" element={<Homepage />} />
      </Routes>
    </>
  )
}

export default PageList
