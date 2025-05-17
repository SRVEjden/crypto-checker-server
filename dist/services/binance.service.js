"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinanceService = void 0;
const axios_1 = __importDefault(require("axios"));
class BinanceService {
    api;
    constructor() {
        this.api = axios_1.default.create({
            baseURL: 'https://api.binance.com/api/v3',
            timeout: 5000,
        });
    }
    async getChartData(symbol = 'BTC', interval = '1d', limit = 1000) {
        try {
            const response = await this.api.get('/klines', {
                params: {
                    symbol: `${symbol}USDT`,
                    interval,
                    limit,
                },
            });
            return response.data.map(item => ({
                time: item[0],
                price: Number(item[2]) + Number(item[3]) / 2,
            }));
        }
        catch (error) {
            console.error(`Error on fetching ${symbol} kline data `, error);
            throw error;
        }
    }
    async getOrdersData(symbol = 'BTC', limit = 100) {
        try {
            const response = await this.api.get('/depth', {
                params: {
                    symbol: `${symbol}USDT`,
                    limit,
                },
            });
            const bids = response.data.bids.map(item => ({
                price: item[0],
                volume: item[1],
            }));
            const asks = response.data.asks.map(item => ({
                price: item[0],
                volume: item[1],
            }));
            return {
                bids,
                asks,
            };
        }
        catch (error) {
            console.error(`Error on fetching ${symbol} orders data `, error);
            throw error;
        }
    }
}
exports.BinanceService = BinanceService;
