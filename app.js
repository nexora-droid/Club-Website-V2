const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'public')))

app.get('/admin', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
})

app.listen(4000, ()=> console.log('Server running on 4000'));