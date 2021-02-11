const jwt = require('jsonwebtoken');

verifyToken = (req, res, next) => {
  let token = req.cookies["refreshToken"];
  
  if (!token) {
    res.redirect('/login')
   //return res.status(403).send({ message: "No token provided!" });
  } else {
    jwt.verify(token, "refreshToken", (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized!" });
      }
     
 let access = req.cookies['x-access-token']
     if (!access) {
        let accessToken = jwt.sign({
         userId: decoded.userId,
         name:decoded.name
        },"accessToken", { 
          expiresIn: "30s"
        })

        res.cookie("x-access-token", accessToken,{maxAge:30*1000});
      }
    req.userObj = decoded;
     
      next();
    });
  }
};
module.exports = {
  verifyToken
}