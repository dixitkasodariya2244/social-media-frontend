import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Typography, Card, CardContent, Avatar, Grid, Button, Box } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ProfilePage.css'; // Ensure you have this CSS file for styles

const ProfilePage = () => {
    const { id } = useParams(); // The ID of the user whose profile is being viewed
    const [user, setUser] = useState(null); // Data of the user being viewed
    const [isOwnProfile, setIsOwnProfile] = useState(false); // Check if the profile is the logged-in user's own profile
    const [isFriend, setIsFriend] = useState(false); // Check if the viewed user is already a friend
    const [isFriendRequestPending, setIsFriendRequestPending] = useState(false); // Check if a friend request is pending

    useEffect(() => {
        const token = localStorage.getItem('token');
        const loggedUserId = localStorage.getItem('userId');

        if (!token) {
            console.error('No token found');
            toast.error('No token found. Please log in again.', { containerId: 'profilePage' });
            return;
        }

        const fetchUserData = async () => {
            try {
                // Fetch the user being viewed
                const [profileResponse, loggedUserResponse] = await Promise.all([
                    axios.get(`http://localhost:8080/${id}/profile`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }),
                    axios.get(`http://localhost:8080/${loggedUserId}/profile`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    })
                ]);

                const viewedUser = profileResponse.data;
                const loggedInUser = loggedUserResponse.data;

                setUser(viewedUser);
                setIsOwnProfile(viewedUser.id === parseInt(loggedUserId)); // Check if it's the user's own profile

                // Check if the viewed user is already a friend
                const isAlreadyFriend = loggedInUser.friends.some(friend => friend.id === viewedUser.id);
                setIsFriend(isAlreadyFriend);

                // Check if there is a pending friend request to the viewed user
                const isRequestPending = loggedInUser.pendingFriendRequests.some(request => request.id === viewedUser.id);
                setIsFriendRequestPending(isRequestPending);

                toast.success('User data loaded successfully.', { containerId: 'profilePage' });
            } catch (error) {
                console.error('Error fetching user data:', error.message);
                toast.error('Error fetching user data.', { containerId: 'profilePage' });
            }
        };

        if (id) {
            fetchUserData();
        } else {
            console.error('No ID found in URL');
            toast.error('No ID found in URL.', { containerId: 'profilePage' });
        }
    }, [id]);

    const handleSendFriendRequest = async () => {
        const token = localStorage.getItem('token');
        const loggedUserId = localStorage.getItem('userId');
        try {
            await axios.post(`http://localhost:8080/${loggedUserId}/friend-request/${user.id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success('Friend request sent!');
            setIsFriendRequestPending(true); // Update state to reflect that a request is pending
        } catch (error) {
            console.error('Error sending friend request:', error.message);
            toast.error('Failed to send friend request.');
        }
    };

    const handleFollowUser = async () => {
        const token = localStorage.getItem('token');
        const loggedUserId = localStorage.getItem('userId');

        try {
            // Use the follow request endpoint
            await axios.post(`http://localhost:8080/${loggedUserId}/follow-request/${user.id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success('Follow request sent successfully!');
        } catch (error) {
            console.error('Error sending follow request:', error.message);
            toast.error('Failed to send follow request.');
        }
    };

    if (!user) {
        return <Typography variant="h6">Loading...</Typography>;
    }

    return (
        <Box sx={{ backgroundColor: '#1E1E1E', padding: 2, minHeight: '100vh' }}>
            <Card sx={{ backgroundColor: '#2E2E2E', padding: 3, margin: 2, borderRadius: 2, boxShadow: 3 }}>
                <CardContent>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4} textAlign="center">
                            <Avatar alt={user.name} src="profile-image.jpg" sx={{ width: 120, height: 120, margin: '0 auto', border: '2px solid #FFD700' }} />
                        </Grid>
                        <Grid item xs={12} sm={8}>
                            <Typography variant="h4" sx={{ color: '#FFD700' }}>{user.name}</Typography>
                            <Typography variant="body1" sx={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                                <CalendarTodayIcon sx={{ marginRight: 1 }} />
                                {user.age} years old, {user.gender}
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                                <EmailIcon sx={{ marginRight: 1 }} />
                                Email: {user.email}
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'white', display: 'flex', alignItems: 'center' }}>
                                <PeopleIcon sx={{ marginRight: 1 }} />
                                Following: {user.following.length} | Followers: {user.followers.length}
                            </Typography>

                            {/* Conditional rendering of buttons */}
                            {!isOwnProfile && (
                                <div>
                                    {/* Only show the "Send Friend Request" button if the users are not friends and no request is pending */}
                                    {!isFriend && !isFriendRequestPending && (
                                        <Button variant="contained" onClick={handleSendFriendRequest} sx={{ margin: 1, backgroundColor: '#FFD700', color: '#1E1E1E', '&:hover': { backgroundColor: '#FFC107' } }}>
                                            Send Friend Request
                                        </Button>
                                    )}
                                    {/* Always show the "Follow" button */}
                                    <Button variant="contained" onClick={handleFollowUser} sx={{ margin: 1, backgroundColor: '#FFD700', color: '#1E1E1E', '&:hover': { backgroundColor: '#FFC107' } }}>
                                        Follow
                                    </Button>
                                </div>
                            )}

                            {/* If user is already a friend, display a different message */}
                            {isFriend && (
                                <Typography variant="body1" color="text.primary" sx={{ marginTop: 2 }}>
                                    You are friends with this user.
                                </Typography>
                            )}

                            {/* If a friend request is pending, show a different message */}
                            {isFriendRequestPending && !isFriend && (
                                <Typography variant="body1" color="text.secondary" sx={{ marginTop: 2 }}>
                                    Friend request pending.
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
            <ToastContainer containerId="profilePage" />
        </Box>
    );
};

export default ProfilePage;
