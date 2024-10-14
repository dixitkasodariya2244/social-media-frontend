import React from 'react';
import Sidebar from './Sidebar';
// import MainContent from './MainContent';
// import RightSidebar from './RightSidebar';
import './Dashboard.css'; // Add your custom styles here

const Dashboard = () => {
    return (
        <div className="dashboard">
            <Sidebar />
            {/* <MainContent /> */}
            {/* <RightSidebar /> */}
        </div>
    );
};

export default Dashboard;
