import { config } from "dotenv";
import express from "express";
import { paymentMiddleware, Resource, type SolanaAddress } from "x402-express";
config();

const facilitatorUrl = process.env.FACILITATOR_URL as Resource;
const payTo = process.env.ADDRESS as `0x${string}` | SolanaAddress;

if (!facilitatorUrl || !payTo) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const app = express();

app.use(
  paymentMiddleware(
    payTo,
    {
      "GET /weather": {
        // USDC amount in dollars
        price: "$0.001",
        // network: "base" // uncomment for Base mainnet
        // network: "solana" // uncomment for Solana mainnet
        network: "base-sepolia",
      },
      "GET /x402-tokens": {
        // USDC amount in dollars
        price: {
          amount: "1234", // 0.001234 USDT
          asset: {
            address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
            decimals: 6,
          },
        },
        network: "polygon",
      },
    },
    {
      url: facilitatorUrl,
    },
  ),
);

app.get("/weather", (req, res) => {
  res.send({
    report: {
      weather: "sunny",
      temperature: 70,
    },
  });
});

// Premium x402 Ecosystem Token Rankings
app.get("/x402-tokens", async (req, res) => {
  const { limit = 10, vs_currency = "usd" } = req.query;
  const COINGECKO_API_KEY = "CG-Ysgx9ejVXNcPgcpqZ4gotWg7";

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${vs_currency}&category=x402-ecosystem&order=market_cap_desc&per_page=${limit}&price_change_percentage=1h%2C24h%2C7d&sparkline=true`,
      {
        headers: {
          "x-cg-api-key": COINGECKO_API_KEY,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);

    res.send({
      timestamp: new Date().toISOString(),
      category: "x402-ecosystem",
      tokens: data.map((token: any) => ({
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        price: token.current_price,
        market_cap: token.market_cap,
        volume_24h: token.total_volume,
        price_change: {
          "1h": token.price_change_percentage_1h_in_currency,
          "24h": token.price_change_percentage_24h_in_currency,
          "7d": token.price_change_percentage_7d_in_currency,
        },
        market_cap_rank: token.market_cap_rank,
        circulating_supply: token.circulating_supply,
        total_supply: token.total_supply,
        image: token.image,
      })),
      metadata: {
        total_returned: data.length,
        source: "CoinGecko",
        premium: true,
      },
    });
  } catch (error) {
    res.status(500).send({
      error: "Failed to fetch x402 token data",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get("/premium/content", (req, res) => {
  res.send({
    content: "This is premium content",
  });
});

app.listen(4021, () => {
  console.log(`Server listening at http://localhost:${4021}`);
});
