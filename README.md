# [vrf8ball.link](https://www.vrf8ball.link/)

## Table of Contents

- [Description](#description)
- [Using the live application](#using-the-live-application)
- [Local Development](#local-development)
    - [In the backend](#in-the-backend)
    - [Then, in the frontend...](#then-in-the-frontend)
- [License](#license)

## Description

A verifiably random Magic 8 Ball frontend web application, using a Goerli testnet smart contract as the server, powered by [Chainlink VRF V2](https://docs.chain.link/vrf/v2/introduction) and the VRF V2 subscription funding model.

## Using the live application
- Visit the website [vrf8ball.link](https://www.vrf8ball.link) and connect to the Goerli testnet!
  - Only Goerli and Hardhat (locally) are supported.

## Local Development

The frontend has a hard dependency on the contract being deployed. Because of this, frontend dev + testing requires a bit of setup.

Follow the instructions below to setup and deploy the contract locally, and then connect the frontend to it.

### In the backend

1. Setup the backend and run a local hardhat node.

```
cd backend
# Make sure everything is installed and working
yarn
yarn hardhat compile
yarn hardhat test

# Run a local hardhat node. This will auto-deploy the contract and log the address of the deployed contract.
yarn hardhat node
```

2. Copy and save the deployed contract address.

### Then, in the frontend...

3. Navigate to the frontend and replace the constant `LOCALHOST_CONTRACT_ADDRESS` in the file `fe-client/utils/config.ts` with your copied contract address.
4. Run the following:
```
yarn && yarn dev
```

5. In your browser, visit http://localhost:3000/

6. Setup (or connect to) the Hardhat network with your browser wallet of choice.

7. Once connected to the Hardhat network, you should see the following as your initial state.

![Initial State example](https://user-images.githubusercontent.com/12632889/202300723-5c644e11-29ef-4eef-9b15-30f6f4fbc4a3.png "Initial state example")

## License
- The frontend project is compliant with the GNU GPL V3 license.
    - A non-trivial portion of the frontend application also re-uses (with modification, and attribution) [this Codepen](https://codepen.io/CarliBotes/pen/vMYLdq?html-preprocessor=slim) by Carli Botes.
        - The derivative code has been commented inline in accordance with the relevant Codepen license.
- The backend project is compliant with the MIT license as it's a derivative work.
