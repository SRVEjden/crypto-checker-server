"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const binance_service_1 = require("./binance.service");
const coinGecko_service_1 = require("./coinGecko.service");
class CacheService {
    cache;
    binanceService;
    coinGeckoService;
    constructor() {
        this.cache = new node_cache_1.default({
            stdTTL: 3600,
            checkperiod: 600,
            useClones: false,
            deleteOnExpire: false,
        });
        this.binanceService = new binance_service_1.BinanceService();
        this.coinGeckoService = new coinGecko_service_1.CoinGeckoService();
        this.setupExpirationHandlers();
    }
    setupExpirationHandlers() {
        this.cache.on('expired', async (key, value) => {
            if (key.startsWith('coins-data')) {
                console.log('Cache expired for coins data, refreshing...');
                await this.refreshCoinsData();
                console.log('Coins data cache successfully refreshed');
            }
            else if (key.startsWith('chart-data-') ||
                key.startsWith('orders-data-')) {
                const symbol = key.replace('chart-data-', '') || key.replace('orders-data-', '');
                console.log(`Cache expired for ${symbol}, refreshing...`);
                await this.refreshSymbolData(symbol);
                console.log(`Cache for ${symbol} successfully refreshed`);
            }
        });
    }
    async initializeCache() {
        try {
            const coins = await this.coinGeckoService.getCoins();
            const coinsCacheKey = 'coins-data';
            this.cache.set(coinsCacheKey, coins, 60 * 1000);
            for (const coin of coins) {
                if (coin.binanceSymbol === 'USDT')
                    continue;
                await this.refreshSymbolData(coin.binanceSymbol);
            }
        }
        catch (error) {
            console.error(`Error initializing cache: `, error);
        }
    }
    async refreshCoinsData() {
        try {
            const coins = await this.coinGeckoService.getCoins();
            const coinsCacheKey = 'coins-data';
            this.cache.set(coinsCacheKey, coins, 20 * 60 * 1000);
        }
        catch (error) {
            console.error(`Error refreshing coins data: `, error);
        }
    }
    async refreshSymbolData(symbol) {
        try {
            const chartData = await this.binanceService.getChartData(symbol);
            const ordersData = await this.binanceService.getOrdersData(symbol);
            if (chartData && ordersData && chartData.length > 0) {
                const chartCacheKey = `chart-data-${symbol}`;
                const ordersCacheKey = `orders-data-${symbol}`;
                this.cache.set(chartCacheKey, chartData, 20 * 60 * 1000);
                this.cache.set(ordersCacheKey, ordersData, 20 * 60 * 1000);
                console.log(`Successfully refreshed cache for ${symbol}`);
            }
        }
        catch (error) {
            console.error(`Error refreshing cache for ${symbol}: `, error);
        }
    }
    async getChartData(symbol) {
        const cacheKey = `chart-data-${symbol}`;
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) {
            const lastUpdated = this.cache.getTtl(cacheKey);
            if (lastUpdated && Date.now() - lastUpdated > 60 * 1000) {
                this.refreshSymbolData(symbol);
            }
            return cachedData;
        }
        try {
            const chartData = await this.binanceService.getChartData(symbol);
            if (chartData && chartData.length > 0) {
                this.cache.set(cacheKey, chartData, 20 * 60 * 1000);
                return chartData;
            }
        }
        catch (error) {
            console.error(`Error fetching data for ${symbol}: `, error);
        }
        return null;
    }
    async getCoin(symbol) {
        const cacheKey = 'coins-data';
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) {
            const lastUpdated = this.cache.getTtl(cacheKey);
            if (lastUpdated && Date.now() - lastUpdated > 60 * 1000) {
                this.refreshCoinsData();
            }
            for (const coin of cachedData) {
                if (coin.id === symbol) {
                    return coin;
                }
            }
        }
        try {
            const coinsData = await this.coinGeckoService.getCoins();
            for (const coin of coinsData) {
                if (coin.id === symbol) {
                    return coin;
                }
                else {
                    throw new Error(`${symbol} not founded`);
                }
            }
            this.cache.set(cacheKey, coinsData, 20 * 60 * 1000);
        }
        catch (error) {
            if (error === `${symbol} not founded`) {
                console.error(`${symbol} not founded: `, error);
            }
            console.error('Error fetching coins data: ', error);
        }
        return null;
    }
    async getCoins() {
        const cacheKey = 'coins-data';
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) {
            const lastUpdated = this.cache.getTtl(cacheKey);
            if (lastUpdated && Date.now() - lastUpdated > 60 * 1000) {
                this.refreshCoinsData();
            }
            return cachedData;
        }
        try {
            const coinsData = await this.coinGeckoService.getCoins();
            this.cache.set(cacheKey, coinsData, 20 * 60 * 1000);
            return coinsData;
        }
        catch (error) {
            console.error(`Error fetching coins data: `, error);
        }
        return null;
    }
    async getOrders(symbol) {
        const cacheKey = `orders-data-${symbol}`;
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) {
            const lastUpdated = this.cache.getTtl(cacheKey);
            if (lastUpdated && Date.now() - lastUpdated > 60 * 1000) {
                this.refreshSymbolData(symbol);
            }
            return cachedData;
        }
        try {
            const orderData = await this.binanceService.getOrdersData(symbol);
            if (orderData) {
                this.cache.set(cacheKey, orderData, 20 * 60 * 1000);
                return orderData;
            }
        }
        catch (error) {
            console.error(`Error fetching data for ${symbol}: `, error);
        }
        return null;
    }
}
exports.CacheService = CacheService;
