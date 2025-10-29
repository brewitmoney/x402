// Using native fetch API

import { Address, encodeAbiParameters, Hex } from "viem";

import { ValidatorType } from "brewit";
import { NetworkUtil } from "../../../../shared/evm/networks";
import { toAccount } from "brewit/account";
import { SmartAccount } from "viem/account-abstraction";

/**
 * Interface for swap payload data
 */
export interface SwapPayload {
  toToken: string;
  fromToken: string;
  validatorSalt: string;
  amount: string;
}

/**
 * Interface for send payload data
 */
export interface SendPayload {
  toAddress: string;
  amount: string;
  accountAddress: string;
  token: string;
  validatorSalt: string;
}

/**
 * Interface for agent information
 */
export interface Agent {
  id: number;
  logo: string;
  name: string;
  owner: string;
  description: string;
  publish_status: string;
  signer_identifier: string;
}

/**
 * Interface for agent configuration response
 */
export interface AgentConfigResponse {
  id: number;
  created_at: string;
  salt: string;
  agent_id: number;
  account_address: string;
  policy: string;
  chainids: number[];
  key_hash: string;
  agent: Agent;
}

/**
 * Custom error class for Brewit API errors
 */
export class BrewitError extends Error {
  public readonly status: number;

  /**
   * Creates a new BrewitError instance
   * @param {object} message - The error message
   * @param {number} message.message - The error message
   * @param {number} message.status - The HTTP status code
   */
  constructor({ message, status }: { message: string; status: number }) {
    super(message);
    this.name = "BrewitError";
    this.status = status;
  }
}

/**
 * Verifies agent configuration with Brewit API
 * @param {string} apiKey - The API key for authentication
 * @param {string} baseUrl - Optional base URL, defaults to environment variable
 * @returns Promise resolving to agent configuration response
 * @throws BrewitError when API call fails
 */
export async function verifyAgentConfig(
  apiKey: string,
  baseUrl?: string,
): Promise<AgentConfigResponse> {
  const url = baseUrl || getBrewitBaseUrl();

  if (!url) {
    throw new BrewitError({
      message: "BREWIT_API_URL not configured",
      status: 500,
    });
  }

  if (!apiKey) {
    throw new BrewitError({
      message: "API key is required",
      status: 400,
    });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${url}/accounts/agents/verify`, {
      method: "GET",
      headers: {
        "x-agent-api-key": apiKey,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = "Failed to verify agent configuration";
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If we can't parse the error response, use the default message
      }

      throw new BrewitError({
        message: errorMessage,
        status: response.status,
      });
    }

    const data: AgentConfigResponse = await response.json();
    return data;
  } catch (error: unknown) {
    if (error instanceof BrewitError) {
      throw error;
    }

    const fetchError = error as any;
    const status = fetchError?.status || 500;
    const message = fetchError?.message || "Failed to verify agent configuration";

    throw new BrewitError({
      message,
      status,
    });
  }
}

/**
 * Gets the base URL for Brewit API
 * @returns The base URL from environment or default
 */
export function getBrewitBaseUrl(): string {
  return process.env.BREWIT_API_URL || "https://api.brewit.money";
}

export const encodeValidationData = ({
  threshold,
  owners,
}: {
  threshold: number;
  owners: Address[];
}) => {
  return encodeAbiParameters(
    [
      {
        type: "uint256",
      },
      {
        type: "address[]",
      },
    ],
    [BigInt(threshold), owners.sort()],
  );
};
export const getValidatotConfig = (
  address: Hex,
  salt?: Hex,
): {
  validator: ValidatorType;
  validatorInitData: Hex;
  salt?: Hex;
} => {
  const validatorConfig = {
    validator: "ownable" as ValidatorType,
    validatorInitData: encodeValidationData({
      threshold: 1,
      owners: [address],
    }),
    ...(salt && { salt: salt }),
  };
  return validatorConfig;
};

/**
 * Creates a delegated account
 * @param signer - The signer to use for the account
 * @param config - The configuration for the account. validator: ValidatorType; validatorInitData: Hex; salt?: Hex
 * @param config.validator - The validator type
 * @param config.validatorInitData - The validator initialization data
 * @param config.salt - Optional salt for the validator
 * @param chainId - The chain ID to use for the account
 * @param safeAddress - The safe address to use for the account
 * @returns Promise resolving to the delegated account
 */
export const createDelegatedAccount = async (
  signer: unknown, // TODO: add type
  config: { validator: ValidatorType; validatorInitData: Hex; salt?: Hex }, // TODO: add type
  chainId: number,
  safeAddress: `0x${string}`,
): Promise<SmartAccount> => {
  const network = NetworkUtil.getNetworkByChainId(chainId);
  if (!network) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  return await toAccount({
    chainId,
    safeAddress: safeAddress,
    rpcEndpoint: network.url,
    signer: signer,
    config: config,
    type: "delegated",
  });
};
