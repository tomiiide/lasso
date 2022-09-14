import { ethers } from "hardhat";
import { BytesLike, BigNumberish, Signer} from "ethers";
import { PromiseOrValue } from "../typechain-types/common"
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();

interface SwapParams {
    fromTokenAddress: String,
    toTokenAddress: String,
    amount: Number,
    fromAddress: String,
    destReceiver: String,
    slippage: Number,
    disableEstimate: Boolean,
}

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

// interface SwapResponse {
//     fromToken: String
//     toToken: String	
//     fromTokenAmount: String	
//     toTokenAmount: String	
//     protocols: String	
//     from: String
//     to: String	
//     data: String 
//     value: String	
//     gasPrice: String	
//     gas: String	
// }

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

const LassoContract = process.env.LASSO!

const swapApi = async (chainId: Number, swapParams: SwapParams) => {
    const url = `https://api.1inch.io/v4.0/${chainId}/swap?fromTokenAddress=${swapParams.fromTokenAddress}&toTokenAddress=${swapParams.toTokenAddress}&amount=${swapParams.amount}&fromAddress=${swapParams.fromAddress}&destReceiver=${swapParams.destReceiver}&slippage=${swapParams.slippage}&disableEstimate=${swapParams.disableEstimate}`
    let result = await axios.get(url)
    return result;
}

export const swap = async (
    fromTokenAddress: String[],
    toTokenAddress: String,
    amount: Number[],
    destReceiver: String, 
    chainId: Number,
    signer: Signer
) => { 
    if(amount.length != fromTokenAddress.length){ new Error("array lengths need to be the same")};
    if(fromTokenAddress.length > 4){ new Error("too many tokens being swapped")};

    const swaps: SwapParams[] = [];
    const swapDesc: SwapDesc[] = [];
    const swapData: PromiseOrValue<BytesLike>[] = [];

    for(let i = 0; i < fromTokenAddress.length; i++){
        const swapParams: SwapParams = {
            fromTokenAddress: fromTokenAddress[i],
            toTokenAddress,
            amount: amount[i],
            fromAddress: LassoContract!,
            destReceiver,
            slippage: 1,
            disableEstimate: true,
        };
    
        swaps.push(swapParams);
    }

    for(let i = 0; i < swaps.length; i++){
        const response = await swapApi(chainId, swaps[i]);
        const iface = new ethers.utils.Interface([
            "function swap(address,tuple(address,address,address,address,uint256,uint256,uint256,bytes),bytes) returns (uint256, uint256)",
        ]);

        const tokenInterface = new ethers.utils.Interface([
            "function approve(address spender, uint256 amount) external returns (bool)",
        ]);

        const token = new ethers.Contract(
            response.data.fromToken.address,
            tokenInterface,
            signer
        )

        const tx = await token.approve(process.env.EXCHANGE, response.data.fromTokenAmount)
        const receipt = await tx.wait()
        console.log(receipt)
        
        const decodedData = iface.decodeFunctionData("swap", response.data.tx.data as BytesLike);

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

    const contract = await ethers.getContractAt("LassoSwap", LassoContract!, signer);
    const tx = await contract.multiSwap(swapDesc, swapData);
    const receipt = await tx.wait()
    
    return receipt;
}