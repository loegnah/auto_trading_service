import { KlineIntervalV3, RestClientV5 } from "bybit-api";
import dayjs from "dayjs";
import { Kline } from "@/coin/bybit/bybit.type";

export class BybitClient {
  private readonly client: RestClientV5;

  constructor({
    apiKey: key,
    apiSecret: secret,
    testnet,
  }: {
    apiKey: string;
    apiSecret: string;
    testnet: boolean;
  }) {
    this.client = new RestClientV5({ key, secret, testnet });
    console.debug(`[bybit-client] "${key}" created`);
  }

  async getKlines({
    symbol,
    interval,
    count,
    endTimeStamp = dayjs().unix(),
  }: {
    symbol: string;
    interval: KlineIntervalV3;
    count: number;
    endTimeStamp?: number;
  }): Promise<Kline[]> {
    const klines = await this.client.getKline({
      category: "linear",
      symbol,
      interval,
      end: endTimeStamp,
      // count + 1 이유: endTimeStamp가 startTime 기준으로 적용되서
      // 마지막 하나의 캔들은 미완성 상태여서 제거하기 위함.
      limit: count + 1,
    });

    return klines.result.list.slice(1).map((data) => ({
      start: Number(data[0]),
      open: Number(data[1]),
      high: Number(data[2]),
      low: Number(data[3]),
      close: Number(data[4]),
    }));
  }

  async createOrder({
    positionSide,
    orderType,
    symbol,
    qty,
    price,
    takeProfit,
    stopLoss,
  }: {
    positionSide: "long" | "short";
    orderType: "Market" | "Limit";
    symbol: string;
    qty: number;
    price?: number;
    takeProfit?: number; // not percent, just base coin value
    stopLoss?: number; // not percent, just base coin value
  }) {
    return this.client.submitOrder({
      category: "linear",
      side: positionSide === "long" ? "Buy" : "Sell",
      orderType,
      price: price?.toString(),
      symbol,
      qty: qty.toString(),
      tpslMode: "Full",
      takeProfit: takeProfit?.toString(),
      stopLoss: stopLoss?.toString(),
    });
  }

  async closePosition({
    symbol,
    positionSide,
  }: {
    symbol: string;
    positionSide: "long" | "short";
  }) {
    return this.client.submitOrder({
      category: "linear",
      side: positionSide === "long" ? "Sell" : "Buy",
      orderType: "Market",
      symbol,
      qty: "0",
      reduceOnly: true,
    });
  }

  async getPositions({
    symbol,
    settleCoin,
  }: {
    symbol?: string;
    settleCoin?: string;
  }) {
    return this.client.getPositionInfo({
      category: "linear",
      settleCoin,
      symbol,
    });
  }

  async getLeverage({ symbol }: { symbol: string }) {
    const positionInfo = await this.client.getPositionInfo({
      category: "linear",
      symbol,
    });

    return positionInfo.result.list.length
      ? positionInfo.result.list[0].leverage
      : null;
  }

  async setLeverage({
    symbol,
    leverage,
  }: {
    symbol: string;
    leverage: number;
  }) {
    const ret = await this.client.setLeverage({
      category: "linear",
      symbol,
      buyLeverage: leverage.toString(),
      sellLeverage: leverage.toString(),
    });
    if (ret.retMsg !== "OK") {
      throw new Error(ret.retMsg);
    }
    return leverage;
  }

  async setTpsl({
    symbol,
    takeProfit,
    stopLoss,
  }: {
    symbol: string;
    takeProfit?: number;
    stopLoss?: number;
  }) {
    const ret = await this.client.setTradingStop({
      category: "linear",
      symbol,
      tpslMode: "Full",
      positionIdx: 0,
      takeProfit: takeProfit?.toString(),
      stopLoss: stopLoss?.toString(),
    });
    if (ret.retMsg !== "OK") {
      throw new Error(ret.retMsg);
    }
    return ret;
  }
}
