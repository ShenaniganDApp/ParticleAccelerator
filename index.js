const fetch = require("node-fetch");
const dotenv = require("dotenv");
const { encodeData, marshallFileUpdate, log, error } = require("./utils");

dotenv.config();

async function saveFile(data) {
  const providers =
    "https://api.github.com/repos/ShenaniganDApp/ParticleAccelerator/contents/data/providers.json";

  try {
    fetch(providers, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_API_TOKEN}`,
      },
    })
      .then((res) => res.json())
      .then((body) => {
        const fileSha = body.sha;
        log(`fetched file with sha ${fileSha}`);
        // Decode the content from the Github API response, as
        // it's returned as a base64 string.
        // We encode the updated content to base64.
        const updatedContent = encodeData(data);
        // We prepare the body to be sent to the API.
        const marshalledBody = marshallFileUpdate({
          message: "Update providers.json",
          content: updatedContent,
          sha: fileSha,
        });
        // And we update the project.json file directly.
        fetch(providers, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_API_TOKEN}`,
          },
          body: marshalledBody,
        }).catch((err) => {
          error(err);
        });
      });
  } catch (err) {
    log(error);
  }
}

const query = `{
  liquidityPositions(where: {
    pair: "0xa527dbc7cdb07dd5fdc2d837c7a2054e6d66daf4",
    liquidityTokenBalance_gt: "0"
  }) {
    pair {
      totalSupply
    }
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
    saveFile(JSON.stringify({ liquidityPositions }));
  });
