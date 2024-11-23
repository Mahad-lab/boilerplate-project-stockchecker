'use strict';
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
require('dotenv').config()

const LOG = false;

const saltRounds = 12;
const MONGO_URI = process.env.MONGO_URI;
if (LOG) console.log(MONGO_URI)
mongoose.connect(MONGO_URI);

const stockSchema = new mongoose.Schema({
  stock: {
    type: String,
    required: true
  },
  likes: {
    type: [String],
    unique: true,
    default: [],
  }
});

const Stock = mongoose.model('Stock', stockSchema);

async function getStockPrice(symbol) {
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
  if (LOG) console.log(url);

  const options = {
    hostname: 'stock-price-checker-proxy.freecodecamp.rocks',
    port: 443,
    path: `/v1/stock/${symbol}/quote`,
    method: 'GET',
  };

  const response = {}

  const res = await fetch(url).then((data) => {
    if (LOG) console.log('data', data)
    return data.json()
  }).catch((err) => {
    return {}
  });
  if (LOG) console.log('res', res);

  return {
    stock: symbol,
    price: res.latestPrice
  }
}

function getLikes(symbol) {
  if (LOG) console.log('getLikes')
  return Stock.findOne({ stock: symbol })
    .then(stockData => {
      if (LOG) console.log('symbol', symbol)
      if (LOG) console.log('stockData.likes.length', stockData.likes.length)
      return stockData.likes.length
    })
    .catch(err => {
      if (LOG) console.log(err);
      return 0
    })
}

function checkIP(ip, likesArray = []) {
  let ipExists = false;
  for (const ipHashed of likesArray) {
    const match = bcrypt.compareSync(ip, ipHashed);
    if (match) {
      if (LOG) console.log(match, ip, ipHashed)
      ipExists = true;
      break
    }
  }
  return ipExists
}

async function saveStockOnDB(symbol, ip = null) {
  if (LOG) console.log('saveStockOnDB', symbol)
  const stockData = await Stock.findOne({ stock: symbol });
  if (LOG) console.log('stockData', stockData)
  if (stockData) {
    if (ip) {
      // check if ip already exists 
      const ipExists = checkIP(ip, stockData?.likes)
      if (LOG) console.log("ipExists", ipExists)
      if (!ipExists) {
        const ipHash = bcrypt.hashSync(ip, saltRounds);
        const newIPAdded = await Stock.updateOne(
          { stock: symbol },
          { $push: { likes: ipHash } }
        );
        if (LOG) console.log('newIPAdded', newIPAdded);
      }
    }
  } else {
    // create stock data on db
    const newStock = new Stock({
      stock: symbol
    });

    try {
      const savedStock = await newStock.save();
      if (LOG) console.log('New stock added:', savedStock);
    } catch (error) {
      console.error('Error adding stock:', error);
    }
  }
}

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res) {
      const params = req.query;
      if (LOG) console.log('ip', req.ip);
      if (LOG) console.log('ip', req.ip.split(':'));
      const requestIP = req.ip.split(':').splice(-1)[0];
      if (LOG) console.log('requestIP', requestIP);
      if (LOG) console.log('params', params, typeof params);

      const isMultipleStocks = Array.isArray(params.stock) ? true : false;
      if (LOG) console.log('Array.isArray(params.stock)', Array.isArray(params.stock))
      if (LOG) console.log('isMultipleStocks', isMultipleStocks)
      const response = isMultipleStocks ? [] : {};
      if (LOG) console.log('response in', response)

      const isLike = (params?.like == 'true');
      if (LOG) console.log('isLike', isLike)
      if (LOG) console.log('params?.like', params?.like)

      if (isMultipleStocks) {
        if (LOG) console.log('params is an array')
        params.stock.forEach(async stock => {
          if (isLike) {
            await saveStockOnDB(stock, requestIP)
            if (LOG) console.log("saveStockOnDB")
          } else {
            await saveStockOnDB(stock)
          }
        });

        for (const symbol of params.stock) {
          const stockData = await getStockPrice(symbol);
          stockData.likes = await getLikes(symbol);
          response.push(stockData);
        }

        // rel_likes
        [response[0].rel_likes, response[1].rel_likes] = [
          response[0].likes - response[1].likes,
          response[1].likes - response[0].likes
        ]
        if (LOG) console.log("response[0].likes, response[1].likes", [response[0].likes, response[1].likes])


        // Ensure all promises have resolved
        await Promise.all(response.map(() => { }));

        if (LOG) console.log('response mid', response)
      } else { // is object
        if (isLike) {
          if (LOG) console.log("saveStockOnDB")
          await saveStockOnDB(params.stock, requestIP)
        } else {
          await saveStockOnDB(params.stock)
        }
        const stockData = await getStockPrice(params.stock)
        for (const property in stockData) {
          response[property] = stockData[property];
        }
        if (LOG) console.log(getLikes(params.stock))
        response.likes = await getLikes(params.stock);
      }

      if (LOG) console.log('response final', response)
      res.send({
        stockData: response
      });
    });

};
