const { google } = require("googleapis");
const { youtubeObject } = require("./constants.js");
const { connection } = require("./db.js");

class YoutubeAuth {
  
create_auth_client() {
  const oauth2Client = new google.auth.OAuth2(
    youtubeObject.clientId,
    youtubeObject.clientSecret,
    "http://localhost:3000/destinations/auth/youtube"
  );
  return oauth2Client;
}

async retrieve_refresh_token() {
  connection.connect();
  let promise = new Promise((resolve,reject)=>
  {
  connection.query("Select * from youtube_refresh_token order by refresh_token limit 1", function(err,results,fields)
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
  let oauth2Client = create_auth_client();
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

}

module.exports = {
  YoutubeAuth,
}



