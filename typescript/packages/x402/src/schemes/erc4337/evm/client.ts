import {
  Address,
  Call,
  createPublicClient,
  encodeFunctionData,
  erc20Abi,
  Hex,
  http,
  LocalAccount,
  parseEther,
  parseUnits,
  PublicClient,
  Transport,
  zeroAddress,
} from "viem";
import { Chain } from "viem";
import {
  PaymentPayload,
  PaymentRequirements,
  UnsignedPaymentPayload,
  Erc4337Payload,
} from "../../../types/verify";
import { getChainFromNetwork, isSignerWallet, SignerWallet } from "../../../types/shared/evm";
import { encodePayment } from "./utils/paymentUtils";
import { createAccountClient, toAccount } from "brewit/account";
import { getNetworkId } from "../../../shared";
import {
  getUserOperationHash,
  entryPoint07Address,
  SmartAccount,
  UserOperation,
} from "viem/account-abstraction";
import { Network } from "../../../types/shared";
import { createDelegatedAccount, getValidatotConfig, verifyAgentConfig } from "./utils/brewitUtils";
import { NetworkUtil } from "../../../shared/evm/networks";

/**
 * Prepares an unsigned ERC-4337 payment header
 *
 * @param userOperation - The user operation to prepare
 * @param x402Version - The version of the X402 protocol to use
 * @param paymentRequirements - The payment requirements containing scheme and network information
 * @returns An unsigned payment payload containing user operation details
 */
export function preparePaymentHeader(
  userOperation: UserOperation,
  x402Version: number,
  paymentRequirements: PaymentRequirements,
): UnsignedPaymentPayload {
  // Normalize viem UserOperation numeric fields (bigint) to strings for transport
  const uo: UserOperation = userOperation;
  const userOp = {
    sender: uo.sender as Address,
    nonce: (uo.nonce as bigint)?.toString?.() ?? "0",
    initCode: (uo.initCode as `0x${string}`) ?? undefined,
    callData: uo.callData as `0x${string}`,
    callGasLimit: (uo.callGasLimit as bigint)?.toString?.() ?? "0",
    verificationGasLimit: (uo.verificationGasLimit as bigint)?.toString?.() ?? "0",
    preVerificationGas: (uo.preVerificationGas as bigint)?.toString?.() ?? "0",
    maxFeePerGas: (uo.maxFeePerGas as bigint)?.toString?.() ?? "0",
    maxPriorityFeePerGas: (uo.maxPriorityFeePerGas as bigint)?.toString?.() ?? "0",
    paymasterData: (uo.paymasterData as `0x${string}`) ?? undefined,
    paymaster: (uo.paymaster as Address) ?? undefined,
    paymasterPostOpGasLimit: (uo.paymasterPostOpGasLimit as bigint)?.toString?.() ?? undefined,
    paymasterVerificationGasLimit:
      (uo.paymasterVerificationGasLimit as bigint)?.toString?.() ?? undefined,
    signature: (uo.signature as `0x${string}`) ?? "0x",
  };

  return {
    x402Version,
    scheme: "erc4337",
    network: paymentRequirements.network,
    payload: {
      userOpHash: "0x", // Will be set during signing
      signature: undefined,
      userOp,
    } as Omit<Erc4337Payload, "signature"> & { signature: undefined },
  };
}

/**
 * Signs an ERC-4337 payment header
 *
 * @param account - The account that will sign the user operation
 * @param userOperation - The user operation to sign
 * @param paymentRequirements - The payment requirements containing scheme and network information
 * @param unsignedPaymentHeader - The unsigned payment payload containing user operation details
 * @returns The signed payment payload containing user operation details
 */
export async function signPaymentHeader(
  account: SmartAccount,
  userOperation: UserOperation,
  paymentRequirements: PaymentRequirements,
  unsignedPaymentHeader: UnsignedPaymentPayload,
): Promise<PaymentPayload> {
  const erc4337Payload = unsignedPaymentHeader.payload as Omit<Erc4337Payload, "signature"> & {
    signature: undefined;
  };

  const userOpSignature = await account.signUserOperation(userOperation);

  const userOpHash = await getUserOperationHash({
    userOperation: userOperation,
    entryPointAddress: entryPoint07Address,
    entryPointVersion: "0.7",
    chainId: getNetworkId(paymentRequirements.network),
  });
  return {
    ...unsignedPaymentHeader,
    payload: {
      ...erc4337Payload,
      signature: userOpSignature,
      userOpHash,
    },
  };
}

/**
 * Creates a complete ERC-4337 payment payload
 *
 * @param client - The wallet client that will create and sign the payment
 * @param x402Version - The version of the X402 protocol to use
 * @param paymentRequirements - The payment requirements containing scheme and network information
 * @param delegationKey - Optional delegation key for the payment
 * @returns The signed payment payload containing user operation details
 */
