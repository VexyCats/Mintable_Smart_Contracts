module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 4700000
    },
    4: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "4",
      gas: 6612388, // Gas limit used for deploys
      gasPrice: 20000000000 // 20 gwei
    },
    test: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gas: 4700000
    },
  },
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
};
