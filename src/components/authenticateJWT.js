const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const users = []; // Replace with your database logic
const statusUpdates = []; // Replace with your status updates logic

// Secret key for JWT
const JWT_SECRET = 'your_jwt_secret_key';

// Utility functions for mapping
const UserMapper = {
    toDTO: (user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
    }),
    toEntity: (userDTO) => ({
        id: userDTO.id,
        email: userDTO.email,
        name: userDTO.name,
        password: userDTO.password, // Handle password hashing elsewhere
    }),
    toStatusUpdateDTO: (statusUpdate) => ({
        id: statusUpdate.id,
        content: statusUpdate.content,
        userId: statusUpdate.userId,
    })
};

// Login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(400).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    return res.json({ token });
});

// Registration route
app.post('/registration', async (req, res) => {
    const { email, password, name } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, email, password: hashedPassword, name };

    users.push(newUser);
    res.json(UserMapper.toDTO(newUser));
});

// Middleware to protect routes
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Forbidden' });
    }
};

// Route to get all users
app.get('/users', authenticateJWT, (req, res) => {
    const userDTOs = users.map(UserMapper.toDTO);
    res.json(userDTOs);
});

// Route to get user by ID
app.get('/users/:id', authenticateJWT, (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(UserMapper.toDTO(user));
});

// Route to update user by ID
app.put('/users/:id', authenticateJWT, async (req, res) => {
    const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    users[userIndex] = {
        ...users[userIndex],
        email,
        password: hashedPassword,
        name
    };

    res.json(UserMapper.toDTO(users[userIndex]));
});

// Route to delete user by ID
app.delete('/users/:id', authenticateJWT, (req, res) => {
    const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found' });
    }

    users.splice(userIndex, 1);
    res.status(204).send();
});

// // Protected route to get status updates relevant to the user
// app.get('/users/:id/home', authenticateJWT, (req, res) => {
//     const userStatusUpdates = statusUpdates.filter(su => su.userId === parseInt(req.params.id));
//     const statusUpdateDTOs = userStatusUpdates.map(UserMapper.toStatusUpdateDTO);

//     res.json(statusUpdateDTOs);
// });
// Protected route to get status updates relevant to the user
app.get('/:id/home', authenticateJWT, (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json(UserMapper.toDTO(user));
});

// Route to get top profiles (example logic)
app.get('/top-profiles', authenticateJWT, (req, res) => {
    const topUsers = users.slice(0, 5); // Replace with actual logic to get top profiles
    const topUserDTOs = topUsers.map(UserMapper.toDTO);

    res.json(topUserDTOs);
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
