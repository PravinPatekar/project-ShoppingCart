
//  const Authentication = (req,res,next)=>{

//     try {
//            let token = req.Authorization["x-api-key"]
//            if(!token){
//             return res.status(400).send({status:false,msg:"token must be present"})

//            } 
//            jwt.verify(token,"functionupisWaYwAyCoOlproject5group62",function(error,decoded){
//            if(error){
//             return res.status(401).send({status:false,msg:"this a invalid token"})
//            }else{
//             decodedtoken = decoded
//             next()
//            }

//            })
      
//     } catch (error) {
//         return res.status(500).send({status:false,message:error.error})
//     }
//  }
const jwt = require("jsonwebtoken");    // Importing JWT
const userModel = require("../model/userModel");     // Importing User Model
const  isValidobject = require("../validator/validator");  // IMPORTING VALIDATORS
const mongoose = require('mongoose')

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
            // if(!isValidobject(req.params.userId)) 
            //   return res.status(400).send({ status: false, message: "Enter a valid user Id" });
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).send({ status: false, msg: "this  UserId is not a valid Id" })
            }
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