import { env } from "../../common/env";
import { Topic } from "./topic";

export async function getMockClientAuths() {
  return [
    {
      apiKey: env.BYBIT_API_KEY,
      apiSecret: env.BYBIT_API_SECRET,
      testnet: true,
    },
  ];
}

export async function getMockTopics(): Promise<Topic[]> {
  return ["kline.1.BTCUSDT", "kline.3.BTCUSDT", "kline.3.ETHUSDT"];
}
