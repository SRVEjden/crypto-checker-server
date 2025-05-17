export interface Config {
	port: number;
	nodeEnv: string;
	redisPort: number;
	redisHost: string;
}
export interface KlineResponseItem extends Array<string | number> {
	0: number;
	1: string;
	2: string;
	3: string;
	4: string;
	5: string;
	6: number;
	7: string;
	8: number;
}

export interface ChartData {
	time: number;
	price: number;
}
export interface OrderDataResponseItem extends Array<string> {
	0: string;
	1: string;
}
export interface OrderData {
	price: string;
	volume: string;
}

export interface BidsAndAsksData {
	bids: Array<OrderData>;
	asks: Array<OrderData>;
}
export interface OrdersDataResponse {
	lastUpdateId: number;
	bids: OrderDataResponseItem[];
	asks: OrderDataResponseItem[];
}

export interface CoinInfo {
	binanceSymbol: string;
	id: string;
	symbol: string;
	image: string;
	name: string;
	currentPrice: number;
	marketCap: number;
	totalVolume: number;
	circulatingSupply: number;
	totalSupply: number;
	priceChange24h: number;
	priceChangePercentage24h: number;
}

export interface CoinGeckoResponseItem {
	id: string;
	symbol: string;
	name: string;
	image: string;
	current_price: number;
	total_volume: number;
	price_change_24h: number;
	price_change_percentage_24h: number;
	circulating_supply: number;
	total_supply: number;
	market_cap: number;
}
