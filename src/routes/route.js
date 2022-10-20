const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")
const ProductContoller = require("../controller/productController")
const RouteContoller = require("../controller/cartController")
const orderController = require("../controller/orderController")

const middleware = require("../Middleware/auth")

//=====================UserApi======================================//

router.post("/register", userController.createUser)
router.post("/login", userController.loginUser)
router.get("/user/:userId/profile", middleware.Authentication, middleware.Authorization, userController.getUser)
router.put("/user/:userId/profile", middleware.Authentication, middleware.Authorization, userController.updateUserProfile)

//=====================ProductApi======================================//

router.post("/products", ProductContoller.createProduct)
router.get("/products", ProductContoller.getProducts)
router.get("/products/:productId", ProductContoller.getProductById)
router.put("/products/:productId", ProductContoller.updateProduct)
router.delete("/products/:productId", ProductContoller.deleteProductbyId)

//=====================CartApi======================================//

router.post("/users/:userId/cart", middleware.Authentication, middleware.Authorization, RouteContoller.createCart)
router.put("/users/:userId/cart", middleware.Authentication, middleware.Authorization, RouteContoller.cartUpdate)
router.get("/users/:userId/cart", middleware.Authentication, middleware.Authorization, RouteContoller.getCartById)
router.delete("/users/:userId/cart", middleware.Authentication, middleware.Authorization, RouteContoller.deleteCart)

//******************* ORDERS APIs ***************************// 

router.post("/users/:userId/orders", middleware.Authentication, middleware.Authorization, orderController.createOrder)
router.put("/users/:userId/orders", middleware.Authentication, middleware.Authorization, orderController.updateOrder)



module.exports = router;