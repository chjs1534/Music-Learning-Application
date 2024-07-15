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
  const [id, setId] = useState(null);
  const [token, setToken] = useState(null);
  
  useEffect(() => {
    const id = localStorage.getItem('id');
    if (id) {
      setId(id);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
    }
  }, []);


  return (
    <>
      {/* <RouterProvider router={router} /> */}
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setId={setId} />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/homepage" element={<Homepage id={id} token2={token} />} />
          <Route path="/profile/:id" element={<Profile token={token} />} />
          <Route path="/settings" element={<Settings id={id} token={token}/>} />
          <Route path="/my-accounts" element={<MyAccounts id={id} token={token} />} />
          <Route path="/message" element={<Message id={id} token={token} />} />
          <Route path="/students" element={<Students id={id} token={token} />} />
          <Route path="/teachers" element={<Teachers id={id} token={token}/>} />
          <Route path="/notifications" element={<Notifications id={id} token={token}/>} />
        </Routes>
      </Router>
    </>
  )
}

export default App
