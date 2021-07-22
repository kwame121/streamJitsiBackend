var router = express.Router();
var Auth = require('./Models/auth.js');

router.post('/login',Auth.verifyToken,function(req,res)
{
    let token = req.token;
    let login_data = req.body.login_data;
    

})