const { default: axios } = require('axios');
var express = require('express');
const { post } = require('./twitch');
const auth_gen = require('../utils/initialize.js');
var router = express.Router();
var {connection} = require('../utils/db.js');


router.post('/get_auth_url',function(req,res)
{     
      
      oauth2Client = auth_gen.create_auth_client();
      const scopes = ['https://www.googleapis.com/auth/youtube'];
      const url = oauth2Client.generateAuthUrl({
          access_type:'offline',
          scope:scopes
      });
      res.send({status:'200',url:url});
})

router.post('/get_access_token', function(req,res)
{
    oauth2Client= auth_gen.create_auth_client();
    connection.connect();
    let data = req.body.authData;
    let code =  decodeURIComponent(data['code']);
    oauth2Client.getToken(code,function(err,tokens)
    {
        if (err)
        {
            console.error('An error has occured getting access tokens'+err)
            auth_gen.retrieve_refresh_token()
            .then((results)=>{
                if (results.length>0)
                {
                    auth_gen.get_new_access_token(results[0].refresh_token)
                    .then(({access_token})=>
                    {
                        res.send({status:'200',access_token:access_token,error:null});
                    }).catch((error)=>
                    {
                        res.send({status:'500',access_token:null,error:error});
                    })
                    res.send()
                }
            })
            .catch((error)=>
            {
                console.error('An error has occured getting refresh tokens'+error)
                res.send({status:'500',access_token:null,error:error})

            })
        }
        else
        {
            let access_token = tokens.access_token;
            let refresh_token = tokens.refresh_token?tokens.refresh_token:'';
            if (refresh_token==='')
            {
                res.send(access_token);
            }
            else
            {
                connection.query("Insert into youtube_refresh_token values ('"+refresh_token+"')",function(err,results,fields)
                {   
                    res.send(access_token);
                })
            }
        }
    })

})

router.post('get_user_data',function(req,res)
{


})



module.exports = router;