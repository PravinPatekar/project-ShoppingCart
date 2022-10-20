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
    token = token.split(' ')
    // console.log(token[1])


    jwt.verify(token[1], "project5group62", function (error, decoded) {
      // console.log(decodedToken)
      if (error) return res.status(400).send("this token is invalid")
      else {
        decodedToken = decoded
        next()
      }
    })
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message })

  }
}


//=========================================[Authorisation]============================================================

const Authorization = async (req, res, next) => {
  try {


    idFromToken = decodedToken.userId

    let loggedInUser = req.params.userId;


    if (!isValidObjectId(loggedInUser))
      return res.status(400).send({ status: false, message: "Enter a valid user Id" });
    let checkUserId = await userModel.findById(loggedInUser);
    if (!checkUserId)
      return res.status(404).send({ status: false, message: "User not found" });
    let loginUser;
    
    loginUser = checkUserId.id;


    if (idFromToken !== loginUser) {
      return res.status(403).send({ status: false, message: "Error!! authorization failed" });
    } else {
      next();
    }

  } catch (error) {
    return res.status(500).send({ status: false, error: error.message });
  }
}

module.exports = { Authentication, Authorization }