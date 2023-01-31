const express = require('express')
const app = express()
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const database = require('./database');
const sharp = require("sharp");
const crypto = require ('crypto');
const s3 = require('./s3.js');


const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')



require('dotenv').config()

const fs = require('fs')

app.set('view engine', 'ejs')

app.get("/", async (req, res) => {
  const images = await database.getImages()


  // Add the signed url to each image
  for (const image of images) {
    image.imageURL = await s3.getSignedUrl(image.file_path)
  }

  res.render("index", {images})
  })

app.post('/saveImage', upload.single('image'), async(req, res) => {
/*     const imagePath = req.file.path
    const description = req.body.description
    database.addImage(imagePath, description);
    res.render('savedImage', {description, imagePath}) */
      // Get the data from the post request
  const description = req.body.description
  const fileBuffer = await sharp(req.file.buffer)
  .resize({ height: 280, width: 280, fit: "contain" })
  .greyscale()
  .toBuffer()
  const mimetype = req.file.mimetype
  const fileName = generateFileName()

  // Store the image in s3
  const s3Result = await s3.uploadImage(fileBuffer, fileName, mimetype)

  // Store the image in the database
  const databaseResult = await database.addImage(fileName, description)

  res.render("savedImage", {description});
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

app.post('/image/delete/:id/:file_path', async(req, res) => {

  const id = req.params.id
  const imageName = req.params.file_path

  database.deleteImage(id)
  const s3Result = await s3.deleteImage(imageName)
  res.redirect("/");
})
app.listen(8080, () => console.log("listening on port 8080"))
