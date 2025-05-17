import axios, { AxiosInstance } from 'axios';
import {
	BidsAndAsksData,
	ChartData,
	KlineResponseItem,
	OrderData,
	OrdersDataResponse,
} from '../interfaces/types';

export class BinanceService {
	private api: AxiosInstance;
	constructor() {
		this.api = axios.create({
			baseURL: 'https://api.binance.com/api/v3',
			timeout: 5000,
		});
	}

	async getChartData(
		symbol: string = 'BTC',
		interval: string = '1d',
		limit: number = 1000
	): Promise<ChartData[]> {
		try {
			const response = await this.api.get<KlineResponseItem[]>('/klines', {
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
		} catch (error) {
			console.error(`Error on fetching ${symbol} kline data `, error);
			throw error;
		}
	}

	async getOrdersData(
		symbol: string = 'BTC',
		limit: number = 100
	): Promise<BidsAndAsksData> {
		try {
			const response = await this.api.get<OrdersDataResponse>('/depth', {
				params: {
					symbol: `${symbol}USDT`,
					limit,
				},
			});
			const bids: OrderData[] = response.data.bids.map(item => ({
				price: item[0],
				volume: item[1],
			}));
			const asks: OrderData[] = response.data.asks.map(item => ({
				price: item[0],
				volume: item[1],
			}));
			return {
				bids,
				asks,
			};
		} catch (error) {
			console.error(`Error on fetching ${symbol} orders data `, error);
			throw error;
		}
	}
}
