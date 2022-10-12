const jwt = require("jsonwebtoken");    // Importing JWT
const userModel = require("../model/userModel");     // Importing User Model
const mongoose = require('mongoose')


const isValidObjectId = function (objectid) {
  return mongoose.Types.ObjectId.isValid(objectid)
}

//=================================================   [MIDDLEWARES]  ===========================================================//

const Authentication = async function (req, res, next) {
    try {
        let token = (req.headers.authorization)
  
  
        if (!token) {
            return res.status(400).send({ status: false, message: 'You are not logged in, Please login to proceed your request,Add token' })
        }
        token=token.split(' ')
        console.log(typeof token[1])
        let decodedToken
        try {
            decodedToken = jwt.verify(token[1], "group45")
            console.log(decodedToken)
        } catch (error) {
            return res.status(400).send({ status: false, msg: "INVALID TOKEN" })
        }
        req.userId = decodedToken.userId
        next();
  
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
  
    }
  }
  
  
  //=========================================[Authorisation]============================================================
  
  const Authorization = async (req, res, next) => {
      try {
          let loggedInUser = req.params.userId;
        //   let loginUser;
          
          if(loggedInUser){
             if(!isValidObjectId(req.params.userId)) 
               return res.status(400).send({ status: false, message: "Enter a valid user Id" });
            let checkUserId = await userModel.findById(req.params.userId);
            if(!checkUserId) 
              return res.status(404).send({ status: false, message: "User not found" });
            
            loginUser = checkUserId._id.toString();
          }
      
          if(loggedInUser !== loginUser) 
            return res.status(403).send({ status: false, message: "Error!! authorization failed" });
          
          next();
        } catch (error) {
          return res.status(500).send({ status: false, error: error.message });
        }
      }
  
      module.exports={Authentication, Authorization}