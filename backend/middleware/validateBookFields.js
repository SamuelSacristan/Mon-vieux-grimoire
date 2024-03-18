exports.validateBookFields = (req, res, next) => {
    const requiredFields = ['title', 'author', 'year', 'genre'];
  
    for (const field of requiredFields) {
      if (!req.body.book[field]) {
        return res.status(400).json({ message: `${field} is required` });
      }
    }
  
    next();
  };
  