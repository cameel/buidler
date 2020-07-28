import { task } from "@nomiclabs/buidler/config";
import { ActionType, Artifact } from "@nomiclabs/buidler/types";
// import {
//   TASK_COMPILE_GET_COMPILER_INPUT,
// } from "@nomiclabs/buidler/builtin-tasks/task-names";
// import {
//   getVerificationStatus,
//   verifyContract,
// } from "./etherscan/EtherscanService";


// To be removed?
// import AbiEncoder from "./AbiEncoder";
// import { toRequest } from "./etherscan/EtherscanVerifyContractRequest";


const pluginName = "buidler-etherscan";


interface VerificationArgs {
  address: string;
  constructorArguments: string[];
};

const verify: ActionType<VerificationArgs> = async (
  { address, constructorArguments },
  { config, network, run }
) => {
  const { getDefaultEtherscanConfig } = await import("./config");
  const etherscan = getDefaultEtherscanConfig(config);

  const { BuidlerPluginError, readArtifact } = await import("@nomiclabs/buidler/plugins");
  if (etherscan.apiKey === undefined || etherscan.apiKey.trim() === "") {
    throw new BuidlerPluginError(
      pluginName,
      "Please provide an Etherscan API token via buidler config. " +
      "E.g.: { [...], etherscan: { apiKey: 'an API key' }, [...] }"
    );
  }

  const { getVersionNumber, inferSolcVersion } = await import("./solc/SolcVersions");
  let etherscanAPIEndpoint: URL;
  let deployedContractBytecode;
  const {
    getEtherscanEndpoint,
    retrieveContractBytecode,
    NetworkProberError,
  } = await import("./network/prober");
  try {
    etherscanAPIEndpoint = await getEtherscanEndpoint(network.provider);
    deployedContractBytecode = await retrieveContractBytecode(address, network.provider);
  } catch (error) {
    if (error instanceof NetworkProberError) {
      throw new BuidlerPluginError(pluginName, `${error.message} The current network is ${network.name}.`);
    } else {
      throw error;
    }
  }

  const solcVersionRange = await inferSolcVersion(deployedContractBytecode);

  // Errors should try to enumerate causes.
  const solcVersionConfig = getVersionNumber(config.solc.version);
  if (!solcVersionRange.isIncluded(solcVersionConfig)) {
    // TODO: Break task here and report version mismatch
  }
  const solcFullVersion = await solcVersionConfig.getLongVersion();


  const { lookupMatchingArtifact } = await import("./artifact/lookup");
  // const artifact = (await lookupMatchingArtifact(config.paths.artifacts, deployedContractBytecode));


  // TODO: build compiler input

  // TODO: this task gives us the input for all contracts.
  // This could be restricted to relevant contracts in a future iteration of the compiler tasks.
  // const source = JSON.stringify(await run(TASK_COMPILE_GET_COMPILER_INPUT));

  // Obsolete?
  // const request = toRequest({
  //   apiKey: etherscan.apiKey,
  //   contractAddress: taskArgs.address,
  //   sourceCode: source,
  //   contractName: `${etherscanContractName}`,
  //   compilerVersion: solcFullVersion,
  //   // optimizationsUsed: config.solc.optimizer.enabled,
  //   // runs: config.solc.optimizer.runs,
  //   constructorArguments: AbiEncoder.encodeConstructor(
  //     abi,
  //     constructorArguments
  //   )
  // });


  // TODO: Update etherscan request encoder
  // const response = await verifyContract(etherscanAPIEndpoint, request);

  console.log(
    `Successfully submitted contract at ${address} for verification on etherscan. Waiting for verification result...`
  );

  // await getVerificationStatus(etherscanAPIEndpoint, response.message);

  console.log("Successfully verified contract on etherscan");
}



task("verify", "Verifies contract on etherscan")
  .addPositionalParam("address", "Address of the smart contract that will be verified")
  .addOptionalVariadicPositionalParam(
    "constructorArguments",
    "Arguments used in the contract constructor",
    []
  )
  .setAction(verify);
