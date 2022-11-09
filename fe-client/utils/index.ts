import Moralis from 'moralis-v1';
import {CONTRACT_ABI, LOCALHOST_CONTRACT_ADDRESS, START_FUNCTION_NAME} from '../constants';

async function fetchStatus(address: string): Promise<string> {
  // @ts-ignore
  const result: string = await Moralis.executeFunction({
    abi: CONTRACT_ABI,
    contractAddress: LOCALHOST_CONTRACT_ADDRESS,
    functionName: "getUserStatus",
    params: {addr: address},
  });
  return result;
}

// TODO: JB 
async function roll(): Promise<ReturnType<Moralis['executeFunction']>> {
  return Moralis.executeFunction({
    abi: CONTRACT_ABI,
    contractAddress: LOCALHOST_CONTRACT_ADDRESS,
    functionName: START_FUNCTION_NAME,
    params: {},
  });
}



export {fetchStatus, roll}