const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")
const middleware = require("../Middleware/auth")

router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)
router.get("/user/:userId/profile",middleware.Authentication,userController.getUser)
router.put("/user/:userId/profile",middleware.Authentication,middleware.Authorization,userController.updateUserProfile)




module.exports = router;