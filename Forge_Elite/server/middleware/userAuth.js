const jwt = require("jsonwebtoken");

const userAuth = async (req,res,next)=>{

    const token = req.headers['authorization']?.split(' ')[1];

    console.log(token);
    

    if(!token){
        return res.json({success:false,message:"Not Authorized. Login Again"});
    }

    try{
        const tokenDecode=jwt.verify(token,process.env.JWT_SECRET);

        if(tokenDecode.id){
            req.user = { id: tokenDecode.id };
            next();
        }
        else{
            return res.json({success:false,message:"Not Authorized. Login Again"});
        }
    }
    catch(err){
        res.json({success:false,message:err.message});
    }

}

module.exports=userAuth;