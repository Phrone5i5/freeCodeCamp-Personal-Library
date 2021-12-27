/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

module.exports = function (app) {

  require('dotenv').config({ path: '../sample.env' });

  const mongoose = require('mongoose');
  const { Schema } = require('mongoose');
  const ID = mongoose.Types.ObjectId;

  const bookSchema = new Schema({
    _id: ID,
    title: { type: String, required: true },
    commentcount: { type: Number },
    comments: { type: [ String ], default: [ ] }
  });

  const Book = mongoose.model('Book', bookSchema);

  app.route('/api/books')
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({}, (err, books) => {
        if (err) return res.send(err);
        res.json(books);
      });
    })
    
    .post(function (req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
        Book.create({
          _id: new ID(),
          commentcount: 0,
          title: title
        }, (err, book) => {
          if (err || !book) return res.send('missing required field title');
          res.json(book);
        });
    })
    
    .delete(function(req, res) {
      //if successful response will be 'complete delete successful'
      Book.deleteMany({}, (err, deleted) => {
        if (err || !res) return res.send('no book exists');
        res.send('complete delete successful');
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findById(bookid, (err, book) => {
        if (err || !book) return res.send('no book exists');
        res.json(book);
      });
    })
    
    .post(function(req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!comment) {
        return res.send('missing required field comment');
      }
      Book.findByIdAndUpdate(bookid, { $push: { comments: comment } }, { new: true }, (err, updatedBook) => {
        if (err || !updatedBook) return res.send('no book exists');
        res.json(updatedBook);
      });
    })
    
    .delete(function(req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      Book.findByIdAndDelete(bookid, (err, book) => {
        if (err || !book) return res.send('no book exists');
        res.send('delete successful');
      });
    });
  
};
