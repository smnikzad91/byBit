const { Router } = require('express')
const router = Router();

const ichimokuController = require('./../controllers/ichimokuController');

router.get('/ichimoku/test', ichimokuController.getTest)
router.get('/ichimoku/lastParam', ichimokuController.getLastParam)


module.exports = router;