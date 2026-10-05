const express = require('express');
const path = require('path');
const app = express();
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/member');
const cookieParser = require('cookie-parser');
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser());

// app.use((req, res, next) => {
//     console.log('COOKIES PARSER ', req.cookies);
//     next();
// })
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
})
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
})
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/members', memberRoutes);

app.use((req, res, next)=> {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
})
app.listen(4000, ()=> console.log('Server running on 4000'));