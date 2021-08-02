const { default: axios } = require("axios");
const { google } = require("googleapis");
const { youtubeObject } = require("./constants.js");
const { connection } = require("./db.js");
const {moment} = require('moment');
var mysql      = require('mysql');
const { youtube } = require("googleapis/build/src/apis/youtube");
var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'streamjitsi'
});

class YoutubeAuth {
  //INCOMPLETE CODEEEEE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!//
create_auth_client() {
  const oauth2Client = new google.auth.OAuth2(
    youtubeObject.clientId,
    youtubeObject.clientSecret,
    "http://localhost:3000/destinations/auth/youtube"
  );
  return oauth2Client;
}

create_request_body(settings)
{
  try
  {
  
    return {"snippet": {
      "title": settings.eventName_text,
      "description": "Stream Jitsi Concept Test",
    },
    "cdn": {
      "frameRate": "60fps",
      "ingestionType": "rtmp",
      "resolution": "1080p"
    },
    "contentDetails": {
      "isReusable": true
    }
  };
}

  catch(e)
  {
    console.error('Error detected ',e);
  }
  
  

}

create_broadcast_request_body(settings)
{
  try
  {
    let {start_time,end_time,...rest}  = settings;

    console.log(start_time);
    return{
      "snippet": {
        "title":settings.eventName_text ,
        "scheduledStartTime": start_time,
        "scheduledEndTime": end_time,
      },
      "contentDetails": {
        "enableClosedCaptions": true,
        "enableContentEncryption": true,
        "enableDvr": true,
        "enableEmbed": true,
        "recordFromStart": true,
        "startWithSlate": true
      },
      "status": {
        "privacyStatus": "unlisted"
      }
    }

  }
  catch(e)
  {//if for some reason settings is undefined or null or some shit like that...
    console.error('Error occured',e);
  }

}

async retrieve_refresh_token() {
  conn.connect();
  let promise = new Promise((resolve,reject)=>
  {
  conn.query("Select * from youtube_refresh_token order by refresh_token limit 1", function(err,results,fields)
  {
    if (err)
    {
      reject(err)
    }
    resolve(results);
  })
  })
  return promise;
}


async get_new_access_token(refresh_token) {
  let oauth2Client = this.create_auth_client();
  oauth2Client.credentials.refresh_token = refresh_token;
  let promise = new Promise((resolve,reject)=>
  {
    oauth2Client.refreshAccessToken((error,tokens)=>
    {
      if (error)
      {
        reject(error);
      }
      resolve(tokens);
    })
  })
  return promise;
}

async getProfileData(access_token) 
{
  const oauth2Client = new google.auth.OAuth2(
    youtubeObject.clientId,
    youtubeObject.clientSecret,
    "http://localhost:3000/destinations/auth/youtube"
  );
  
  oauth2Client.setCredentials({access_token:access_token});
  var oauth2 = google.oauth2({
    auth:oauth2Client,
    version:'v2'
  })

  let promise = new Promise((resolve,reject)=>{
    oauth2.userinfo.get(async (err,res)=>
    {
      if (err)
      {
        console.log("error trying to get user",err);
        reject(err);
      }
  
     resolve(res);
  
    });
  })

  return promise;
}

  async createBroadcast(settings)
  {
    try 
    {
      // let result = await this.retrieve_refresh_token();
      // let refresh_token = result[0].refresh_token;
      let result_access_token = await this.get_new_access_token('1//03z4jH-dUPywaCgYIARAAGAMSNwF-L9IrwL96Opy8jjkxAR0PvajD7J_E5ypTKLJqgzEMit2sep-y70YCy-RnLtAjdqLg5NrhRNg');//literally have to hardcode this.........
      let access_token = result_access_token.access_token;
      console.log('PROCESS COMPLETE',access_token);

      let requestBody = this.create_request_body(settings);
      console.log(requestBody);
      let config = {
        headers: {
          'Authorization': 'Bearer '+access_token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };

      
      let livestream_req = await axios.post(`https://youtube.googleapis.com/youtube/v3/liveStreams?part=snippet%2Ccdn%2CcontentDetails%2Cstatus&access_token=${access_token}&key=${youtubeObject.apiKey}`,{requestBody},config);
      let livestreamObject = livestream_req.data;
      console.dir(livestreamObject);
      //afterwards create broadcast object
      let request_body_broadcast = this.create_broadcast_request_body(settings);
      let broadcast_req = await axios.post(`https://youtube.googleapis.com/youtube/v3/liveBroadcasts?part=snippet%2CcontentDetails%2Cstatus&onBehalfOfContentOwner=mine&access_token=${access_token}&key=${youtubeObject.apiKey}`,{request_body_broadcast},config);
      let broadcastObject = broadcast_req.data;
      console.dir(broadcastObject);

      //afterwards bind livestream to broadcast
      let bound_broadcast_req = await axios.post(`https://youtube.googleapis.com/youtube/v3/liveBroadcasts/bind?id=${broadcastObject.id}&part=snippet&onBehalfOfContentOwner=mine&streamId=${livestreamObject.id}&key=${youtubeObject.apiKey}`,{},config);
      let bound_broadcast = bound_broadcast_req.data;
      console.dir(bound_broadcast);

      return Promise.resolve(bound_broadcast);

    }
    catch(e)
    {
      //lets assume this erorr occurs because of an invalid token...
   
      return Promise.reject(e);
    }

    
  }

}

module.exports = {
  YoutubeAuth,
}



