const express = require('express')
const app = express()
const multer = require('multer')
const upload = multer({ dest: 'images/' })

const fs = require('fs')



app.set('view engine', 'ejs')

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/saveImage', upload.single('image'), (req, res) => {
    // 4
    const imagePath = req.file.path
    const description = req.body.description
  
    // Save this data to a database probably
  
    console.log(description, imagePath)
    res.render('savedImage', {description, imagePath})
})

app.get('/images/:imageName', (req, res) => {
    // do a bunch of if statements to make sure the user is 
    // authorized to view this image, then
  
    const imageName = req.params.imageName
    const readStream = fs.createReadStream(`images/${imageName}`)
    readStream.pipe(res)
  })

app.listen(8080, () => console.log("listening on port 8080"))
