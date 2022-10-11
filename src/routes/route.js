const express = require("express")
const router = express.Router()
userController = require("../controller/userController")

router.post("/register",userController.createUser)
router.post("/login",userController.createUser)
router.post("/register",userController.createUser)
router.post("/register",userController.createUser)




module.exports = router;