import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    TextField,
    Box,
    Badge,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Button,
    Divider
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Header = ({ userId }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
    const [friendRequests, setFriendRequests] = useState([]);
    const [followRequests, setFollowRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [friendsAnchorEl, setFriendsAnchorEl] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchFriendRequests = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/${userId}/friend-requests`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setFriendRequests(response.data);
            } catch (error) {
                console.error('Error fetching friend requests', error);
            }
        };

        const fetchFollowRequests = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/${userId}/follow-requests`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setFollowRequests(response.data);
            } catch (error) {
                console.error('Error fetching follow requests', error);
            }
        };

        fetchFriendRequests();
        fetchFollowRequests();
    }, [userId, token]);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNavigation = (path) => {
        navigate(path);
        handleMenuClose();
        toast.info(`Navigating to ${path}`);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        navigate('/login');
        toast.success('Logged out successfully!');
    };

    const handleSearch = async (e) => {
        setSearchQuery(e.target.value);

        if (e.target.value.length >= 3) {
            try {
                const response = await axios.get(`http://localhost:8080/search?name=${e.target.value}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setSearchResults(response.data || []);
            } catch (error) {
                console.error('Failed to search users', error);
                toast.error('Failed to search users');
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleProfileClick = (userId) => {
        navigate(`/${userId}/profile`);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleNotificationsClick = (event) => {
        setNotificationsAnchorEl(event.currentTarget);
    };

    const handleNotificationsClose = () => {
        setNotificationsAnchorEl(null);
    };

    const handleFriendRequestAction = async (requestId, action) => {
        try {
            const url = `http://localhost:8080/friend-requests/${requestId}/${action}`;
            await axios.post(url, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success(`Friend request ${action}ed.`);
            setFriendRequests(friendRequests.filter(request => request.id !== requestId));
        } catch (error) {
            console.error(`Failed to ${action} friend request`, error);
            toast.error(`Failed to ${action} friend request`);
        }
    };

    const handleFollowRequestAction = async (requestId, action) => {
        try {
            const url = `http://localhost:8080/follow-requests/${requestId}/${action}`;
            await axios.post(url, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success(`Follow request ${action}ed.`);
            setFollowRequests(followRequests.filter(request => request.id !== requestId));
        } catch (error) {
            console.error(`Failed to ${action} follow request`, error);
            toast.error(`Failed to ${action} follow request`);
        }
    };

    const handleFriendsClick = async (event) => {
        setFriendsAnchorEl(event.currentTarget);
        try {
            const response = await axios.get(`http://localhost:8080/${userId}/friends`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setFriends(response.data);
        } catch (error) {
            console.error('Failed to fetch friends', error);
            toast.error('Failed to fetch friends');
        }
    };

    const handleFriendsClose = () => {
        setFriendsAnchorEl(null);
    };

    return (
        <AppBar position="static" sx={{ backgroundColor: '#2E2E2E', color: '#FFD700' }}>
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1, fontFamily: 'Montserrat', fontWeight: 'bold' }}>
                    MyApp
                </Typography>
                <Box sx={{  flexGrow: 1, position: 'relative' }}>
                    <TextField
                        size="small"
                        variant="outlined"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={handleSearch}
                        sx={{ border: '2px solid #FFD700', backgroundColor: '#3A3A3A', borderRadius: 1, color: '#E0E0E0', input: { color: '#FFD700' } }}
                    />
                    {searchResults.length > 0 && (
                        <Box sx={{
                            position: 'absolute',
                            backgroundColor: '#2E2E2E',
                            zIndex: 1,
                            boxShadow: 2,
                            mt: 1,
                            width: '300px',
                            borderRadius: 1,
                            padding: '4px 0',
                            color: '#E0E0E0'
                        }}>
                            {searchResults.map((user) => (
                                <MenuItem key={user.id} onClick={() => handleProfileClick(user.id)} sx={{ color: '#E0E0E0' }}>
                                    {user.name}
                                </MenuItem>
                            ))}
                        </Box>
                    )}
                </Box>
                <Tooltip title="Home">
                    <IconButton color="inherit" onClick={() => handleNavigation(`/${userId}/home`)}>
                        <HomeIcon sx={{ color: '#FFD700' }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Profile">
                    <IconButton color="inherit" onClick={() => handleNavigation(`/${userId}/profile`)}>
                        <PersonIcon sx={{ color: '#FFD700' }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Friends">
                    <IconButton color="inherit" onClick={handleFriendsClick}>
                        <GroupIcon sx={{ color: '#FFD700' }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Notifications">
                    <IconButton color="inherit" onClick={handleNotificationsClick}>
                        <Badge badgeContent={friendRequests.length + followRequests.length} color="secondary">
                            <NotificationsIcon sx={{ color: '#FFD700' }} />
                        </Badge>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Logout">
                    <IconButton color="inherit" onClick={handleLogout}>
                        <LogoutIcon sx={{ color: '#FFD700' }} />
                    </IconButton>
                </Tooltip>

                {/* Friends List */}
                <Menu
                    anchorEl={friendsAnchorEl}
                    open={Boolean(friendsAnchorEl)}
                    onClose={handleFriendsClose}
                    
                >
                    {friends.length === 0 ? (
                        <MenuItem sx={{ color: '#E0E0E0' }}>No friends found</MenuItem>
                    ) : (
                        <List sx={{ width: '300px' }}>
                            {friends.map((friend) => (
                                <React.Fragment key={friend.id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemAvatar>
                                            <Avatar sx={{ backgroundColor: '#FFD700', color: '#1E1E1E' }}>
                                                {friend.name ? friend.name[0] : ''}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={friend.name}
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="body2" color="#FFD700">
                                                        {friend.email}
                                                    </Typography>
                                                    {` - ${friend.phone}`}
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    <Divider component="li" sx={{ borderColor: '#3A3A3A' }} />
                                </React.Fragment>
                            ))}
                        </List>
                    )}
                </Menu>

                {/* Notifications Menu */}
                <Menu
                    anchorEl={notificationsAnchorEl}
                    open={Boolean(notificationsAnchorEl)}
                    onClose={handleNotificationsClose}
                    
                >
                    <MenuItem disabled sx={{ color: '#FFD700',backgroundColor: '#2E2E2E' }}>
                        Friend Requests
                    </MenuItem>
                    {friendRequests.length > 0 ? (
                        friendRequests.map((request) => (
                            <MenuItem key={request.id}>
                                <Typography sx={{ color: '#E0E0E0',backgroundColor: '#2E2E2E' }}>{request.name}</Typography>
                                <Button
                                    size="small"
                                    color="primary"
                                    onClick={() => handleFriendRequestAction(request.id, 'accept')}
                                >
                                    <CheckCircle fontSize="small" />
                                </Button>
                                <Button
                                    size="small"
                                    color="secondary"
                                    onClick={() => handleFriendRequestAction(request.id, 'reject')}
                                >
                                    <Cancel fontSize="small" />
                                </Button>
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem sx={{ color: '#E0E0E0',backgroundColor: '#2E2E2E' }}>No friend requests</MenuItem>
                    )}

                    <MenuItem disabled sx={{ color: '#FFD700',backgroundColor: '#2E2E2E' }}>
                        Follow Requests
                    </MenuItem>
                    {followRequests.length > 0 ? (
                        followRequests.map((request) => (
                            <MenuItem key={request.id}>
                                <Typography sx={{ color: '#E0E0E0',backgroundColor: '#2E2E2E' }}>{request.name}</Typography>
                                <Button
                                    size="small"
                                    color="primary"
                                    onClick={() => handleFollowRequestAction(request.id, 'accept')}
                                >
                                    <CheckCircle fontSize="small" />
                                </Button>
                                <Button
                                    size="small"
                                    color="secondary"
                                    onClick={() => handleFollowRequestAction(request.id, 'reject')}
                                >
                                    <Cancel fontSize="small" />
                                </Button>
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem sx={{ color: '#E0E0E0',backgroundColor: '#2E2E2E'}}>No follow requests</MenuItem>
                    )}
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
