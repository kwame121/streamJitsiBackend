const axios = require('axios');
const {twitchObject} = require('./constants.js');


class TwitchAuth 
{
    constructor(auth_data)
    {
        this.auth_data = auth_data;
    }

    async get_user(){
        try
        {
            let {access_token} = this.auth_data;
            let config = {
                headers: {
                  Authorization: "OAuth " + access_token,
                  "Client-ID": twitchObject.clientId,
                },
            };
            let request = await axios.get(`https://api.twitch.tv/kraken/user`,config);
            let {data} = request;
            return Promise.resolve(data);

        }
        catch(e)
        {
            console.error('Error occured while getting user');
            Promise.reject(e);
        }
    }

    async get_stream_credentials(userData)
    {
        try
        {
            let {_id} = userData;
            let {access_token} = this.auth_data;
            let config = {
                headers: {
                  Accept: "application/vnd.twitchtv.v5+json",
                  Authorization: "OAuth " + access_token,
                  "Client-ID": twitchObject.clientId,
                },
              };
            
            let request = await axios.get(`https://api.twitch.tv/helix/streams/key?broadcaster_id=${_id}`,config);
            let data = request.data;
            console.log(data);
            return Promise.resolve(data);
        }
        catch(e)
        {
            console.error('Error occured while getting stream credentials');
            return  Promise.reject(e);
        }

    }

    async get_ingest_urls()
    {
        try
        {
            let request  = await axios.get(`https://ingest.twitch.tv/ingests`);
            let {data} = request;
            console.log(data);
            return Promise.resolve(data);
            
        }
        catch(e)
        {
            console.error('Error occured when getting ingestion urls');
            return Promise.reject(e);        
        }


    }
}

module.exports = {
    TwitchAuth,
}

