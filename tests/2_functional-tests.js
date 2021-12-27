/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done) {
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai
            .request(server)
            .post('/api/books')
            .send({
              title: 'How to POST a Book Title'
            })
            .end((err, res) => {
              assert.isNotOk(err, 'err should not be truthy');
              assert.equal(res.body.title, 'How to POST a Book Title', 'book title should be the input value');
              done();
            });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai
            .request(server)
            .post('/api/books')
            .send({})
            .end((err, res) => {
              assert.isNotOk(err, 'err should not be truthy');
              assert.equal(res.text, 'missing required field title', 'resObj should be an error message');
              done();
            });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai
            .request(server)
            .get('/api/books')
            .end((err, res) => {
              assert.isNotOk(err, 'err should not be truthy');
              let resObj = res.body;
              assert.include(resObj[0], { title: 'How to POST a Book Title' });
              assert.containsAllKeys(resObj[0], ['title', '_id', 'commentcount'], 'resObj[0] should have all keys');
              done();
            });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      // Is not logging values, checking for error message, but test still passes
      test('Test GET /api/books/[id] with id not in db',  function(done) {
        let randomId = new mongoose.Types.ObjectId();
        chai
            .request(server)
            .get(`/api/books/${randomId}`)
            .end((err, res) => {
              assert.isNotOk(err, 'err should not be truthy');
              assert.include(res.text, 'no book exists', 'resObj should be an error message');
              done();
            });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done) {
        chai
            .request(server)
            .post('/api/books')
            .send({
              title: 'This has a valid ID!'
            })
            .end((err, res) => {
              assert.isNotOk(err, 'err should not be truthy');
              let validId = res.body._id;
              chai
                  .request(server)
                  .get(`/api/books/${validId}`)
                  .end((err, res) => {
                    assert.isNotOk(err, 'err should not be truthy');
                    assert.equal(res.body._id, validId, 'GET response ID should match the initial POSTed book\'s ID');
                    assert.containsAllKeys(res.body, ['title', '_id', 'commentcount'], 'resObj should have all keys');
                    done();
                  });
            });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function() {
      
      test('Test POST /api/books/[id] with comment', function(done) {
        chai
            .request(server)
            .post('/api/books')
            .send({
              title: 'This has a valid ID!'
            })
            .end((err, res) => {
              assert.isNotOk(err, 'err should not be truthy');
              let validId = res.body._id;
              chai
                .request(server)
                .post(`/api/books/${validId}`)
                .send({
                  comment: 'Wowzers, a comment!'
                })
                .end((err, res) => {
                  assert.isNotOk(err, 'err should not be truthy');
                  assert.deepInclude(res.body.comments, 'Wowzers, a comment!', 'comments should include the POSTed comment');
                  done();
                });
            });
      });

      test('Test POST /api/books/[id] without comment field', function(done) {
        chai
            .request(server)
            .post('/api/books')
            .send({
              title: 'This has a valid ID!'
            })
            .end((err, res) => {
              assert.isNotOk(err, 'err should not be truthy');
              let validId = res.body._id;
              chai
                .request(server)
                .post(`/api/books/${validId}`)
                .send({})
                .end((err, res) => {
                  assert.isNotOk(err, 'err should not be truthy');
                  assert.equal(res.text, 'missing required field comment', 'res.text should be an error');
                  done();
                });
            });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done) {
        let randomId = new mongoose.Types.ObjectId();
        chai
            .request(server)
            .post(`/api/books/${randomId}`)
            .send({
              comment: 'This is a comment, it better not sneak by'
            })
            .end((err, res) => {
              assert.isNotOk(err, 'err should not be truthy');
              assert.equal(res.text, 'no book exists', 'res.text should be an error');
              done();
            });
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done) {
        chai
            .request(server)
            .post('/api/books')
            .send({
              title: 'Is deleting this similar to book burning? Hmm'
            })
            .end((err, res) => {
              assert.isNotOk(err, 'err should not be truthy');
              chai 
                .request(server)
                .delete(`/api/books/${res.body._id}`)
                .end((err, res) => {
                  assert.isNotOk(err, 'err should not be truthy');
                  assert.equal(res.text, 'delete successful', 'res.text should contain success message');
                  done();
                });
            });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done) {
        let randomId = new mongoose.Types.ObjectId();
        chai 
            .request(server)
            .delete(`/api/books/${randomId}`)
            .end((err, res) => {
              assert.isNotOk(err, 'err should not be truthy');
              assert.equal(res.text, 'no book exists', 'res.text should be an error');
              done();
            });
      });

    });

  });

});