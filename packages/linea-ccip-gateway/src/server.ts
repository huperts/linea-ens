import { EVMGateway } from "./evm-gateway";
import { ethers } from "ethers";
import { L2ProofService } from "./L2ProofService";
import "dotenv/config";
import { Server } from "@chainlink/ccip-read-server";
import { logError } from "./utils";

const l1ProviderUrl = process.env.L1_PROVIDER_URL;
const l2ProviderUrl = process.env.L2_PROVIDER_URL;
const l2ChainId = parseInt(process.env.L2_CHAIN_ID);
const rollupAddress = process.env.L1_ROLLUP_ADDRESS;
const port = process.env.PORT || 3000;
const nodeEnv = process.env.NODE_ENV || "test";

try {
  const providerL1 = new ethers.JsonRpcProvider(l1ProviderUrl);
  const providerL2 = new ethers.JsonRpcProvider(l2ProviderUrl, l2ChainId, {
    staticNetwork: true,
  });

  const gateway = new EVMGateway(
    new L2ProofService(providerL1, providerL2, rollupAddress)
  );

  const server = new Server();
  gateway.add(server);
  const app = server.makeApp("/");

  console.log("Server setup complete.");

  // Liveness probe
  app.get("/live", async (_req, res, _next) => {
    res.send({
      uptime: process.uptime(),
      message: "OK",
      timestamp: Date.now(),
    });
  });

  // Readiness probe
  app.get("/ready", async (_req, res, _next) => {
    const readiness = {
      message: "OK",
      timestamp: Date.now(),
    };
    try {
      const host = _req.protocol + "://" + _req.get("host");
      // Call the actual method to get the results for a specific slot location to check that it resolves correctly
      // Query to retrieve the address of "test.linea.eth" using the mainnet linea ccip gateway
      let urlToCheck = `${host}/0xde16ee87b0c019499cebdde29c9f7686560f679a/0xea9cd3bf00000000000000000000000086c5aed9f27837074612288610fb98ccc1733126000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000002000001ff000000000000000000000000000000000000000000000000000000000102200304ff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020a6b048e995adeec31455b4128a77bb8c173bd1314c7c99ab5e09622ee28be2f0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000020a6b048e995adeec31455b4128a77bb8c173bd1314c7c99ab5e09622ee28be2f00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003c.json`;
      if (nodeEnv === "test") {
        // If on sepolia the values are slightly different
        // Query to retrieve the address of "test.linea-sepolia.eth" using the linea sepolia ccip gateway
        urlToCheck = `${host}/0x64884ed06241c059497aedb2c7a44ccae6bc7937/0xea9cd3bf000000000000000000000000a2008916ed2d7ed0ecd747a8a5309267e42cf1f1000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000002000001ff000000000000000000000000000000000000000000000000000000000102200304ff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020dde5d7fdc926e668bfdf1fa738b96e0ad0267b06f38e6709478a00dbc5243c17000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000020dde5d7fdc926e668bfdf1fa738b96e0ad0267b06f38e6709478a00dbc5243c170000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003c.json`;
      }
      const check = await fetch(urlToCheck);
      if (check.status != 200) {
        readiness.message = check.statusText;
        logError(readiness);
        res.status(check.status).send();
      } else {
        res.send(readiness);
      }
    } catch (error) {
      readiness.message = error;
      logError(error, readiness);
      res.status(500).send();
    }
  });

  (async () => {
    app.listen(port, function () {
      console.log(`Listening on ${port}`);
    });
  })();
} catch (e) {
  logError(e, { l1ProviderUrl, l2ProviderUrl, l2ChainId, rollupAddress, port });
}
