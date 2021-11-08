const express = require('express')
const app = express()
const path = require('path')
const multer = require('multer')
const fs = require('fs')
const mongoose = require('mongoose')
require('dotenv')

// Default setup
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'uploads')))
app.use(express.urlencoded({extended: false}))
app.use(express.json())

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/image')
    },
    filename: (req, file, cb) => {
        let filename = Date.now() + file.originalname
        cb(null, filename)
    }
})

// Mongoose setup
let dbUrl = 'mongodb+srv://jedezese04:0850790410mn@multer-files-upload.lpck7.mongodb.net/multer-files-uploading?retryWrites=true&w=majority'
mongoose.connect(process.env.MONGODB_URL, () => console.log('Database connected!'))

// Mongoose Schema
let imageSchema = mongoose.Schema({
    name: String
})
let Image = mongoose.model('images', imageSchema)

// Router
// '/'
app.get('/', (req, res) => {
    Image.find().sort({_id: -1}).exec((err, result) => {
        res.render('index', {images: result})
    })
})

// '/add'
const upload = multer({
    storage: storage,
    // limits: { fileSize: 5000000 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
          cb(null, true);
        } else {
          req.fileValidationError = "Forbidden extension"
          return cb(null, false, req.fileValidationError)
        }
    }
})

app.post('/add', upload.any('images'), function (req, res) {
    if(req.fileValidationError) {
        res.redirect('/')
    } else {
        req.files.forEach((file) => {
            let saveImage = new Image({
                name: file.filename
            })
            saveImage.save()
        })
        res.redirect('/')
    }
})

// '/delete'
app.get('/delete/:name', (req, res) => {
    let fileName = req.params.name
    let filePath = `./uploads/image/${fileName}`
    fs.unlink(filePath, err => console.log(err))
    Image.remove({name: fileName}).exec((err, result) => {
        if(err) console.log(err)
        console.log(result)
    })
    res.redirect('/')
})

let port = process.env.PORT || 3000
app.listen(port, () => console.log("Server is running on port " + port))
