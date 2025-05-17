import axios, { AxiosInstance } from 'axios';
import { coinLib, ids } from '../config/constants';
import { CoinGeckoResponseItem, CoinInfo } from '../interfaces/types';
export class CoinGeckoService {
	private api: AxiosInstance;
	constructor() {
		this.api = axios.create({
			baseURL: 'https://api.coingecko.com/api/v3/coins',
			timeout: 5000,
		});
	}
	async getCoins(
		vs_currency: string = 'usd',
		order: string = 'market_cap_desc',
		price_change_percentage: string = '24h'
	): Promise<CoinInfo[]> {
		try {
			const response = await this.api.get<CoinGeckoResponseItem[]>('/markets', {
				params: {
					vs_currency,
					order,
					price_change_percentage,
					ids: ids,
				},
			});
			return response.data.map(item => ({
				binanceSymbol: coinLib[item.name.replaceAll(' ', '')].binanceSymbol,
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
		} catch (error) {
			console.error(`Error in fetching coins info: `, error);
			throw error;
		}
	}
}
