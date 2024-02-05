const JWT_SECRET = require("./config");
const jwt = require("jsonwebtoken");


const authMiddleware = (req,res,next)=>{
    const bearerToken = req.header.authorization;

    if(!bearerToken || bearerToken.startsWith('Bearer ')){
        return res.status(403).json({})
    }


    const jwtToken = bearerToken.split(" ")[1];

    try{

        const ver = jwt.verify(jwtToken, JWT_SECRET);
        req.userId = ver.userId;
        next();
    }
    catch(err){
            return res.status(403).json({})

    }
};

module.exports = {
    authMiddleware
}