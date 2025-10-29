import { Chain, Hex, LocalAccount, Transport } from "viem";
import { SignerWallet } from "../../../types/shared/evm";
import { Erc4337Payload, PaymentRequirements } from "../../../types/verify";

/**
 * Signs an ERC-4337 user operation
 *
 * @param walletClient - The wallet client that will sign the user operation
 * @param userOp - The user operation to sign (without signature field)
 * @param paymentRequirements - The payment requirements containing scheme and network information
 * @returns The signature and user operation hash
 */
export async function signUserOperation<transport extends Transport, chain extends Chain>(
  walletClient: SignerWallet<chain, transport> | LocalAccount,
  userOp: Omit<Erc4337Payload, "signature"> & { signature: undefined },
  paymentRequirements: PaymentRequirements,
): Promise<{ signature: Hex; userOpHash: string }> {
  // Generate user operation hash
  const userOpHash = await generateUserOpHash(userOp, paymentRequirements);

  // Sign the user operation hash
  const signature = await walletClient.signMessage({
    message: { raw: userOpHash as Hex },
  });

  return { signature, userOpHash };
}

/**
 * Generates the hash of an ERC-4337 user operation
 *
 * @param userOp - The user operation to hash (without signature field)
 * @param paymentRequirements - The payment requirements containing scheme and network information
 * @returns The hash of the user operation
 */
async function generateUserOpHash(
  userOp: Omit<Erc4337Payload, "signature"> & { signature: undefined },
  paymentRequirements: PaymentRequirements,
): Promise<string> {
  console.log("generateUserOpHash", userOp, paymentRequirements);
  // Implementation depends on your ERC-4337 setup
  // This involves hashing the user operation according to ERC-4337 spec
  return "0x" + "0".repeat(64); // Placeholder
}
