import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route, Routes, createBrowserRouter, RouterProvider } from 'react-router-dom';


import Login from './(auth)/Login'
import Register from './(auth)/Register'
import Verification from './(auth)/Verification'
import Homepage from './(web)/Homepage'
import Profile from './(web)/Profile'
import Settings from './(web)/Settings'
import MyAccounts from './(web)/MyAccounts'
import Message from './(web)/Message'
import Students from './(web)/Students'
import Teachers from './(web)/Teachers'
import Notifications from './(web)/Notifications';

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <Login />,
//   },
//   {
//     path: "/register",
//     element: <Register />,
//   },
//   {
//     path: "/verification",
//     element: <Verification />,
//   },
//   {
//     path: "/profile",
//     element: <Profile />,
//   },
//   {
//     path: "/settings",
//     element: <Settings />,
//   },
//   {
//     path: "/homepage",
//     element: <Homepage />,
//   },
// ]);

const App: React.FC = () => {
  // const [id, setId] = useState(null);
  // const [token, setToken] = useState(null);
  // const [userType, setUserType] = useState(null);
  
  // useEffect(() => {
  //   const id = localStorage.getItem('id');
  //   if (id) {
  //     setId(id);
  //   }
  // }, []);

  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (token) {
  //     setToken(token);
  //   }
  // }, []);

  // useEffect(() => {
  //   const userType = localStorage.getItem('userType');
  //   if (userType) {
  //     setUserType(userType);
  //   }
  // }, []);


  return (
    <>
      {/* <RouterProvider router={router} /> */}
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/homepage" element={<Homepage />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/my-accounts" element={<MyAccounts />} />
          <Route path="/message" element={<Message />} />
          <Route path="/students" element={<Students />} />
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
