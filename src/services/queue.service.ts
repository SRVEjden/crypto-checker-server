import Queue from 'bull';
import { CacheService } from './cache.service';
export class QueueService {
	private refreshQueue: Queue.Queue;
	private cacheService: CacheService;

	constructor(redisPort: number, redisHost: string) {
		this.cacheService = new CacheService();
		this.refreshQueue = new Queue('cache refresh', {
			redis: {
				port: redisPort,
				host: redisHost,
			},
		});
		this.setupQueue();
		this.scheduleJobs();
	}

	private setupQueue(): void {
		this.refreshQueue.process(async job => {
			if (job.data.type === 'refresh_all_symbols') {
				await this.refreshAllSymbols();
			} else if (job.data.type === 'refresh_symbol' && job.data.symbol) {
				await this.cacheService.refreshSymbolData(job.data.symbol);
			} else if (job.data.type === 'refresh_coins_data') {
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

	private scheduleJobs(): void {
		setInterval(() => {
			this.refreshQueue.add(
				{ type: 'refresh_all' },
				{
					attempts: 3,
					backoff: {
						type: 'exponential',
						delay: 1000,
					},
				}
			);
		}, 10 * 60 * 1000);
		setInterval(() => {
			this.refreshQueue.add(
				{ type: 'refresh_coins_data' },
				{
					attempts: 3,
					backoff: {
						type: 'exponential',
						delay: 15 * 1000,
					},
				}
			);
		}, 60 * 1000);
		this.refreshQueue.add({ type: 'refresh_coins_data' });
		this.refreshQueue.add({ type: 'refresh_all' });
	}

	private async refreshAllSymbols(): Promise<void> {
		try {
			const coinsData = await this.cacheService.getCoins();
			if (coinsData) {
				for (const coin of coinsData) {
					this.refreshQueue.add(
						{ type: 'refresh_symbol', symbol: coin.binanceSymbol },
						{ delay: 1000 }
					);
				}
			}
		} catch (error) {
			console.error('Error scheduling refresh jobs: ', error);
		}
	}
}
