const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;
const fs = require('fs')
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

fs.access('.env', fs.constants.F_OK, (err) => {
    if (err) {
        // File doesn't exist, create it
        fs.writeFile('.env', '', (err) => {
            if (err) {
                console.error('Error creating file:', err);
            } else {
                console.log('Empty .env file created successfully!');
            }
        });
    } else {
        console.log('.env file already exists. Skipping creation.');
    }
});


app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: `Backend Online`,
        data: {
            event: process.env.EVENT,
            year: process.env.YEAR,
            start: process.env.START,
            end: process.env.END,
            mongo_uri: process.env.MONGO_URI,
            email_body: process.env.EMAIL_BODY,
            email_subject: process.env.EMAIL_SUBJECT,
            max_users: process.env.MAX_USERS,
        }
    })
})


app.use('/api', require('./Routes/Event.js'))


app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (req.file) {
            const uploadDir = path.join(__dirname, 'email-templates');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }
            const newPath = path.join(uploadDir, req.file.originalname);
            fs.renameSync(req.file.path, newPath);
            console.log('File uploaded: '+ req.file.originalname);
            res.status(200).json({ success: true, message: 'File uploaded successfully' });
        } else {

            res.status(400).json({ success: false, message: 'No file uploaded' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
    }
})

//404
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: '404: Not Found' })
})

app.listen(port, () => {
    console.log(`Server is listening to port ${port}`);
})