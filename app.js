const express = require('express');
const path = require('path');
const app = express();
const adminRoutes = require('./routes/admin')
app.use(express.static(path.join(__dirname, 'public')))

app.get('/admin', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
})

app.use('/admin', adminRoutes);

app.listen(4000, ()=> console.log('Server running on 4000'));