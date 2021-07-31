const { default: axios } = require("axios");
var express = require("express");
const { post } = require("./twitch");
const {YoutubeAuth} = require("../utils/YT_Auth.js");
var router = express.Router();
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'streamjitsi'
});
var Auth = require('./Models/auth.js');

connection.connect();

router.post("/get_auth_url", async function (req, res) {

  let yt_auth = new YoutubeAuth();
  oauth2Client = yt_auth.create_auth_client();
  const scopes = [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/contacts.readonly",
    "https://www.googleapis.com/auth/userinfo.profile"
  ];
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });
  res.send({ status: "200", url: url });
});


router.post('/get_stream_credentials',async function(req,res)
{
  try
  {
    let yt_auth = new YoutubeAuth();
    let broadcastObject = req.body.broadcastObject;
    let created_broadcast = await yt_auth.createBroadcast(broadcastObject);
    res.send({status:'200',broadcast:created_broadcast});

  }
  catch(e)
  {
    console.error('Error occured when creating stream resources',e);
    res.send({status:'500',broadcast:null});
  }

})


router.post("/get_access_token", async function (req, res) {
  let yt_auth = new YoutubeAuth();
  oauth2Client = yt_auth.create_auth_client();
  let data = req.body.authData;
  let code = decodeURIComponent(data["code"]);
  oauth2Client.getToken(code,async function(err,tokens)
  {
    if (err)
    {
      try
      {
        let results = await yt_auth.retrieve_refresh_token();
        if (results[0].refresh_token!==null){
        let tokens =  yt_auth.get_new_access_token(results[0].refresh_token);
        res.send({status: "200",tokens:tokens,error: null,});
        res.end();
        } 
      }
      catch(e)
      {
        console.error('error with getToken code',err);
        res.send({ status: "500", access_token: null, error: e, tokens:null });
      }
    }
// separate these guys...

    else 
    {
      let access_token = tokens.access_token;
      let refresh_token = tokens.refresh_token ? tokens.refresh_token : "";
      if (refresh_token === '')
      {
        res.send({
          status: "200",
          error: null,
          access_token: access_token,
          tokens: tokens,
        });
        res.end();
      }
      else
      {

        try
        {
          connection.query("Insert into youtube_refresh_token values ('" + refresh_token + "')",function(err)
          {
            if (!err)
            {
              res.send({
                status: "200",
                error: null,
                access_token: access_token,
                tokens: tokens,
              });
              res.end();
            }
            else
            console.error('Error found',err);
          })

        }
        catch(e)
        {
          res.send({
            status: "500",
            error: e,
            access_token: null,
            tokens: tokens,
          });
        }

      }
    }
  })
});



router.post("/get_user_data",async function (req, res) {
  let {access_token} = req.body.tokens;
  console.log(access_token);
  let yt_auth = new YoutubeAuth();
  // console.log(yt_auth);
  try
  {
    let result = await yt_auth.getProfileData(access_token);
    res.send({status:'200',user_data:result,error:null})

  }
  catch(e)
  {
    console.log('error getting user',e);
    res.send({status:'500',user_data:null,error:e})

  }
});

module.exports = router;
