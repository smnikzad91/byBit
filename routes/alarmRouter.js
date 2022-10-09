const { Router } = require('express')
const router = Router();
const alarmController = require('./../controllers/alarmController')

router.get('/alarms/test', alarmController.getTest)


router.get('/alarms', alarmController.getIndex)
router.post('/alarms/new', alarmController.postNew)
router.get('/alarms/deactive/:id', alarmController.getDeactive)
router.get('/alarms/active/:id', alarmController.getActive)
router.get('/alarms/delete/:type/:id', alarmController.getDelete)


module.exports = router;