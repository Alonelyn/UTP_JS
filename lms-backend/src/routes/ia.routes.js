const express = require('express');
const router = express.Router();

const { chatIA } = require('../controllers/ia.controller');

router.post('/chat', chatIA);

module.exports = router;