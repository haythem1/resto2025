const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const UploadController = require('../controllers/uploadController');

// Upload une image
// type peut être: categories, produits, elements
router.post('/:type', upload.single('image'), UploadController.uploadImage);

// Lister les images d'un type
router.get('/:type', UploadController.listImages);

// Supprimer une image
router.delete('/:type/:filename', UploadController.deleteImage);

module.exports = router;
