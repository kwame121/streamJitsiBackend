var mysql = require('mysql');
var {nanoid} = require('nanoid');
var {authObject} = require('.../utils/constants.js');
const bcrypt = require('bcrypt');
const saltRounds = 10;



function log_error(error,error_object={})
{
    this.error = error;
    this.exception = 'Authentication Exception';
    this.error_object = error_object;
}

class User 
{
    constructor()
    {
        this.connectionObject = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : '',
            database : 'streamjitsi'
        });
    }

    login_user(userObject)
    {
        let {username,password} = userObject;
        let query1 = 'Select * from user where username = username order by user_id limit 1 ';
        return new Promise((resolve,reject)=>{
            this.connectionObject.query(query1,function(error,results,fields){
                if (error)
                {
                    resolve(new log_error('mysql error occured',error));
                }
                let {username,password_hash} = results[0];
                bcrypt.compare(password,password_hash,function(error,same)
                {
                    if (error){
                        reject(new log_error('An error occured comparing passwords'));
                    }
                    else
                    {
                       if (same)
                       {
                           jwt.sign({username:username},authObject.JWT_SECRET,(err,token)=>
                           {
                               if (err)
                               {
                                   reject(new log_error('An error occured signing with jwt token'))
                               }
                               else
                               {
                                   resolve(token);
                               }
                           })
                       }
                       else
                       {
                           
                       }
                    }
                })
            })
        })
    }

    register_user(userObject)
    {
        let {username,password,email,name} = userObject;
        let user_id = nanoid(10);
        return new Promise((resolve,reject)=>
        {
            bcrypt.hash(password,saltRounds,function(error,hash)
            {
                if (error)
                {
                    reject(new log_error('An error occured hashing the password'));
                }
                else
                {
                    let password_hash = hash;
                    let query = 'Insert into user values ';
                    this.connectionObject.query(query,function(err,res,fields)
                    {
                        if (err)
                        {
                            reject(err);
                        }
                        else
                        {
                            jwt.sign({username:username},authObject.JWT_SECRET,(err,token)=>
                            {
                                if (err)
                                {
                                    console.error('JWT ERROR'+err);
                                    reject(new log_error('Error occured signing jwt token'));
                                }
                                else
                                resolve(token);
                            })
    
                        }
                    })
                }
            })
        })
    }
    }