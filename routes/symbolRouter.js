const { Router } = require('express')
const router = Router();
const symbolController = require('./../controllers/symbolController')

router.get('/symbol', symbolController.getIndex)
router.get('/symbol/test', symbolController.getTest)
router.get('/symbol/bestForLong', symbolController.getBestForLong)

module.exports = router;