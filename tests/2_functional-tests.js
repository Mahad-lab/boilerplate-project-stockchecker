const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    test('GET / - check if server is accessible', function(done) {
        chai.request(server)
            .get('/')
            .end(function(err, res) {
                assert.equal(res.status, 200);
                done();
            })
    });

    // Viewing one stock: GET request to /api/stock-prices/
    test('GET /api/stock-prices/ - Viewing one stock', function(done) {
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG')
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isNotArray(res.body.stockData);
                assert.equal(res.body.stockData.stock, "GOOG");
                assert.isString(res.body.stockData.stock);
                assert.isNumber(res.body.stockData.price);
                assert.isNumber(res.body.stockData.likes);
                done();
            })
    });

    // Viewing one stock and liking it: GET request to /api/stock-prices/
    test('GET /api/stock-prices/ - Viewing one stock and liking it', function(done) {
        this.timeout(5000);
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG&like=true')
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isNotArray(res.body.stockData);
                assert.isString(res.body.stockData.stock);
                assert.equal(res.body.stockData.stock, "GOOG");
                assert.isNumber(res.body.stockData.price);
                // assert.isNumber(res.body.stockData.likes);
                done();
            })
    });

    // Viewing the same stock and liking it again: GET request to /api/stock-prices/
    test('GET /api/stock-prices/ - Viewing the same stock and liking it again', function(done) {
        this.timeout(5000);
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG&like=true')
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isNotArray(res.body.stockData);
                assert.isString(res.body.stockData.stock);
                assert.equal(res.body.stockData.stock, "GOOG");
                assert.isNumber(res.body.stockData.price);
                // assert.isNumber(res.body.stockData.likes);
                done();
            })
    });
    
    // Viewing two stocks: GET request to /api/stock-prices/
    test('GET /api/stock-prices/ - Viewing two stocks', function(done) {
        this.timeout(5000);
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG&stock=MSFT')
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body.stockData);
                assert.isString(res.body.stockData[0].stock);
                assert.isString(res.body.stockData[1].stock);
                assert.equal(res.body.stockData[0].stock, "GOOG");
                assert.equal(res.body.stockData[1].stock, "MSFT");
                assert.isNumber(res.body.stockData[0].price);
                assert.isNumber(res.body.stockData[1].price);
                // assert.isNumber(res.body.stockData.likes);
                done();
            })
    });

    // Viewing two stocks: GET request to /api/stock-prices/
    test('GET /api/stock-prices/ - Viewing two stocks', function(done) {
        this.timeout(5000);
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG&stock=MSFT')
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body.stockData);
                assert.isString(res.body.stockData[0].stock);
                assert.isString(res.body.stockData[1].stock);
                assert.equal(res.body.stockData[0].stock, "GOOG");
                assert.equal(res.body.stockData[1].stock, "MSFT");
                assert.isNumber(res.body.stockData[0].price);
                assert.isNumber(res.body.stockData[1].price);
                // assert.isNumber(res.body.stockData.likes);
                done();
            })
    });

    // Viewing two stocks and liking them: GET request to /api/stock-prices/
    test('GET /api/stock-prices/ - Viewing two stocks', function(done) {
        this.timeout(5000);
        chai.request(server)
            .get('/api/stock-prices?stock=GOOG&stock=MSFT&like=true')
            .end(function(err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body.stockData);
                assert.isString(res.body.stockData[0].stock);
                assert.isString(res.body.stockData[1].stock);
                assert.equal(res.body.stockData[0].stock, "GOOG");
                assert.equal(res.body.stockData[1].stock, "MSFT");
                assert.isNumber(res.body.stockData[0].price);
                assert.isNumber(res.body.stockData[1].price);
                // assert.isNumber(res.body.stockData.likes);
                done();
            })
    });

});
