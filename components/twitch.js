var express = require('express');
var router = express.Router();
var url = require('url');
const https = require('https');
const axios = require('axios');



var twitchObject = {
    clientId:"h0rfqdr3ilgi6v6d4tcws0wtzl6cml",
    oauthResponseData:{},
    streamKey:"",
    userObject:"",
    authorizationCodeTwitch:"",
    authorizationTwitchResponse: {},
}



router.post('/stream_twitch',function(req,res)
{

  let oauthResponseData = req.body.oauthResponseData;
  let authorizationCodeTwitch = req.body.authorizationCodeTwitch;

    axios
      .post(
        `https://id.twitch.tv/oauth2/token?client_id=${twitchObject.clientId}&client_secret=9iyv343znh91asivljziyqjlzmgyyw&grant_type=client_credentials`
      )
      .then((result) => {
        let data = result.data;
        console.log("twitch response", data);
  
        let config = {
          headers: {
            Authorization:
              "Bearer " + oauthResponseData.access_token,
            "Client-Id": twitchObject.clientId,
            // Client-Id: this.state.clientId,
          },
        };

        let configUserData = {
          headers: {
            Accept: "application/vnd.twitchtv.v5+json",
            Authorization:
              "OAuth " + oauthResponseData.access_token,
            "Client-ID": twitchObject.clientId,

            // Client-Id: this.state.clientId,
          },
        };

        axios
          .get("https://api.twitch.tv/kraken/user", configUserData)
          .then((response) => {
            let data = response.data;
            console.log(data);
            // this.setState({ ...this.state, userObjectTwitch: data });
            // console.log(this.state.userObjectTwitch);
            axios
              .get(
                `https://api.twitch.tv/helix/streams/key?broadcaster_id=${data._id}`,
                config
              )
              .then((response) => {
                let data = response.data;
                console.log("GOT MY STREAM KEYYYYY", data);
                res.send(data);
              })
              .catch((error) => {
                console.log(error);
              });
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });


    
      });

router.post('',function(req,res)
{

});


module.exports = router;