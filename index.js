const fetch = require("node-fetch");
const fs = require("fs");

function saveFile(data) {
  fs.writeFile("providers.json", data, (err) => {
    if (err) {
      console.log("Error writing file", err);
    } else {
      console.log("Successfully setup providers");
    }
  });
}

const query = `{
  liquidityPositions(where: {
    pair: "0xa527dbc7cdb07dd5fdc2d837c7a2054e6d66daf4",
    liquidityTokenBalance_gt: "0"
  }) {
    user {
      address: id
    }
    liquidityTokenBalance
  }
}`;

fetch("https://api.thegraph.com/subgraphs/name/1hive/uniswap-v2", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  body: JSON.stringify({
    query,
  }),
})
  .then((r) => r.json())
  .then(({ data: { liquidityPositions } }) => {
    saveFile(JSON.stringify(liquidityPositions));
  });
