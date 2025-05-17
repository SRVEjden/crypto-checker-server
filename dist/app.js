"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const cache_service_1 = require("./services/cache.service");
const queue_service_1 = require("./services/queue.service");
class App {
    app;
    cacheService;
    queueService;
    constructor(redisPort, redisHost) {
        this.app = (0, express_1.default)();
        this.cacheService = new cache_service_1.CacheService();
        this.queueService = new queue_service_1.QueueService(redisPort, redisHost);
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeCache();
    }
    initializeMiddlewares() {
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.json());
    }
    initializeRoutes() {
        this.app.get('/api/chartdata/:symbol', async (req, res) => {
            const { symbol } = req.params;
            const chartData = await this.cacheService.getChartData(symbol);
            if (chartData) {
                res.json(chartData);
            }
            else {
                res
                    .status(404)
                    .json({ error: 'Data not found or could not be loaded' });
            }
        });
        this.app.get('/api/getcoins', async (req, res) => {
            const coins = await this.cacheService.getCoins();
            if (coins) {
                res.json(coins);
            }
            else {
                res
                    .status(404)
                    .json({ error: 'Data not found or could not be loaded' });
            }
        });
        this.app.get('/api/getorders/:symbol', async (req, res) => {
            const { symbol } = req.params;
            const bidsAndAsksData = await this.cacheService.getOrders(symbol);
            if (bidsAndAsksData) {
                res.json(bidsAndAsksData);
            }
            else {
                res
                    .status(404)
                    .json({ error: 'Data not found or could not be loaded' });
            }
        });
        this.app.get('/api/getcoin/:symbol', async (req, res) => {
            const { symbol } = req.params;
            const coin = await this.cacheService.getCoin(symbol);
            if (coin) {
                res.json(coin);
            }
            else {
                res
                    .status(404)
                    .json({ error: 'Data not found or could not be loaded' });
            }
        });
    }
    async initializeCache() {
        await this.cacheService.initializeCache();
    }
    getApp() {
        return this.app;
    }
}
exports.App = App;
