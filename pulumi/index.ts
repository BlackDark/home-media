import { setupCloudflare } from "./cloudflare";
import { setupOracleCloud } from "./oracle-cloud";

const { reverseProxyIp } = setupOracleCloud();

setupCloudflare(reverseProxyIp);
