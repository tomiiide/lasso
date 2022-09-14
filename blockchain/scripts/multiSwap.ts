import { ethers } from "hardhat";
import { BytesLike, BigNumberish} from "ethers";
import { PromiseOrValue } from "../typechain-types/common"
import axios from "axios";

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

// interface SwapDesc {
//     srcToken: String, 
//     dstToken: String ,
//     srcReceiver: String,
//     dstReceiver: String,
//     amount: Number,
//     minReturnAmount: Number,
//     flags: Number
//     permit: BytesLike | String 
// }

interface SwapDesc {
    srcToken: PromiseOrValue<string>, 
    dstToken: PromiseOrValue<string>,
    srcReceiver: PromiseOrValue<string>,
    dstReceiver: PromiseOrValue<string>,
    amount:PromiseOrValue<BigNumberish>,
    minReturnAmount: PromiseOrValue<BigNumberish>,
    flags: PromiseOrValue<BigNumberish>,
    permit: PromiseOrValue<BytesLike>
}

const LassoContract = " "

const swapApi = async (chainId: Number, swapParams: SwapParams) => {
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
    const swapData: PromiseOrValue<BytesLike>[] = [];

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

        const newParams: SwapDesc = {
            srcToken: decodedData.desc.srcToken as PromiseOrValue<string>, 
            dstToken: decodedData.desc.dstToken as PromiseOrValue<string>,
            srcReceiver: decodedData.desc.srcReceiver as PromiseOrValue<string>,
            dstReceiver: decodedData.desc.dstReceiver as PromiseOrValue<string>,
            amount:decodedData.desc.amount as PromiseOrValue<BigNumberish>,
            minReturnAmount: decodedData.desc.minReturnAmount as PromiseOrValue<BigNumberish>,
            flags: decodedData.desc.flags as PromiseOrValue<BigNumberish>,
            permit: decodedData.desc.permit as PromiseOrValue<BytesLike>
        }

        swapDesc.push(newParams)

        const data_: PromiseOrValue<BytesLike> = decodedData.data as PromiseOrValue<BytesLike> 
        swapData.push(data_)
    }

    const contract = await ethers.getContractAt("LassoSwap", LassoContract);
    const tx = await contract.multiSwap(swapDesc, swapData);
    await tx.wait()
}