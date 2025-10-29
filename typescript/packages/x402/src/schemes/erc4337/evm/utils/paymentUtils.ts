import { safeBase64Encode, safeBase64Decode } from "../../../../shared";
import { SupportedEVMNetworks } from "../../../../types";
import { PaymentPayload, PaymentPayloadSchema, Erc4337Payload } from "../../../../types/verify";
/**
 * Encodes an ERC-4337 payment payload into a base64 string
 *
 * @param payment - The payment payload to encode
 * @returns A base64 encoded string representation of the payment payload
 */
export function encodePayment(payment: PaymentPayload): string {
  // ERC-4337 scheme

  console.log("encodePayment", payment);
  if (SupportedEVMNetworks.includes(payment.network) && payment.scheme === "erc4337") {
    const erc4337Payload = payment.payload as Erc4337Payload;
    const safe = {
      ...payment,
      payload: {
        ...erc4337Payload,
        userOp: Object.fromEntries(
          Object.entries(erc4337Payload.userOp).map(([key, value]) => [
            key,
            typeof value === "bigint" ? (value as bigint).toString() : value,
          ]),
        ) as Erc4337Payload["userOp"],
      },
    };
    return safeBase64Encode(JSON.stringify(safe));
  }

  throw new Error("Invalid network or scheme for ERC-4337");
}

/**
 * Decodes a base64 encoded ERC-4337 payment string back into a PaymentPayload object
 *
 * @param payment - The base64 encoded payment string to decode
 * @returns The decoded and validated PaymentPayload object
 */
export function decodePayment(payment: string): PaymentPayload {
  const decoded = safeBase64Decode(payment);
  const parsed = JSON.parse(decoded);

  console.log("decodePayment", parsed);

  if (SupportedEVMNetworks.includes(parsed.network) && parsed.scheme === "erc4337") {
    const obj = {
      ...parsed,
      payload: parsed.payload as Erc4337Payload,
    };

    const validated = PaymentPayloadSchema.parse(obj);
    return validated;
  }

  throw new Error("Invalid network or scheme for ERC-4337");
}
