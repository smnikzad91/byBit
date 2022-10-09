const { Router } = require("express")
const router = Router();

const orderController = require('./../controllers/orderController')

router.get('/orders/test', orderController.getTest)


module.exports = router;