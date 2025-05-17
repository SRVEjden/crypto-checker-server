"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coinController_1 = require("../controllers/coinController");
const router = (0, express_1.Router)();
router.get('/', coinController_1.getCoinsFromGecko);
exports.default = router;
