const Book = require('../models/book');
const fs = require('fs');
const path = require('path');


// Création d'un livre
exports.createBook = (req, res, next) => {

    if(!req.body.book) {
      return res.status(400).json({message: 'parsing error'})
    }
   const bookObject = JSON.parse(req.body.book);
   delete bookObject._id; // Suppression de l'ID envoyé par le front
   delete bookObject._userId; // Suppression du userId
   const imageUrl = `${req.protocol}://${req.get('host')}/images/${path.basename(req.file.path)}`;
   const book = new Book({
       ...bookObject,
       userId: req.auth.userId,
       imageUrl: imageUrl 
   });
 
   book.save() // Enregistrement dans la base de données
   .then(() => { res.status(201).json({message: 'Livre enregistré !'})})
   .catch(error => { res.status(403).json( { error })})
};


// Création d'une note
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


// Accéder à un livre en fonction de son id
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

// Accéder aux 3 livres les mieux notés
exports.getBest3Books = (req, res, next) => {
    Book.find().sort({averageRating: -1}).limit(3)
        .then((books)=>res.status(200).json(books))
        .catch((error)=>res.status(404).json({ error }));
  };

// Modification d'un livre
exports.modifyBook = async (req, res, next) => {
  try {
      const bookId = req.params.id;
      const updatedFields = req.body;

      // On vérifie que les champs ne sont pas vides
      for (const key in updatedFields) {
          if (updatedFields.hasOwnProperty(key) && !updatedFields[key]) {
              return res.status(400).json({ message: `${key} cannot be blank` });
          }
      }

      const book = await Book.findOne({ _id: bookId });

      if (!book) {
          return res.status(404).json({ message: 'Livre non trouvé' });
      }

      if (book.userId !== req.auth.userId) {
          return res.status(401).json({ message: 'Not authorized' });
      }

      // Mise à jour du livre avec les nouveaux champs
      Object.assign(book, updatedFields);

      await book.save();

      res.status(200).json({ message: 'Livre modifié!' });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};



// Suppression d'un livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id})
      .then(book => {
          if (book.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = book.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => { //Suppression du livre dans la base de données et du fichier image
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

// Récupération de tous les livres
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