export async function createPayment<transport extends Transport, chain extends Chain>(
  client: SignerWallet<chain, transport> | LocalAccount,
  x402Version: number,
  paymentRequirements: PaymentRequirements,
  delegationKey?: string,
): Promise<PaymentPayload> {
  const signer = isSignerWallet(client) ? client.account : client;

  let account: SmartAccount;
  account = await toAccount({
    chainId: getNetworkId(paymentRequirements.network),
    rpcEndpoint:
      NetworkUtil.getNetworkByChainId(getNetworkId(paymentRequirements.network))?.url ?? "",
    signer: signer,
    config: { validator: "ownable" },
    type: "main",
  });
  if (delegationKey) {
    const agentConfig = await verifyAgentConfig(delegationKey);
    const chainId = agentConfig.chainids[0] as number;
    const validatorSalt = agentConfig.salt as Hex;
    const accountAddress = agentConfig.account_address as Address;
    const validatorConfig = getValidatotConfig(signer.address as Address, validatorSalt);
    account = await createDelegatedAccount(signer, validatorConfig, chainId, accountAddress);
  }

  const accountClient = createAccountClient(
    account,
    NetworkUtil.getNetworkByChainId(getNetworkId(paymentRequirements.network))?.bundler ?? "",
  );
  const transferAssetCall = await buildTransferAsset(
    paymentRequirements.network,
    paymentRequirements.asset as Address,
    paymentRequirements.payTo as Address,
    paymentRequirements.maxAmountRequired as string,
  );

  const userOp: UserOperation = (await accountClient.prepareUserOperation({
    calls: [
      {
        to: transferAssetCall.to as Address,
        data: transferAssetCall.data as unknown as `0x${string}`,
        value: transferAssetCall.value as bigint,
      },
    ],
    account: account,
  })) as UserOperation;

  // const userOpHash = await getUserOperationHash({
  //   userOperation: userOp,
  //   entryPointAddress: entryPoint07Address,
  //   entryPointVersion: "0.7",
  //   chainId: getNetworkId(paymentRequirements.network),
  // });

  const unsignedUserop: UserOperation = {
    sender: userOp.sender,
    nonce: userOp.nonce,
    callData: userOp.callData,
    callGasLimit: userOp.callGasLimit,
    verificationGasLimit: userOp.verificationGasLimit,
    preVerificationGas: userOp.preVerificationGas,
    maxFeePerGas: userOp.maxFeePerGas,
    maxPriorityFeePerGas: userOp.maxPriorityFeePerGas,
    paymasterData: userOp.paymasterData,
    paymaster: userOp.paymaster,
    paymasterPostOpGasLimit: userOp.paymasterPostOpGasLimit,
    paymasterVerificationGasLimit: userOp.paymasterVerificationGasLimit,
    signature: "0x",
  };

  const unsignedPaymentHeader = preparePaymentHeader(
    unsignedUserop,
    x402Version,
    paymentRequirements,
  );

  // const signedUserOp = await account.signUserOperation(unsignedUserop);

  return await signPaymentHeader(
    account as unknown as SmartAccount,
    userOp,
    paymentRequirements,
    unsignedPaymentHeader,
  );
}

/**
 * Creates and encodes a payment header for the given client and paymaccountClientent requirements.
 *
 * @param client - The signer wallet instance used to create the payment header
 * @param x402Version - The version of the X402 protocol to use
 * @param paymentRequirements - The payment requirements containing scheme and network information
 * @param delegationKey - Optional delegation key for the payment
 * @returns A promise that resolves to the encoded payment header string
 */
export async function createPaymentHeader(
  client: SignerWallet | LocalAccount,
  x402Version: number,
  paymentRequirements: PaymentRequirements,
  delegationKey?: string,
): Promise<string> {
  const payment = await createPayment(client, x402Version, paymentRequirements, delegationKey);
  return encodePayment(payment);
}

/**
 * Builds a transfer asset transaction
 *
 * @param chainName - The chain name
 * @param token - The token address
 * @param toAddress - The recipient address
 * @param tokenValue - The token value
 * @returns The call
 */
export async function buildTransferAsset(
  chainName: Network,
  token: Address,
  toAddress: Address,
  tokenValue: string,
): Promise<Call> {
  try {
    let call: Call = {
      to: "" as Address,
      value: parseEther("0"),
      data: "0x",
    };
    if (isNativeToken(token)) {
      call = {
        to: toAddress as Hex,
        value: BigInt(tokenValue),
        data: "0x",
      };
    } else {
      call.data = buildTransferToken(toAddress, BigInt(tokenValue)) as Hex;
      call.to = token as Address;
    }

    return call;
  } catch (error) {
    console.error("Error building transfer asset:", error);
    throw error;
  }
}

/**
 * Checks if a token is a native token
 *
 * @param tokenAddress - The token address
 * @returns True if the token is a native token, false otherwise
 */
export function isNativeToken(tokenAddress: Address) {
  const nativeTokens = [zeroAddress, "0x0000000000000000000000000000000000001010"];
  return nativeTokens.includes(tokenAddress);
}

/**
 * Gets the decimals of a token
 *
 * @param tokenAddress - The token address
 * @param client - The public client
 * @returns The decimals of the token
 */
export async function getTokenDecimals(tokenAddress: Address, client: PublicClient) {
  // Ethereum provider (you can use Infura or any other provider)

  // Connect to the ERC-20 token contract

  const decimals = await client.readContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "decimals",
  });

  return decimals;
}

/**
 * Builds a transfer token transaction
 *
 * @param to - The recipient address
 * @param value - The token value
 * @returns The transaction
 */
export function buildTransferToken(to: Address, value: bigint) {
  return encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [to, value],
  });
}
