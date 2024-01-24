const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;
const {connectDB} = require('./db.js');

connectDB();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors())

app.get('/demo', (req, res)=>{
    res.send("Hello....")
})

app.use('/api', require('./Routes/Event.js'))

app.listen(port, ()=>{
    console.log(`Server is listening to port ${port}`);
})