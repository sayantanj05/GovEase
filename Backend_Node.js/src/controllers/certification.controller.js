const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');
const Certification = require('../models/certification.model');

let gfsBucket;

mongoose.connection.once('open', () => {
  gfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'certifications' });
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

class CertificationController {
  async getAll(req, res) {
    try {
      const { userId } = req.params;
      const certifications = await Certification.find({ userId }).sort({ issueDate: -1 });
      res.json({ success: true, certifications });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const { id } = req.params;
      const certification = await Certification.findById(id);
      if (!certification) {
        return res.status(404).json({ success: false, message: 'Certification not found' });
      }
      res.json({ success: true, certification });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const certId = 'CERT' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 4);
      const certification = new Certification({
        _id: certId,
        ...req.body
      });
      await certification.save();
      res.status(201).json({ success: true, certification });
    } catch (error) {
      console.error('Create certification error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const certification = await Certification.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!certification) {
        return res.status(404).json({ success: false, message: 'Certification not found' });
      }
      res.json({ success: true, certification });
    } catch (error) {
      console.error('Update certification error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const certification = await Certification.findByIdAndDelete(id);
      if (!certification) {
        return res.status(404).json({ success: false, message: 'Certification not found' });
      }

      // Delete associated image from GridFS if exists
      if (certification.imageFileId) {
        try {
          await gfsBucket.delete(new mongoose.Types.ObjectId(certification.imageFileId));
        } catch (gridFsError) {
          console.warn('GridFS file may not exist:', gridFsError.message);
        }
      }

      res.json({ success: true, message: 'Certification deleted' });
    } catch (error) {
      console.error('Delete certification error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file uploaded' });
      }

      const { originalname, size, mimetype, buffer } = req.file;

      if (size > MAX_FILE_SIZE) {
        return res.status(400).json({ success: false, message: 'File size exceeds 5MB limit' });
      }

      if (!ALLOWED_MIME_TYPES.includes(mimetype)) {
        return res.status(400).json({ success: false, message: 'Invalid file type. Only JPEG or PNG allowed' });
      }

      const uploadStream = gfsBucket.openUploadStream(originalname, {
        contentType: mimetype,
        metadata: { originalName: originalname, uploadedAt: new Date() }
      });

      uploadStream.end(buffer);

      uploadStream.on('finish', async () => {
        try {
          res.json({
            success: true,
            imageFileId: uploadStream.id.toString(),
            imageFileName: originalname,
            imageMimeType: mimetype
          });
        } catch (error) {
          await gfsBucket.delete(uploadStream.id);
          res.status(500).json({ success: false, message: 'Failed to store image' });
        }
      });

      uploadStream.on('error', (error) => {
        res.status(500).json({ success: false, message: 'Upload failed: ' + error.message });
      });
    } catch (error) {
      console.error('Upload image error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getImage(req, res) {
    try {
      const { id } = req.params;
      const certification = await Certification.findById(id);
      if (!certification || !certification.imageFileId) {
        return res.status(404).json({ success: false, message: 'Image not found' });
      }

      const downloadStream = gfsBucket.openDownloadStream(new mongoose.Types.ObjectId(certification.imageFileId));
      res.set('Content-Type', certification.imageMimeType);
      res.set('Content-Disposition', `inline; filename="${certification.imageFileName}"`);

      downloadStream.on('error', (error) => {
        console.error('GridFS download error:', error.message);
        if (!res.headersSent) {
          res.status(404).json({ success: false, message: 'Image not found in storage' });
        }
      });

      downloadStream.pipe(res);
    } catch (error) {
      console.error('Get image error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async validateUrl(req, res) {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ success: false, message: 'URL is required' });
      }

      const urlPattern = /^(https?:\/\/)?(www\.)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
      const isValid = urlPattern.test(url);

      res.json({
        success: true,
        isValid,
        message: isValid ? 'URL is valid' : 'Invalid URL format'
      });
    } catch (error) {
      console.error('Validate URL error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getImageByFileId(req, res) {
    try {
      const { fileId } = req.params;
      
      if (!fileId) {
        return res.status(400).json({ success: false, message: 'File ID is required' });
      }

      // First, get the file metadata to set content type
      const files = await gfsBucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
      
      if (files.length === 0) {
        return res.status(404).json({ success: false, message: 'Image not found in storage' });
      }

      const file = files[0];
      res.set('Content-Type', file.contentType || 'image/jpeg');
      res.set('Content-Disposition', `inline; filename="${file.filename || 'image'}"`);

      const downloadStream = gfsBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
      
      downloadStream.on('error', (error) => {
        console.error('GridFS download error:', error.message);
        if (!res.headersSent) {
          res.status(404).json({ success: false, message: 'Image not found in storage' });
        }
      });

      downloadStream.pipe(res);
    } catch (error) {
      console.error('Get image by file ID error:', error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: error.message });
      }
    }
  }
}

module.exports = new CertificationController();