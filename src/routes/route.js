const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")
const ProductContoller = require("../controller/productController")
const middleware = require("../Middleware/auth")

router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)
router.get("/user/:userId/profile",middleware.Authentication,userController.getUser)
router.put("/user/:userId/profile",middleware.Authentication,middleware.Authorization,userController.updateUserProfile)
//=====================productApi======================================//
router.post("/products",ProductContoller.createProduct)
router.get("/products",ProductContoller.getProducts)
router.get("/products/:productId",ProductContoller.getProductById)
router.post("/products/:productId",ProductContoller.updateProduct)
router.delete("/products/:productId",ProductContoller.deleteProductbyId)

module.exports = router;