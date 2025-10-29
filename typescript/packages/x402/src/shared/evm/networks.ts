import { config } from "dotenv";
import { Token } from "brewit";
config();

export enum Network {
  ethereum = "ethereum",
  polygontestnet = "polygontestnet",
  base = "base",
  basesepolia = "basesepolia",
  polygon = "polygon",
  sepolia = "sepolia",
  optimism = "optimism",
  optimismsepolia = "optimismsepolia",
  arbitrum = "arbitrum",
  bsc = "bsc",
  gnosis = "gnosis",
  monadtestnet = "monadtestnet",
}

interface NetworkConfig {
  name: string;
  lifiKey: string;
  id: string;
  type: "mainnet" | "testnet";
  display: boolean;
  chainId: number;
  icon: string;
  url: string;
  bundler: string;
  blockExplorer: string;
  gasFeeInfo: {
    token: string;
    sponsorPolicy: "sponsor" | "paymaster";
  };
}

export const networks: Record<Network, NetworkConfig> = {
  ethereum: {
    name: "Ethereum",
    lifiKey: "ETH",
    id: "ethereum",
    type: "mainnet",
    display: true,
    chainId: 1,
    gasFeeInfo: {
      token: "eth",
      sponsorPolicy: "paymaster",
    },

    icon: "/networks/ethereum.png",
    url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    bundler: `https://api.pimlico.io/v2/ethereum/rpc?apikey=${process.env.PIMLICO_API_KEY}`,
    blockExplorer: "https://etherscan.io",
  },

  base: {
    name: "Base",
    lifiKey: "BAS",
    id: "base",
    type: "mainnet",
    display: true,
    chainId: 8453,
    gasFeeInfo: {
      token: "eth",
      sponsorPolicy: "sponsor",
    },
    icon: "/networks/base.png",
    url: `https://base-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    bundler: `https://api.pimlico.io/v2/base/rpc?apikey=${process.env.PIMLICO_API_KEY}`,
    blockExplorer: "https://basescan.org",
  },

  polygontestnet: {
    name: "Polygon Amoy",
    id: "polygon-amoy",
    lifiKey: "POL",
    type: "testnet",
    display: false,
    chainId: 80002,
    gasFeeInfo: {
      token: "pol",
      sponsorPolicy: "sponsor",
    },
    icon: "/networks/polygon.png",
    url: `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    bundler: `https://api.pimlico.io/v2/polygon-amoy/rpc?apikey=${process.env.PIMLICO_API_KEY}`,
    blockExplorer: "https://polygonscan.com",
  },

  polygon: {
    name: "Polygon",
    id: "polygon",
    lifiKey: "POL",
    type: "mainnet",
    display: true,
    chainId: 137,
    gasFeeInfo: {
      token: "pol",
      sponsorPolicy: "sponsor",
    },
    icon: "/networks/polygon.png",
    url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    bundler: `https://api.pimlico.io/v2/polygon/rpc?apikey=${process.env.PIMLICO_API_KEY}`,
    blockExplorer: "https://polygonscan.com",
  },
  optimism: {
    name: "Optimism",
    id: "optimism",
    lifiKey: "OPT",
    type: "mainnet",
    display: true,
    chainId: 10,
    gasFeeInfo: {
      token: "eth",
      sponsorPolicy: "sponsor",
    },
    icon: "/networks/optimism.png",
    url: `https://opt-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    bundler: `https://api.pimlico.io/v2/optimism/rpc?apikey=${process.env.PIMLICO_API_KEY}`,
    blockExplorer: "https://optimistic.etherscan.io",
  },
  optimismsepolia: {
    name: "Optimism Sepolia",
    id: "optimism-sepolia",
    lifiKey: "OPT",
    type: "testnet",
    display: false,
    chainId: 11155420,
    gasFeeInfo: {
      token: "eth",
      sponsorPolicy: "sponsor",
    },
    icon: "/networks/optimism.png",
    url: `https://opt-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    bundler: `https://api.pimlico.io/v2/optimism-sepolia/rpc?apikey=${process.env.PIMLICO_API_KEY}`,
    blockExplorer: "https://sepolia-optimism.etherscan.io",
  },
  arbitrum: {
    name: "Arbitrum",
    id: "arbitrum",
    lifiKey: "ARB",
    type: "mainnet",
    display: true,
    chainId: 42161,
    gasFeeInfo: {
      token: "eth",
      sponsorPolicy: "sponsor",
    },
    icon: "/networks/arbitrum.png",
    url: `https://arb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    bundler: `https://api.pimlico.io/v2/arbitrum/rpc?apikey=${process.env.PIMLICO_API_KEY}`,
    blockExplorer: "https://arbiscan.io",
  },
  gnosis: {
    name: "Gnosis Chain",
    id: "xdai",
    lifiKey: "DAI",
    type: "mainnet",
    display: true,
    chainId: 100,
    gasFeeInfo: {
      token: "xdai",
      sponsorPolicy: "sponsor",
    },
    icon: "/networks/gnosis.png",
    url: `https://gnosis-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    bundler: `https://api.pimlico.io/v2/gnosis/rpc?apikey=${process.env.PIMLICO_API_KEY}`,
    blockExplorer: "https://gnosisscan.io",
  },
  bsc: {
    name: "Binance Smart Chain",
    id: "binance-smart-chain",
    lifiKey: "BSC",
    type: "mainnet",
    display: true,
    chainId: 56,
    gasFeeInfo: {
      token: "bnb",
      sponsorPolicy: "sponsor",
    },
    icon: "/networks/bsc.png",
    url: `https://bnb-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    bundler: `https://api.pimlico.io/v2/binance/rpc?apikey=${process.env.PIMLICO_API_KEY}`,
    blockExplorer: "https://bscscan.com",
  },
  sepolia: {
    name: "Ethereum Sepolia",
    id: "ethereum-sepolia",
    lifiKey: "ETH",
    type: "testnet",
    display: true,
    chainId: 11155111,
    gasFeeInfo: {
      token: "eth",
      sponsorPolicy: "sponsor",
    },
    icon: "/networks/ethereum.png",
    url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    bundler: `https://api.pimlico.io/v2/sepolia/rpc?apikey=${process.env.PIMLICO_API_KEY}`,
    blockExplorer: "https://sepolia.etherscan.io",
  },
  monadtestnet: {
    name: "Monad Testnet",
    id: "monad-test-v2",
    lifiKey: "MON",
    type: "testnet",
    display: true,
    chainId: 10143,
    gasFeeInfo: {
      token: "mon",
      sponsorPolicy: "sponsor",
    },
    icon: "/networks/monad.svg",
    url: `https://monad-testnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    bundler: `https://api.pimlico.io/v2/monad-testnet/rpc?apikey=${process.env.PIMLICO_API_KEY}`,
    // bundler: `http://0.0.0.0:3001`,
    blockExplorer: "https://testnet.monadexplorer.com/",
  },
  basesepolia: {
    name: "Base Sepolia",
    id: "base-sepolia",
    lifiKey: "BAS",
    type: "testnet",
    display: false,
    chainId: 84532,
    gasFeeInfo: {
      token: "eth",
      sponsorPolicy: "sponsor",
    },
    icon: "/networks/base.png",
    url: `https://base-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    bundler: `https://api.pimlico.io/v2/base-sepolia/rpc?apikey=${process.env.PIMLICO_API_KEY}`,
    blockExplorer: "https://sepolia.basescan.org",
  },
};

