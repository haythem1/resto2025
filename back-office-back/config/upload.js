const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Déterminer le dossier en fonction du type
    let type = req.params.type || 'general';

    // Rediriger les uploads d'éléments vers le dossier produits
    if (type === 'elements') {
      type = 'produits';
    }

    const uploadPath = path.join(__dirname, '..', 'uploads', type);

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, nameWithoutExt + '-' + uniqueSuffix + ext);
  }
});

// Filtrer les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  // Types MIME acceptés
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seules les images sont acceptées.'), false);
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
  }
});

module.exports = upload;
