import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';

const MainContent = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageUrls, setImageUrls] = useState({});  // Store the blob URLs for each post
    const [userDetails, setUserDetails] = useState(null); // Store user details
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    // Reaction type to emoji mapping
    const reactionEmojis = {
        LIKE: '👍',
        LOVE: '❤️',
        HAHA: '😂',
        WOW: '😮',
        SAD: '😢',
        ANGRY: '😠'
    };

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/${userId}/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUserDetails(response.data);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        const fetchUserReaction = async (postId) => {
            try {
                const reactionResponse = await axios.get(`http://localhost:8080/reactions/${userId}/${postId}/user-reaction`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                return reactionResponse.data ? reactionResponse.data.type : null; // Return the reaction type or null
            } catch (error) {
                console.error(`Error fetching user reaction for post ${postId}:`, error);
                return null;
            }
        };

        const fetchUserPostsAndRelations = async () => {
            try {
                const userPostsResponse = await axios.get(`http://localhost:8080/${userId}/post`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                let { statusUpdates: userPosts } = userPostsResponse.data;
                userPosts = userPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                const followingResponse = await axios.get(`http://localhost:8080/${userId}/following`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const following = followingResponse.data;

                const followersResponse = await axios.get(`http://localhost:8080/${userId}/followers`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const followers = followersResponse.data;

                const relatedPosts = [];

                following.forEach(user => {
                    user.statusUpdates.forEach(post => {
                        post.user = user;
                        relatedPosts.push(post);
                    });
                });

                followers.forEach(user => {
                    user.statusUpdates.forEach(post => {
                        post.user = user;
                        relatedPosts.push(post);
                    });
                });

                const combinedPosts = [...userPosts, ...relatedPosts];
                combinedPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                // Fetch reactions for each post
                const postsWithReactions = await Promise.all(combinedPosts.map(async (post) => {
                    const userReaction = await fetchUserReaction(post.id);
                    return {
                        ...post,
                        userReaction: userReaction, // Store the user's reaction for this post
                        reactions: post.reactions || {}, // Ensure reactions is initialized
                    };
                }));

                setPosts(postsWithReactions);
                setLoading(false);

                postsWithReactions.forEach(post => {
                    if (post.uploads && post.uploads.fileUrl) {
                        fetchImageBlob(post.uploads.fileUrl, post.id);
                    }
                });

            } catch (error) {
                console.error('Error fetching posts or relations:', error);
                setLoading(false);
            }
        };

        fetchUserProfile();
        fetchUserPostsAndRelations();

        return () => {
            Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
        };
    }, [userId, token]);

    const fetchImageBlob = async (imageUrl, postId) => {
        try {
            const cacheBustedUrl = `http://localhost:8080${imageUrl}?t=${new Date().getTime()}`;

            const imageResponse = await axios.get(cacheBustedUrl, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: 'blob'
            });

            const blobUrl = URL.createObjectURL(imageResponse.data);

            setImageUrls(prevState => ({
                ...prevState,
                [postId]: blobUrl
            }));
        } catch (error) {
            console.error('Error fetching image:', error);
        }
    };

    const handleReaction = async (postId, reactionType) => {
        try {
            const currentPost = posts.find(post => post.id === postId);
            const currentUserReaction = currentPost.userReaction; // User's current reaction

            let newReactionType = reactionType;

            // If the user clicks the same reaction again, remove the reaction
            if (currentUserReaction === reactionType) {
                newReactionType = null; // Removing the reaction
            }

            await axios.post(`http://localhost:8080/reactions/${userId}/${postId}`, null, {
                params: { type: newReactionType },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Update the reaction count and user's reaction locally (optimistic UI)
            setPosts(prevPosts =>
                prevPosts.map(post => {
                    if (post.id === postId) {
                        const updatedReactions = { ...post.reactions };
                        // Decrease the count of the old reaction type
                        if (currentUserReaction) {
                            updatedReactions[currentUserReaction] =
                                (updatedReactions[currentUserReaction] || 1) - 1;
                        }
                        // Increase the count of the new reaction type
                        if (newReactionType) {
                            updatedReactions[newReactionType] =
                                (updatedReactions[newReactionType] || 0) + 1;
                        }

                        return {
                            ...post,
                            reactions: updatedReactions,
                            userReaction: newReactionType, // Update the user's current reaction
                        };
                    }
                    return post;
                })
            );
        } catch (error) {
            console.error(`Error adding/removing ${reactionType} reaction:`, error);
        }
    };

    return (
        <div style={{ backgroundColor: '#1E1E1E', padding: '20px' }}>
            {loading ? (
                <Typography sx={{ color: '#E0E0E0', textAlign: 'center' }}>Loading posts...</Typography>
            ) : (
                posts.length > 0 ? (
                    posts.map((post, index) => (
                        <Card 
                            key={index} 
                            sx={{ 
                                marginBottom: 2, 
                                backgroundColor: '#2E2E2E', 
                                color: '#E0E0E0', 
                                borderRadius: '10px', 
                                border: `2px solid #FFD700`, // Set border color to #FFD700
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)' 
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" sx={{ color: '#FFD700' }}>
                                    {post.user ? post.user.name : userDetails ? userDetails.name : 'Unknown User'}
                                </Typography>
                                <Typography variant="body2" color="#FFFFFF">
                                    {new Date(post.timestamp).toLocaleString()}
                                </Typography>
                                <Typography variant="body1" sx={{ marginTop: 1, color: '#E0E0E0' }}>
                                    {post.text || 'No content'}
                                </Typography>

                                {post.uploads && imageUrls[post.id] && (
                                    <img
                                        src={imageUrls[post.id]}
                                        alt="Uploaded"
                                        style={{ width: '100%', height: 'auto', marginTop: 10, borderRadius: '8px' }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/placeholder.png';
                                        }}
                                    />
                                )}

                                {/* Reaction buttons aligned to the bottom-left side */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-start', marginTop: 2 }}>
                                    {Object.keys(reactionEmojis).map(reactionType => (
                                        <Box key={reactionType} sx={{ textAlign: 'center', marginRight: 2 }}>
                                            <Button 
                                                size="large" 
                                                sx={{ 
                                                    fontSize: '2.5rem',  // Slightly larger emojis
                                                    borderRadius: '50%',  // Rounded buttons
                                                    padding: '10px',  // Add padding for larger touch area
                                                    minWidth: 'auto',  // Remove default button width
                                                    marginRight: 1,  // Add spacing between emoji buttons
                                                    transition: 'transform 0.2s',  // Animation for interaction
                                                    '&:hover': {
                                                        transform: 'scale(1.2)',  // Slightly increase size on hover
                                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',  // Add shadow effect
                                                    },
                                                    color: post.userReaction === reactionType ? '#FFD700' : '#E0E0E0', // Highlight user's reaction
                                                }}  
                                                onClick={() => handleReaction(post.id, reactionType)}
                                            >
                                                {reactionEmojis[reactionType]}
                                            </Button>
                                            {/* Display reaction count below the emoji */}
                                            <Typography variant="body2" sx={{ color: '#E0E0E0' }}>
                                                {post.reactions?.[reactionType] || 0}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Typography sx={{ color: '#E0E0E0', textAlign: 'center' }}>No posts to display</Typography>
                )
            )}
        </div>
    );
};

export default MainContent;
