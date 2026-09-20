const express = require('express');
const path = require('path');
const app = express();
const adminRoutes = require('./routes/admin');
const cookieParser = require('cookie-parser');
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser());

app.use((req, res, next) => {
    console.log('COOKIES PARSER ', req.cookies);
    next();
})
app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.use('/admin', adminRoutes);

app.listen(4000, ()=> console.log('Server running on 4000'));