const { default: axios } = require("axios");
const { google } = require("googleapis");
const { youtubeObject } = require("./constants.js");
const { connection } = require("./db.js");
const {moment} = require('moment');
var mysql      = require('mysql');
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


create_bind_request_body(livestream_id,broadcast_id)
{
  return {
    "id": broadcast_id,
    "streamId" : livestream_id ,
    "part":["id","snippet","contentDetails","status"]
  }
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
  conn.query("Select * from youtube_refresh_token ", function(err,results,fields)
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
  
  const oauth2Client = this.create_auth_client();
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


async createBroadcast_Client(settings)
{
  try
  {
    let refresh_token_result = await this.retrieve_refresh_token();
    let refresh_token = refresh_token_result[refresh_token_result.length-1].refresh_token;
    let tokens  = await this.get_new_access_token(refresh_token);
    let oauth2Client = this.create_auth_client();

    oauth2Client.setCredentials({access_token:tokens.access_token,refresh_token:tokens.refresh_token,apiKey:youtubeObject.apiKey});
    let service = google.youtube({version:'v3',auth:oauth2Client});

    let livestream_result =  await service.liveStreams.insert({
      part: [
        "snippet,cdn,contentDetails,status"
      ],
      resource:this.create_request_body(settings),
    });
    let {id} = livestream_result.data;
    let broadcast_result = await service.liveBroadcasts.insert({
      part:[
        "snippet,contentDetails,status"
      ],
      resource:this.create_broadcast_request_body(settings),
    });
    let broadcast_id = broadcast_result.data.id;
    let bound_broadcast_result = await service.liveBroadcasts.bind(this.create_bind_request_body(id,broadcast_id));
    let bound_broadcast = bound_broadcast_result.data;

    //lets log this baby!
    console.log(bound_broadcast);
    return Promise.resolve(bound_broadcast);

  }
  catch(e)
  {
    console.error('error with client shit',e);
    return Promise.reject(e);
  }

}



}

module.exports = {
  YoutubeAuth,
}