export const paymasterTokens: Record<Network, Token[]> = {
  ethereum: [
    {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      iconUrl: "https://cdn.zerion.io/eth.png",
      address: "0x0000000000000000000000000000000000000000",
      chain: { id: "ethereum", chainId: 1, name: "Ethereum" },
      tokenId: "eth",
    },
    {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      iconUrl: "https://cdn.zerion.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      chain: { id: "ethereum", chainId: 1, name: "Ethereum" },
      tokenId: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    },
    {
      name: "Lido Staked ETH",
      symbol: "stETH",
      decimals: 18,
      iconUrl: "https://cdn.zerion.io/0xae7ab96520de3a18e5e111b5eaab095312d7fe84.png",
      address: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
      chain: { id: "ethereum", chainId: 1, name: "Ethereum" },
      tokenId: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
    },
    {
      name: "Lido Wrapped Staked ETH",
      symbol: "wstETH",
      decimals: 18,
      iconUrl: "https://cdn.zerion.io/0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0.png",
      address: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
      chain: { id: "ethereum", chainId: 1, name: "Ethereum" },
      tokenId: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
    },
    {
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      iconUrl: "https://cdn.zerion.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      chain: { id: "ethereum", chainId: 1, name: "Ethereum" },
      tokenId: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    },
    {
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
      iconUrl: "https://cdn.zerion.io/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png",
      address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      chain: { id: "ethereum", chainId: 1, name: "Ethereum" },
      tokenId: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    },
    {
      name: "Tether Gold",
      symbol: "XAUt",
      decimals: 6,
      iconUrl: "",
      address: "0x68749665ff8d2d112fa859aa293f07a622782f38",
      chain: { id: "ethereum", chainId: 1, name: "Ethereum" },
      tokenId: "0x68749665ff8d2d112fa859aa293f07a622782f38",
    },
  ],
  base: [
    {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      iconUrl: "https://cdn.zerion.io/eth.png",
      address: "0x0000000000000000000000000000000000000000",
      chain: {
        id: "base",
        chainId: 8453,
        name: "Base",
      },
      tokenId: "eth",
    },
    {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      iconUrl: "https://cdn.zerion.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
      address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
      chain: {
        id: "base",
        chainId: 8453,
        name: "Base",
      },
      tokenId: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    },
    {
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      iconUrl: "https://cdn.zerion.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
      address: "0xfde4c96c8593536e31f229ea8f37b2ada2699bb2",
      chain: {
        id: "base",
        chainId: 8453,
        name: "Base",
      },
      tokenId: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    },
  ],
  polygon: [
    {
      name: "Polygon",
      symbol: "POL",
      decimals: 18,
      iconUrl: "https://cdn.zerion.io/7560001f-9b6d-4115-b14a-6c44c4334ef2.png",
      address: "0x0000000000000000000000000000000000001010",
      chain: {
        id: "polygon",
        chainId: 137,
        name: "Polygon",
      },
      tokenId: "7560001f-9b6d-4115-b14a-6c44c4334ef2",
    },
    {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      iconUrl: "https://cdn.zerion.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
      address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
      chain: {
        id: "polygon",
        chainId: 137,
        name: "Polygon",
      },
      tokenId: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    },
    {
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      iconUrl: "https://cdn.zerion.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
      address: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      chain: {
        id: "polygon",
        chainId: 137,
        name: "Polygon",
      },
      tokenId: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    },
  ],
  optimism: [
    {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      iconUrl: "https://cdn.zerion.io/eth.png",
      address: "0x0000000000000000000000000000000000000000",
      chain: { id: "optimism", chainId: 10, name: "Optimism" },
      tokenId: "eth",
    },
    {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      iconUrl: "https://cdn.zerion.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
      address: "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
      chain: { id: "optimism", chainId: 10, name: "Optimism" },
      tokenId: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    },
    {
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      iconUrl: "https://cdn.zerion.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
      address: "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
      chain: { id: "optimism", chainId: 10, name: "Optimism" },
      tokenId: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    },
    {
      name: "Lido Wrapped Staked ETH",
      symbol: "wstETH",
      decimals: 18,
      iconUrl: "https://cdn.zerion.io/0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0.png",
      address: "0x1f32b1c2345538c0c6f582fcb022739c4a194ebb",
      chain: { id: "optimism", chainId: 10, name: "Optimism" },
      tokenId: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
    },
  ],
  arbitrum: [
    {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      iconUrl: "https://cdn.zerion.io/eth.png",
      address: "0x0000000000000000000000000000000000000000",
      chain: {
        id: "arbitrum",
        chainId: 42161,
        name: "Arbitrum",
      },
      tokenId: "eth",
    },
    {
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      iconUrl: "https://cdn.zerion.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
      address: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
      chain: {
        id: "arbitrum",
        chainId: 42161,
        name: "Arbitrum",
      },
      tokenId: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    },
    {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      iconUrl: "https://cdn.zerion.io/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png",
      address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
      chain: {
        id: "arbitrum",
        chainId: 42161,
        name: "Arbitrum",
      },
      tokenId: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    },
  ],
  bsc: [
    {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
      iconUrl: "https://cdn.zerion.io/0xb8c77482e45f1f44de1745f52c74426c631bdd52.png",
      address: "0x0000000000000000000000000000000000000000",
      chain: {
        id: "binance-smart-chain",
        chainId: 56,
        name: "Binance Smart Chain",
      },
      tokenId: "0xb8c77482e45f1f44de1745f52c74426c631bdd52",
    },
    {
      name: "Tether USD",
      symbol: "USDT",
      decimals: 18,
      iconUrl: "https://cdn.zerion.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
      address: "0x55d398326f99059ff775485246999027b3197955",
      chain: {
        id: "binance-smart-chain",
        chainId: 56,
        name: "Binance Smart Chain",
      },
      tokenId: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    },
  ],
  gnosis: [
    {
      name: "xDAI",
      symbol: "XDAI",
      decimals: 18,
      iconUrl: "https://cdn.zerion.io/b99ea659-0ab1-4832-bf44-3bf1cc1acac7.png",
      address: "0x0000000000000000000000000000000000000000",
      chain: {
        id: "xdai",
        chainId: 100,
        name: "Gnosis Chain",
      },
      tokenId: "b99ea659-0ab1-4832-bf44-3bf1cc1acac7",
    },
    {
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      iconUrl: "https://cdn.zerion.io/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
      address: "0x4ecaba5870353805a9f068101a40e0f32ed605c6",
      chain: {
        id: "xdai",
        chainId: 100,
        name: "Gnosis Chain",
      },
      tokenId: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    },
  ],
  sepolia: [
    {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
      iconUrl: "https://token.api.cx.metamask.io/assets/nativeCurrencyLogos/ethereum.svg",
      address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      chain: { id: "ethereum", chainId: 11155111, name: "Ethereum" },
      tokenId: "eth",
    },
    {
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      symbol: "USDC",
      decimals: 6,
      name: "USD Coin",
      iconUrl:
        "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
    },
  ],
  polygontestnet: [],
  basesepolia: [],
  optimismsepolia: [],
  monadtestnet: [],
};

