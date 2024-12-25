import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginSignup from './pages/LoginSignup';
import ChatPage from './pages/ChatPage';

function App() {
    const [userDetails, setUserDetails] = useState(null);

    return (
        <Router>
            <Routes>
                {/* Login/Signup Page */}
                <Route
                    path="/"
                    element={
                        userDetails ? (
                            <Navigate to="/chat" />
                        ) : (
                            <LoginSignup setUserDetails={setUserDetails} />
                        )
                    }
                />
                {/* Chat Page */}
                <Route
                    path="/chat"
                    element={
                        userDetails ? (
                            <ChatPage userDetails={userDetails} />
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;