const express = require('express')
const app = express()
const multer = require('multer')
const upload = multer({ dest: 'images/' })
const database = require('./database');

require('dotenv').config()

const fs = require('fs')

app.set('view engine', 'ejs')

app.get("/", async (req, res) => {
    const images = await database.getImages()
    res.render("index", { images })
  })

app.post('/saveImage', upload.single('image'), (req, res) => {
    const imagePath = req.file.path
    const description = req.body.description
    database.addImage(imagePath, description);
    res.render('savedImage', {description, imagePath})
})

app.get('/image/:id'), (req,res) => {
    const id = req.body.id
    const image = database.getImage(id);
    res.render('singleImage', {image});
}

app.get('/images/:imageName', (req, res) => {
    // do a bunch of if statements to make sure the user is 
    // authorized to view this image, then
  
    const imageName = req.params.imageName
    const readStream = fs.createReadStream(`images/${imageName}`)
    readStream.pipe(res)
  })

app.listen(8080, () => console.log("listening on port 8080"))
