const express = require("express")
const router = express.Router()
userController = require("../controller/userController")

router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)
router.get("/user/:userId/profile",userController.getUser)
router.put("/user/:userId/profile",userController.updateUserProfile)




module.exports = router;