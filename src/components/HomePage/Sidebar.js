import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Avatar, Button, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import './Sidebar.css'; // Updated CSS file for Sidebar styles

const Sidebar = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                console.error('No token found');
                return;
            }

            try {
                const response = await axios.get(`http://localhost:8080/${id}/home`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUserData();
        } else {
            console.error('No ID found in URL');
        }
    }, [id]);

    const handleUploadPost = () => {
        navigate('/uploading-post');
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Typography variant="h6" align="center">User not found</Typography>;
    }

    return (
        <div className="sidebar">
            <Card className="sidebar-card" sx={{ border: '2px solid #FFD700' }}> {/* Added border style here */}
                <CardContent className="card-content">
                    <Avatar alt={user.name} src="profile-image.jpg" className="avatar" />
                    <Typography variant="h5" align="center" className="username">{user.name}</Typography>
                    <Typography variant="body2" color="text.secondary" align="center" className="user-details">
                        {user.age} years old, {user.gender}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" className="user-follow-stats">
                        Following: {user.following.length} | Followers: {user.followers.length}
                    </Typography>
                    <Button
                        variant="contained"
                        className="view-profile-button"
                        onClick={() => navigate(`/${user.id}/profile`)}
                    >
                        View Profile
                    </Button>
                    <Button
                        variant="contained"
                        className="upload-post-button"
                        onClick={handleUploadPost}
                    >
                        Upload Post
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Sidebar;
