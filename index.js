const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors())

app.get('/ping', (req, res)=>{
    res.send("pong")
})

app.use('/api', require('./Routes/Event.js'))

//404
app.use((req, res, next)=>{
    res.status(404).json({success: false, message: '404: Not Found'})
})

app.listen(port, ()=>{
    console.log(`Server is listening to port ${port}`);
})