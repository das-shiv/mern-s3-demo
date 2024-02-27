const express = require('express');
const multer = require('multer');
const aws = require('aws-sdk');
const mongoose = require('mongoose');

const app = express();
const port = 3001;

mongoose.connect('mongodb://localhost:27017/mernapp', { useNewUrlParser: true, useUnifiedTopology: true });
const fileSchema = new mongoose.Schema({ s3Key: String });
const File = mongoose.model('File', fileSchema);

aws.config.update({ region: 'ap-south-1' });
const s3 = new aws.S3();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
  const fileContent = req.file.buffer;
  const fileName = `${Date.now()}_${req.file.originalname}`;
  const params = { Bucket: 'sepnoty-backend-bucket', Key: fileName, Body: fileContent };

  try {
    await s3.upload(params).promise();
    const file = new File({ s3Key: fileName });
    await file.save();
    res.status(200).json({ message: 'File uploaded successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

