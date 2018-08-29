// Import and set up server with express
const express = require('express');
const app = express();
var http = require('http').Server(app);

// Import Socket.io
var io = require('socket.io')(http);

//Import coinmarketcap API module and set up options object
var CoinMarketCap = require("node-coinmarketcap");

var options = {
	events: true, // Enable event system
    refresh: 5 // Refresh time in seconds 
}

var coinmarketcap = new CoinMarketCap(options);

// API port
var PORT = 3000;
// API interval in milliseconds
var TIME_INTERVAL = 5000;
// Amount of the top currencies you want to retrieve
var TOP_CURRENCIES = 10;

app.get("/", (req, res) => {
    console.log("On Root")
})

// Server listening at given port address
http.listen(PORT, function() {
    console.log('Listening on port '+ PORT);
});

// On socket connection
io.on('connection',async function(socket) {

    await coinmarketcap.multi(coins => {
        io.emit('CRYPTO_DATA', coins.getTop(TOP_CURRENCIES));
    });

    socket.on('GET_COINS_WITH_CURRENCY', async function(data) {
        
        options.convert = data.currency;
        coinmarketcap = new CoinMarketCap(options)

        await coinmarketcap.multi(coins => {
            io.emit('CRYPTO_DATA', coins.getTop(TOP_CURRENCIES));
        });
    });

});

// Send API data to client at set interval time
setInterval(async function() {
    await coinmarketcap.multi(coins => {
        io.emit('CRYPTO_DATA', coins.getTop(TOP_CURRENCIES));
    });
}, TIME_INTERVAL);


