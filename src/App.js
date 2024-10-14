import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './components/Login and Registration Page/LoginPage';
import RegistrationPage from './components/Login and Registration Page/RegistrationPage';
import HomePage from './components/HomePage/HomePage';  // Create this component
import withAuth from './components/withAuth ';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProfilePage from './components/HomePage/ProfilePage';
import Header from './components/HomePage/Header';
import UploadingPostPage from './components/HomePage/UploadingPostPage';


function App() {
    // const [user, setUser] = useState(null);
    const AuthenticatedHomePage = withAuth(HomePage); 
    const location = useLocation();
    const isAuthenticated = !!localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    const hideHeaderRoutes = ['/login', '/register'];
    
    return (
        <div>
            {!hideHeaderRoutes.includes(location.pathname) && isAuthenticated && <Header userId={userId}/>}
            <ToastContainer />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegistrationPage />} />
                {/* <Route path="/home" element={withAuth(HomePage)} /> */}
                <Route path="/:id/home" element={<AuthenticatedHomePage />} />
                <Route path="/:id/profile" element={<ProfilePage />} />
                <Route path="/uploading-post" element={<UploadingPostPage />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </div>
    );
}

export default App;
