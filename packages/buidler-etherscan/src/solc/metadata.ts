import { decodeFirst } from "cbor";
import { SolcVersionNumber } from "./SolcVersions";

export class VersionNotFoundError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function decodeSolcCBORMetadata(bytecode: string): Promise<SolcVersionNumber> {
  const twoBytesInHex = 2 * 2;
  // The metadata length is in the last two bytes.
  const metadataLengthInHex = 2 * Number("0x" + bytecode.slice(-twoBytesInHex));
  const metadataPayload = bytecode.slice(-(metadataLengthInHex) - twoBytesInHex, -twoBytesInHex);
  // const { decodeFirst } = await import("cbor");

  const { solc: solcMetadata } = await decodeFirst(metadataPayload, "hex");
  if (solcMetadata instanceof Buffer) {
    const [ major, minor, patch ] = solcMetadata;
    return new SolcVersionNumber(major, minor, patch);
  } else {
    // We throw our own error here to distinguish this case from a decoding error.
    throw new VersionNotFoundError("Could not find solc version in metadata.");
  }
}