const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")
const ProductContoller = require("../controller/productController")
const middleware = require("../Middleware/auth")

//=====================UserApi======================================//


router.post("/register",userController.createUser)
router.post("/login",userController.loginUser)
router.get("/user/:userId/profile",middleware.Authentication,middleware.Authorization,userController.getUser)
router.put("/user/:userId/profile",middleware.Authentication,middleware.Authorization,userController.updateUserProfile)

//=====================ProductApi======================================//

router.post("/products",ProductContoller.createProduct)
router.get("/products",ProductContoller.getProducts)
router.get("/products/:productId",ProductContoller.getProductById)
router.put("/products/:productId",ProductContoller.updateProduct)
router.delete("/products/:productId",ProductContoller.deleteProductbyId)

module.exports = router;