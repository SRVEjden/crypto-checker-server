"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoinsFromGecko = void 0;
const coinGecko_service_1 = require("../services/coinGecko.service");
const coinGeckoService = new coinGecko_service_1.CoinGeckoService();
const getCoinsFromGecko = async (req, res, next) => {
    const page = Number(req.query.page);
    const data = await coinGeckoService.getCoins();
    res.json(data.slice((page - 1) * 50, page * 50));
};
exports.getCoinsFromGecko = getCoinsFromGecko;
