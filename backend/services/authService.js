const JWT = require('jsonwebtoken')
const secretKey = process.env.JWT_SECRET

module.exports = (req, res, next) => {
       var token = req.cookies && req.cookies.authToken || false
       if(!token) {
           res.status(403).send("Invalid token");
       }

       JWT.verify(token, secretKey, function (err, results){
          if(err)
          {
            return res.status(401);
          }
          next();
      })       
}
