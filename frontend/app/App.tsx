import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./(auth)/Login";
import Register from "./(auth)/Register";
import Verification from "./(auth)/Verification";
import Homepage from "./(web)/Homepage";
import Profile from "./(web)/Profile";
import EditProfile from "./(web)/EditProfile";
import Settings from "./(web)/Settings";
import MyAccounts from "./(web)/MyAccounts";
import MessageScreen from "./(web)/Message";
import Students from "./(web)/Students";
import Teachers from "./(web)/Teachers";
import Notifications from "./(web)/Notifications";
import ViewMatches from "./(web)/ViewMatches";
import SheetMusic from "./(web)/SheetMusic";
import VideoWeb from './(web)/Video';
import Tasks from "./(web)/Tasks";

const App: React.FC = () => {

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
            <Route path="/edit-profile/:id" element={<EditProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/my-accounts" element={<MyAccounts />} />
            <Route path="/message" element={<MessageScreen />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/viewmatches/:id" element={<ViewMatches />} />
            <Route path="/video/:id/:fileId" element={<VideoWeb />} />
            <Route path="/sheet-music" element={<SheetMusic />} />
            <Route path="/tasks" element={<Tasks />} />
          </Routes>
        </Router>
    </>
  );
};

export default App;
