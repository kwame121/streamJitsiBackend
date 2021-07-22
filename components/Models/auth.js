const jwt = require("jsonwebtoken");

 class Auth 
{
    static verifyToken(req,res,next)
    {
        const bearerHeader = req.headers["authorization"];
        if (typeof bearerHeader !=="undefined")
        {
            const auth_token = bearerHeader.split("")[1];
            req.token = auth_token;
            next();
        }

        else
        {
            //we could even add more detail to this...
            res.send({status:'403',error:'Token Authorization failed'});
        }

    }
    
}

module.exports = {Auth}