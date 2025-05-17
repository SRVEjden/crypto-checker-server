"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const bull_1 = __importDefault(require("bull"));
const cache_service_1 = require("./cache.service");
class QueueService {
    refreshQueue;
    cacheService;
    constructor(redisPort, redisHost) {
        this.cacheService = new cache_service_1.CacheService();
        this.refreshQueue = new bull_1.default('cache refresh', {
            redis: {
                port: redisPort,
                host: redisHost,
            },
        });
        this.setupQueue();
        this.scheduleJobs();
    }
    setupQueue() {
        this.refreshQueue.process(async (job) => {
            if (job.data.type === 'refresh_all_symbols') {
                await this.refreshAllSymbols();
            }
            else if (job.data.type === 'refresh_symbol' && job.data.symbol) {
                await this.cacheService.refreshSymbolData(job.data.symbol);
            }
            else if (job.data.type === 'refresh_coins_data') {
                await this.cacheService.refreshCoinsData();
            }
        });
        this.refreshQueue.on('failed', (job, error) => {
            console.error(`Job ${job.id} failed: `, error.message);
        });
        this.refreshQueue.on('completed', job => {
            console.log(`Job ${job.id} completed`);
        });
    }
    scheduleJobs() {
        setInterval(() => {
            this.refreshQueue.add({ type: 'refresh_all' }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 1000,
                },
            });
        }, 10 * 60 * 1000);
        setInterval(() => {
            this.refreshQueue.add({ type: 'refresh_coins_data' }, {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 15 * 1000,
                },
            });
        }, 60 * 1000);
        this.refreshQueue.add({ type: 'refresh_coins_data' });
        this.refreshQueue.add({ type: 'refresh_all' });
    }
    async refreshAllSymbols() {
        try {
            const coinsData = await this.cacheService.getCoins();
            if (coinsData) {
                for (const coin of coinsData) {
                    this.refreshQueue.add({ type: 'refresh_symbol', symbol: coin.binanceSymbol }, { delay: 1000 });
                }
            }
        }
        catch (error) {
            console.error('Error scheduling refresh jobs: ', error);
        }
    }
}
exports.QueueService = QueueService;
