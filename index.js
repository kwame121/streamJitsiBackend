var express = require('express');
var app = express();
var twitch = require('./components/twitch.js');



var cors = require('cors');
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());


app.use('/twitch',twitch);



app.listen(3001,()=>{console.log('server began running on port 3001')});