/**
 * Utility class for working with EVM networks
 */
export class NetworkUtil {
  /**
   * Get a network configuration by chain ID
   * @param chainId - The chain ID to search for
   * @returns The network configuration or undefined if not found
   */
  static getNetworkByChainId(chainId: number): NetworkConfig | undefined {
    const network = Object.values(networks).find(network => chainId == Number(network.chainId));
    return network;
  }

  /**
   * Get a network configuration by ID
   * @param id - The ID to search for
   * @returns The network configuration or undefined if not found
   */
  static getNetworkById(id: string): NetworkConfig | undefined {
    const network = Object.values(networks).find(network => id == network.id);
    return network;
  }

  /**
   * Get all network configurations by type
   * @param types - The types of networks to filter by (default: ["mainnet"])
   * @returns An array of network configurations
   */
  static getNetworks(types: NetworkConfig["type"][] = ["mainnet"]): NetworkConfig[] {
    return Object.values(networks).filter(
      network => types.includes(network.type) && network.display,
    );
  }
}

// Add this helper function to convert chainId to Network
export const chainIdToNetwork = (chainId: number): Network => {
  switch (chainId) {
    case 1:
      return Network.ethereum;
    case 137:
      return Network.polygon;
    case 42161:
      return Network.arbitrum;
    case 10:
      return Network.optimism;
    case 56:
      return Network.bsc;
    case 100:
      return Network.gnosis;
    case 8453:
      return Network.base;
    case 11155111:
      return Network.sepolia;
    case 84532:
      return Network.basesepolia;
    case 11155420:
      return Network.optimismsepolia;
    case 80002:
      return Network.polygontestnet;
    default:
      return Network.ethereum; // Default fallback
  }
};
