const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const makePhoto = (photo) => ({
  id: photo.data.id,
  title: photo.data.title,
  time: photo.data.time,
  url: photo.data.url,
  thumb: photo.data.thumb.url,
  delete_url: photo.data.delete_url,
  medium: photo.data.medium?.url || ""
});

const uploadThumb = async (fileBuffer, fileName) => {
  try {
    // Create FormData and append the image buffer
    const formData = new FormData();
    formData.append('image', fileBuffer, fileName);
    formData.append('name', fileName);
    formData.append('key', process.env.IMGBB);

    // Upload to ImgBB API
    const uploadResponse = await axios.post('https://api.imgbb.com/1/upload', formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    const photo = makePhoto(uploadResponse.data);
    return photo;
  } catch (error) {
    return { error: error.message };
  }
};

const saveThumb = async (fileBuffer, fileName) => {
  try {
    let photo = await uploadThumb(fileBuffer, fileName);
    if (photo && photo.error) return photo;

    // Assuming medium image processing is required and using the same buffer for simplicity
    const mediumPhoto = await uploadThumb(fileBuffer, fileName);
    if (mediumPhoto.error) return mediumPhoto;

    photo.medium = mediumPhoto.url;
    return photo;
  } catch (error) {
    console.error('Error:', error);
    return { error: 'Failed to download or upload file' };
  }
};

// Endpoint to handle file upload
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ error: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;

    const result = await saveThumb(fileBuffer, fileName);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: 'Failed to process image' });
  }
});

const path = require('path');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
