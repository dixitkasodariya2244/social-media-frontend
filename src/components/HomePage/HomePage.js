import React from 'react';
import Sidebar from './Sidebar';
import './HomePage.css'; // Add your custom styles here
import MainContent from './MainContent';

const HomePage = () => {
    return (
        <div className="homepage">
            <div className="content">
                <Sidebar />
                <MainContent />
            {/* <RightSidebar /> */}
            </div>
        </div>
    );
};

export default HomePage;
