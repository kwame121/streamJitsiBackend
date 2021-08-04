var express = require('express');
var router = express.Router();
var url = require('url');
const https = require('https');
const axios = require('axios');
const {TwitchAuth} = require('../utils/TW_Auth.js');


router.post('/stream_twitch', async function(req,res)
{
  try
  {
    let oauthResponseData = req.body.twitchObject;
    let tw_auth = new TwitchAuth(oauthResponseData);
    let user_data = await tw_auth.get_user();
    let stream_credentials = await tw_auth.get_stream_credentials(user_data);
    let ingestion_urls = await tw_auth.get_ingest_urls();
    res.send({status:'200',user_data:user_data,stream_credentials:stream_credentials,ingestion_urls:ingestion_urls});
  }
  catch(e)
  {
    console.error(e);
  }
});

router.post('/get_user',async function(req,res)
{
  try
  {
    let oauthResponseData = req.body.twitchObject;
    let tw_auth = new TwitchAuth(oauthResponseData);
    let user_data = await tw_auth.get_user();
    res.send({status:'200',user_data:user_data});


  }
  catch(e)
  {
    console.error(e);
    res.send({status:'500',user_data:null,});

  }
})


module.exports = router;