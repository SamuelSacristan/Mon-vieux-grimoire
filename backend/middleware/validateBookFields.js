exports.validateBookFields = (req, res, next) => {
  const requiredFields = ['title', 'author', 'year', 'genre'];
  const bookData = JSON.parse(req.body.book);
  
  if (!bookData) {
      return res.status(400).json({ message: 'Book data is required' });
  }

  for (const field of requiredFields) {
      if (!bookData[field]) {
          return res.status(400).json({ message: `${field} is required` });
      }
  }

  next();
};