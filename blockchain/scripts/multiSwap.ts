import { ethers } from "hardhat";
import { BytesLike, BigNumberish } from "ethers";
import { PromiseOrValue } from "../typechain-types/common"


interface SwapParams {
    fromTokenAddress: String,
    toTokenAddress: String,
    amount: Number,
    fromAddress: String,
    destReceiver: String,
    slippage: Number,
    disableEstimate: Boolean,
}

interface SwapResponse {
    fromToken: String
    toToken: String	
    fromTokenAmount: String	
    toTokenAmount: String	
    protocols: String	
    from: String
    to: String	
    data: String 
    value: String	
    gasPrice: String	
    gas: String	
}

interface SwapDesc {
    srcToken: PromiseOrValue<string> | String, 
    dstToken: PromiseOrValue<string> | String ,
    srcReceiver: PromiseOrValue<string> | String,
    dstReceiver: PromiseOrValue<string> | String,
    amount:PromiseOrValue<BigNumberish> | Number,
    minReturnAmount: Number,
    flags: Number
    permit: PromiseOrValue<string> | BytesLike | String 
}
const LassoContract = " "

const swapApi = (chainId: Number, swapParams: SwapParams) => {
    let result: SwapResponse;
    return result as SwapResponse;
}
const swap = async (
    fromTokenAddress: String[],
    toTokenAddress: String,
    amount: Number[],
    destReceiver: String, 
    chainId: Number
) => { 
    
    const swaps: SwapParams[] = [];
    const swapDesc: SwapDesc[] = [];
    const swapData: BytesLike[] | String[] = [];

    for(let i = 0; i < fromTokenAddress.length; i++){
        const swapParams: SwapParams = {
            fromTokenAddress: fromTokenAddress[i],
            toTokenAddress,
            amount: amount[i],
            fromAddress: LassoContract,
            destReceiver,
            slippage: 1,
            disableEstimate: true,
        };
    
        swaps.push(swapParams);
    }

    for(let i = 0; i < swaps.length; i++){
        const data: SwapResponse = await swapApi(chainId, swaps[i]);
        const iface = new ethers.utils.Interface([
            "function swap(address,tuple(address,address,address,address,uint256,uint256,uint256,bytes),bytes)",
        ]);

        const decodedData = iface.decodeFunctionData("swap", data.data as BytesLike);

        console.log(decodedData.caller, decodedData.desc, decodedData.data);

        swapDesc.push(decodedData.desc)
        swapData.push(decodedData.data)
    }

    const contract = await ethers.getContractAt("LassoSwap", LassoContract);
    const tx = await contract.multiSwap(swapDesc, swapData);
}