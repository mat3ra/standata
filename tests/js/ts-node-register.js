// Custom ts-node register that skips type checking
process.env.TS_NODE_TRANSPILE_ONLY = "true";
require("ts-node/register");
