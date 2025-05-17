"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinGeckoService = void 0;
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../config/constants");
class CoinGeckoService {
    api;
    constructor() {
        this.api = axios_1.default.create({
            baseURL: 'https://api.coingecko.com/api/v3/coins',
            timeout: 5000,
        });
    }
    async getCoins(vs_currency = 'usd', order = 'market_cap_desc', price_change_percentage = '24h') {
        try {
            const response = await this.api.get('/markets', {
                params: {
                    vs_currency,
                    order,
                    price_change_percentage,
                    ids: constants_1.ids,
                },
            });
            return response.data.map(item => ({
                binanceSymbol: constants_1.coinLib[item.name.replaceAll(' ', '')].binanceSymbol,
                id: item.id,
                symbol: item.symbol,
                name: item.name,
                image: item.image,
                currentPrice: item.current_price,
                marketCap: item.market_cap,
                totalVolume: item.total_volume,
                circulatingSupply: item.circulating_supply,
                totalSupply: item.total_supply,
                priceChange24h: item.price_change_24h,
                priceChangePercentage24h: item.price_change_percentage_24h,
            }));
        }
        catch (error) {
            console.error(`Error in fetching coins info: `, error);
            throw error;
        }
    }
}
exports.CoinGeckoService = CoinGeckoService;
