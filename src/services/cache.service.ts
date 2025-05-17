import NodeCache from 'node-cache';
import { BidsAndAsksData, ChartData, CoinInfo } from '../interfaces/types';
import { BinanceService } from './binance.service';
import { CoinGeckoService } from './coinGecko.service';

export class CacheService {
	private cache: NodeCache;
	private binanceService: BinanceService;
	private coinGeckoService: CoinGeckoService;

	constructor() {
		this.cache = new NodeCache({
			stdTTL: 3600,
			checkperiod: 600,
			useClones: false,
			deleteOnExpire: false,
		});

		this.binanceService = new BinanceService();
		this.coinGeckoService = new CoinGeckoService();
		this.setupExpirationHandlers();
	}

	private setupExpirationHandlers(): void {
		this.cache.on('expired', async (key: string, value: any) => {
			if (key.startsWith('coins-data')) {
				console.log('Cache expired for coins data, refreshing...');
				await this.refreshCoinsData();
				console.log('Coins data cache successfully refreshed');
			} else if (
				key.startsWith('chart-data-') ||
				key.startsWith('orders-data-')
			) {
				const symbol: string =
					key.replace('chart-data-', '') || key.replace('orders-data-', '');
				console.log(`Cache expired for ${symbol}, refreshing...`);
				await this.refreshSymbolData(symbol);
				console.log(`Cache for ${symbol} successfully refreshed`);
			}
		});
	}

	async initializeCache(): Promise<void> {
		try {
			const coins: CoinInfo[] = await this.coinGeckoService.getCoins();
			const coinsCacheKey: string = 'coins-data';
			this.cache.set(coinsCacheKey, coins, 60 * 1000);
			for (const coin of coins) {
				if (coin.binanceSymbol === 'USDT') continue;
				await this.refreshSymbolData(coin.binanceSymbol);
			}
		} catch (error) {
			console.error(`Error initializing cache: `, error);
		}
	}
	async refreshCoinsData(): Promise<void> {
		try {
			const coins: CoinInfo[] = await this.coinGeckoService.getCoins();
			const coinsCacheKey: string = 'coins-data';
			this.cache.set(coinsCacheKey, coins, 20 * 60 * 1000);
		} catch (error) {
			console.error(`Error refreshing coins data: `, error);
		}
	}
	async refreshSymbolData(symbol: string): Promise<void> {
		try {
			const chartData: ChartData[] = await this.binanceService.getChartData(
				symbol
			);
			const ordersData: BidsAndAsksData =
				await this.binanceService.getOrdersData(symbol);
			if (chartData && ordersData && chartData.length > 0) {
				const chartCacheKey = `chart-data-${symbol}`;
				const ordersCacheKey = `orders-data-${symbol}`;
				this.cache.set(chartCacheKey, chartData, 20 * 60 * 1000);
				this.cache.set(ordersCacheKey, ordersData, 20 * 60 * 1000);
				console.log(`Successfully refreshed cache for ${symbol}`);
			}
		} catch (error) {
			console.error(`Error refreshing cache for ${symbol}: `, error);
		}
	}
	async getChartData(symbol: string): Promise<ChartData[] | null> {
		const cacheKey = `chart-data-${symbol}`;
		const cachedData = this.cache.get<ChartData[]>(cacheKey);
		if (cachedData) {
			const lastUpdated = this.cache.getTtl(cacheKey);
			if (lastUpdated && Date.now() - lastUpdated > 60 * 1000) {
				this.refreshSymbolData(symbol);
			}
			return cachedData;
		}
		try {
			const chartData: ChartData[] = await this.binanceService.getChartData(
				symbol
			);
			if (chartData && chartData.length > 0) {
				this.cache.set(cacheKey, chartData, 20 * 60 * 1000);
				return chartData;
			}
		} catch (error) {
			console.error(`Error fetching data for ${symbol}: `, error);
		}

		return null;
	}
	async getCoin(symbol: string): Promise<CoinInfo | null> {
		const cacheKey = 'coins-data';
		const cachedData = this.cache.get<CoinInfo[]>(cacheKey);
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
				} else {
					throw new Error(`${symbol} not founded`);
				}
			}
			this.cache.set(cacheKey, coinsData, 20 * 60 * 1000);
		} catch (error) {
			if (error === `${symbol} not founded`) {
				console.error(`${symbol} not founded: `, error);
			}
			console.error('Error fetching coins data: ', error);
		}
		return null;
	}
	async getCoins(): Promise<CoinInfo[] | null> {
		const cacheKey = 'coins-data';
		const cachedData = this.cache.get<CoinInfo[]>(cacheKey);
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
		} catch (error) {
			console.error(`Error fetching coins data: `, error);
		}
		return null;
	}

	async getOrders(symbol: string): Promise<BidsAndAsksData | null> {
		const cacheKey = `orders-data-${symbol}`;
		const cachedData = this.cache.get<BidsAndAsksData>(cacheKey);
		if (cachedData) {
			const lastUpdated = this.cache.getTtl(cacheKey);
			if (lastUpdated && Date.now() - lastUpdated > 60 * 1000) {
				this.refreshSymbolData(symbol);
			}
			return cachedData;
		}
		try {
			const orderData: BidsAndAsksData =
				await this.binanceService.getOrdersData(symbol);
			if (orderData) {
				this.cache.set(cacheKey, orderData, 20 * 60 * 1000);
				return orderData;
			}
		} catch (error) {
			console.error(`Error fetching data for ${symbol}: `, error);
		}
		return null;
	}
}
