const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload')
const auth = require('../middleware/auth');
const compressImage = require('../middleware/compressImage')

const booksCtrl = require('../controllers/books');

router.get('/', booksCtrl.getAllBooks);
router.get('/bestrating', booksCtrl.getBest3Books);
router.get('/:id', booksCtrl.getOneBook);
router.post('/', auth, upload, compressImage, booksCtrl.createBook);
router.put('/:id', auth, upload, compressImage, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.post('/:id/rating', auth, booksCtrl.createRating);

module.exports = router;