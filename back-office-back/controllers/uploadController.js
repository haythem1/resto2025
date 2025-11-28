const path = require('path');
const fs = require('fs');

class UploadController {
  // Upload une image
  static async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      const type = req.params.type || 'general';
      const filename = req.file.filename;
      const fileUrl = `/uploads/${type}/${filename}`;

      res.status(201).json({
        message: 'Image uploadée avec succès',
        filename: filename,
        url: fileUrl,
        path: req.file.path
      });
    } catch (error) {
      console.error('Erreur upload:', error);
      res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
  }

  // Supprimer une image
  static async deleteImage(req, res) {
    try {
      const { type, filename } = req.params;
      const filePath = path.join(__dirname, '..', 'uploads', type, filename);

      // Vérifier si le fichier existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Fichier non trouvé' });
      }

      // Supprimer le fichier
      fs.unlinkSync(filePath);

      res.json({
        message: 'Image supprimée avec succès',
        filename: filename
      });
    } catch (error) {
      console.error('Erreur suppression:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
  }

  // Lister les images d'un type
  static async listImages(req, res) {
    try {
      const type = req.params.type || 'general';
      const uploadPath = path.join(__dirname, '..', 'uploads', type);

      // Vérifier si le dossier existe
      if (!fs.existsSync(uploadPath)) {
        return res.json({ images: [] });
      }

      // Lire le contenu du dossier
      const files = fs.readdirSync(uploadPath);

      // Filtrer pour ne garder que les images
      const images = files
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        })
        .map(file => ({
          filename: file,
          url: `/uploads/${type}/${file}`,
          path: path.join(uploadPath, file)
        }));

      res.json({ images });
    } catch (error) {
      console.error('Erreur listage:', error);
      res.status(500).json({ error: 'Erreur lors du listage' });
    }
  }
}

module.exports = UploadController;
