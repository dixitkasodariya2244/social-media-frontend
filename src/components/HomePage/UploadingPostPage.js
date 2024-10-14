import React, { useState } from 'react';
import axios from 'axios';
import { Typography, Box, Button, TextField, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './UploadingPostPage.css';

const UploadingPostPage = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [fileNames, setFileNames] = useState('No files chosen');
    const [statusText, setStatusText] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate(); // Initialize the useNavigate hook

    // Handle multiple file selection
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setSelectedFiles(files);
        setFileNames(files.length > 0 ? files.map(file => file.name).join(', ') : 'No files chosen');
    };

    // Handle status input change
    const handleStatusChange = (event) => {
        setStatusText(event.target.value);
    };

    // Handle combined upload and status post
    const handleUploadAndPostStatus = async () => {
        if (!statusText) {
            toast.error('Please enter a status update.');
            return;
        }

        setLoading(true);
        setUploading(true);

        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        const formData = new FormData();

        // Append each selected file to the form data if any files are chosen
        selectedFiles.forEach((file) => {
            formData.append('files', file);
        });

        // Append the status text to the form data
        formData.append('text', statusText);

        try {
            // Make a POST request to the combined endpoint
            await axios.post(`http://localhost:8080/${userId}/post`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Post with uploads created successfully!');
            navigate(`/${userId}/home`); // Navigate to the home page

        } catch (error) {
            toast.error('Error uploading files or posting status.');
        } finally {
            setLoading(false);
            setUploading(false);
            setSelectedFiles([]);
            setFileNames('No files chosen');
            setStatusText('');
        }
    };

    return (
        <Box
            className="auth-container"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100vh"
            padding={2}
        >
            <Box className="auth-box">
                <Typography variant="h4" gutterBottom>
                    Create a Post
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Upload files and post your status!
                </Typography>
                
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="upload-file"
                />
                <label htmlFor="upload-file">
                    <Button variant="contained" color="secondary" component="span">
                        Choose Files
                    </Button>
                </label>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    style={{
                        marginTop: 8,
                        backgroundColor: '#FFFFFF',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                    }}
                >
                    {fileNames}
                </Typography>

                <TextField
                    variant="outlined"
                    multiline
                    rows={4}
                    placeholder="What's on your mind?"
                    value={statusText}
                    onChange={handleStatusChange}
                    style={{
                        marginTop: 16,
                        width: '100%',
                        backgroundColor: '#FFFFFF',
                    }}
                />
                
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUploadAndPostStatus}
                    style={{ marginTop: 16 }}
                    disabled={loading || uploading}
                >
                    {loading || uploading ? <CircularProgress size={24} /> : 'Upload and Post'}
                </Button>
            </Box>
        </Box>
    );
};

export default UploadingPostPage;
