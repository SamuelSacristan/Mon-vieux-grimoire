const Book = require('../models/book');
const fs = require('fs');
const path = require('path');

exports.createBook = (req, res, next) => {

    if(!req.body.book) {
      return res.status(400).json({message: 'parsing error'})
    }
   const bookObject = JSON.parse(req.body.book);
   delete bookObject._id;
   delete bookObject._userId;
   const imageUrl = `${req.protocol}://${req.get('host')}/images/${path.basename(req.file.path)}`;
   const book = new Book({
       ...bookObject,
       userId: req.auth.userId,
       imageUrl: imageUrl 
   });
 
   book.save()
   .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
   .catch(error => { res.status(403).json( { error })})
};

exports.createRating = async (req, res, next) => {
   const existingRating = await Book.findOne({
    _id: req.params.id,
    "ratings.userId": req.body.userId
  })
  if (existingRating) {
    return res.status(400).json({message: "L'utilisateur a déjà noté ce livre"})
  }
  if(!(req.body.rating  >= 0) && !(req.body.rating  <= 5) && (typeof req.body.rating === 'number')){
    return res.status(400).json({message: "La note doit être comprise entre 0 et 5"})
  }

  try {
    const book = await Book.findOne({ _id: req.params.id })
    if (!book) {
      return res.status(404).json({message: 'Livre non trouvé'})
    }

    book.ratings.push({ userId : req.body.userId, grade: req.body.rating })
    await book.save()
    res.status(200).json(book)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message });
  }
}

exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id
  }).then(
    (book) => {
      res.status(200).json(book);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.getBest3Books = (req, res, next) => {
    Book.find().sort({averageRating: -1}).limit(3)
        .then((books)=>res.status(200).json(books))
        .catch((error)=>res.status(404).json({ error }));
  };

exports.modifyBook = async (req, res, next) => {
    try {
        const bookObject = req.file ? {
            ...JSON.parse(req.body.book),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${path.basename(req.file.path)}`
        } : { ...req.body };

        delete bookObject._userId;

        const book = await Book.findOne({ _id: req.params.id });

        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }

        if (book.userId !== req.auth.userId) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
        res.status(200).json({ message: 'Livre modifié!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
      .then(book => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Book.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Livre supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

exports.getAllBooks = (req, res, next) => {
    Book.find().then(
      (books) => {
        res.status(200).json(books);
      }
    ).catch(
      (error) => {
        res.status(400).json({
          error: error
        });
      }
    );
  };