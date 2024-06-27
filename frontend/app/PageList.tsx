import React from 'react'
import { Routes, Route } from "react-router-dom"

import Login from './(auth)/Login'
import Register from './(auth)/Register'
import Verification from './(auth)/Verification'
import Homepage from './(web)/Homepage'
import Profile from './(web)/Profile'
import Settings from './(web)/Settings'

const PageList = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  )
}

export default PageList
