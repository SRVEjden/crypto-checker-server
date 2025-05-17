import cors from 'cors';
import express, { Request, Response } from 'express';
import { BidsAndAsksData, ChartData, CoinInfo } from './interfaces/types';
import { CacheService } from './services/cache.service';
import { QueueService } from './services/queue.service';
export class App {
	private app: express.Application;
	private cacheService: CacheService;
	private queueService: QueueService;

	constructor(redisPort: number, redisHost: string) {
		this.app = express();
		this.cacheService = new CacheService();
		this.queueService = new QueueService(redisPort, redisHost);
		this.initializeMiddlewares();
		this.initializeRoutes();
		this.initializeCache();
	}

	private initializeMiddlewares(): void {
		this.app.use(cors());
		this.app.use(express.json());
	}

	private initializeRoutes(): void {
		this.app.get(
			'/api/chartdata/:symbol',
			async (req: Request, res: Response) => {
				const { symbol } = req.params;
				const chartData: ChartData[] | null =
					await this.cacheService.getChartData(symbol);
				if (chartData) {
					res.json(chartData);
				} else {
					res
						.status(404)
						.json({ error: 'Data not found or could not be loaded' });
				}
			}
		);

		this.app.get('/api/getcoins', async (req: Request, res: Response) => {
			const coins: CoinInfo[] | null = await this.cacheService.getCoins();
			if (coins) {
				res.json(coins);
			} else {
				res
					.status(404)
					.json({ error: 'Data not found or could not be loaded' });
			}
		});

		this.app.get(
			'/api/getorders/:symbol',
			async (req: Request, res: Response) => {
				const { symbol } = req.params;
				const bidsAndAsksData: BidsAndAsksData | null =
					await this.cacheService.getOrders(symbol);
				if (bidsAndAsksData) {
					res.json(bidsAndAsksData);
				} else {
					res
						.status(404)
						.json({ error: 'Data not found or could not be loaded' });
				}
			}
		);

		this.app.get(
			'/api/getcoin/:symbol',
			async (req: Request, res: Response) => {
				const { symbol } = req.params;
				const coin: CoinInfo | null = await this.cacheService.getCoin(symbol);
				if (coin) {
					res.json(coin);
				} else {
					res
						.status(404)
						.json({ error: 'Data not found or could not be loaded' });
				}
			}
		);
	}

	private async initializeCache(): Promise<void> {
		await this.cacheService.initializeCache();
	}
	public getApp(): express.Application {
		return this.app;
	}
}
