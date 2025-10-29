import { Account, Address, Chain, createPublicClient, Hex, http, Transport } from "viem";
// import { getERC20Balance } from "../../../shared/evm";
import { ConnectedClient, SignerWallet } from "../../../types/shared/evm";
import {
  PaymentPayload,
  PaymentRequirements,
  SettleResponse,
  VerifyResponse,
  Erc4337Payload,
} from "../../../types/verify";
import { SCHEME } from "../../erc4337";
import { createBundlerClient, entryPoint07Address, UserOperation } from "viem/account-abstraction";
import { baseSepolia } from "viem/chains";
import { NetworkUtil } from "../../../shared/evm/networks";
import { getNetworkId } from "../../../shared/network";

/**
 * Verifies an ERC-4337 user operation payment payload
 *
 * @param client - The public client used for blockchain interactions
 * @param payload - The signed payment payload containing transfer parameters and signature
 * @param paymentRequirements - The payment requirements that the payload must satisfy
 * @returns A ValidPaymentRequest indicating if the payment is valid and any invalidation reason
 */
export async function verify<
  transport extends Transport,
  chain extends Chain,
  account extends Account | undefined,
>(
  client: ConnectedClient<transport, chain, account>,
  payload: PaymentPayload,
  paymentRequirements: PaymentRequirements,
): Promise<VerifyResponse> {
  const erc4337Payload = payload.payload as Erc4337Payload;

  // Verify scheme
  if (payload.scheme !== SCHEME || paymentRequirements.scheme !== SCHEME) {
    return {
      isValid: false,
      invalidReason: "unsupported_scheme",
      payer: erc4337Payload.userOp.sender,
    };
  }

  // Verify user operation signature
  const isValidSignature = await verifyUserOpSignature(
    client,
    erc4337Payload.signature,
    erc4337Payload.userOpHash,
    erc4337Payload.userOp.sender as Address,
  );

  if (!isValidSignature) {
    return {
      isValid: false,
      invalidReason: "invalid_erc4337_payload_userop_signature",
      payer: erc4337Payload.userOp.sender,
    };
  }

  // Verify user operation details match payment requirements
  // if (erc4337Payload.userOp.sender !== paymentRequirements.payTo) {
  //   return {
  //     isValid: false,
  //     invalidReason: "invalid_erc4337_payload_userop_sender",
  //     payer: erc4337Payload.userOp.sender,
  //   };
  // }

  // // Verify sufficient funds (check smart account balance)
  // const balance = await getERC20Balance(
  //   client,
  //   paymentRequirements.asset as Address,s,
  //   erc4337Payload.userOp.sender as Address,
  // );

  // if (balance < BigInt(paymentRequirements.maxAmountRequired)) {
  //   return {
  //     isValid: false,
  //     invalidReason: "insufficient_funds",
  //     payer: erc4337Payload.userOp.sender,
  //   };
  // }

  return {
    isValid: true,
    invalidReason: undefined,
    payer: erc4337Payload.userOp.sender,
  };
}

/**
 * Settles an ERC-4337 user operation payment
 *
 * @param wallet - The signer wallet used for blockchain interactions
 * @param paymentPayload - The signed payment payload containing transfer parameters and signature
 * @param paymentRequirements - The payment requirements that the payload must satisfy
 * @returns A SettleResponse indicating if the payment is settled and any error reason
 */
export async function settle<transport extends Transport, chain extends Chain>(
  wallet: SignerWallet<chain, transport>,
  paymentPayload: PaymentPayload,
  paymentRequirements: PaymentRequirements,
): Promise<SettleResponse> {
  const payload = paymentPayload.payload as Erc4337Payload;

  // Re-verify to ensure the payment is still valid
  const valid = await verify(wallet, paymentPayload, paymentRequirements);

  if (!valid.isValid) {
    return {
      success: false,
      network: paymentPayload.network,
      transaction: "",
      errorReason: valid.invalidReason ?? "invalid_scheme",
      payer: payload.userOp.sender,
    };
  }

  // Submit user operation to bundler
  const tx = await submitUserOperation(wallet, payload, paymentRequirements);

  return {
    success: true,
    transaction: tx,
    network: paymentPayload.network,
    payer: payload.userOp.sender,
  };
}

// Helper functions
/**
 * Verifies the signature of a user operation
 *
 * @param client - The client used for blockchain interactions
 * @param signature - The signature of the user operation
 * @param userOpHash - The hash of the user operation
 * @param expectedSigner - The expected signer of the user operation
 * @returns True if the signature is valid, false otherwise
 */
async function verifyUserOpSignature<
  transport extends Transport,
  chain extends Chain,
  account extends Account | undefined,
>(
  client: ConnectedClient<transport, chain, account>,
  signature: string,
  userOpHash: string,
  expectedSigner: Address,
): Promise<boolean> {
  console.log("verifyUserOpSignature", signature, userOpHash, expectedSigner);
  // Implementation depends on your ERC-4337 setup
  // This could involve verifying against EntryPoint contract
  // or checking aggregated signatures
  return true; // Placeholder
}

/**
 * Submits a user operation to the bundler
 *
 * @param wallet - The signer wallet used for blockchain interactions
 * @param payload - The signed payment payload containing transfer parameters and signature
 * @param paymentRequirements - The payment requirements that the payload must satisfy
 * @returns The transaction hash
 */
async function submitUserOperation<transport extends Transport, chain extends Chain>(
  wallet: SignerWallet<chain, transport>,
  payload: Erc4337Payload,
  paymentRequirements: PaymentRequirements,
): Promise<Hex> {
  console.log("submitUserOperation", payload, paymentRequirements);

  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(
      NetworkUtil.getNetworkByChainId(getNetworkId(paymentRequirements.network))?.url ?? "",
    ),
  });

  const bundlerClient = createBundlerClient({
    client,
    transport: http(
      NetworkUtil.getNetworkByChainId(getNetworkId(paymentRequirements.network))?.bundler ?? "",
    ),
  });

  const uo = payload.userOp;
  const userOp: UserOperation<"0.7"> = {
    sender: uo.sender as Address,
    nonce: BigInt(uo.nonce),
    callData: uo.callData as `0x${string}`,
    callGasLimit: BigInt(uo.callGasLimit),
    verificationGasLimit: BigInt(uo.verificationGasLimit),
    preVerificationGas: BigInt(uo.preVerificationGas),
    maxFeePerGas: BigInt(uo.maxFeePerGas),
    maxPriorityFeePerGas: BigInt(uo.maxPriorityFeePerGas),
    paymaster: uo.paymaster as Address,
    paymasterData: uo.paymasterData as `0x${string}`,
    paymasterPostOpGasLimit: uo.paymasterPostOpGasLimit
      ? BigInt(uo.paymasterPostOpGasLimit)
      : undefined,
    paymasterVerificationGasLimit: uo.paymasterVerificationGasLimit
      ? BigInt(uo.paymasterVerificationGasLimit)
      : (undefined as undefined),
    signature: payload.signature as `0x${string}`,
  } as const;

  const tx = await bundlerClient.sendUserOperation({
    ...userOp,
    entryPointAddress: entryPoint07Address,
  });

  return tx;
}
