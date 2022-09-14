// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ExchangeCall {
    function swap(
        IAggregationExecutor caller,
        LassoSwap.SwapDescription calldata desc,
        bytes calldata data
    )
        external
        payable
        returns (uint256 returnAmount, uint256 gasLeft);
}

/// @title Interface for making arbitrary calls during swap
interface IAggregationExecutor{
    /// @notice Make calls on `msgSender` with specified data
    function callBytes(address msgSender, bytes calldata data) external payable;  // 0x2636f7f8
}

contract LassoSwap is Ownable {
    using SafeERC20 for IERC20;

    ExchangeCall public exchange;
    uint256 maxSwaps;

    event MultiSwap (Results[] orderResults);
    event ErrorMessage (string swapErrorMessage);

    struct SwapDescription {
        IERC20 srcToken;
        IERC20 dstToken;
        address payable srcReceiver;
        address payable dstReceiver;
        uint256 amount;
        uint256 minReturnAmount;
        uint256 flags;
        bytes permit;
    }

    struct Results {
        IERC20 srcToken;
        IERC20 dstToken;
        address payable dstReceiver;
        uint256 amountRecieved;
    }

    constructor(address exchangeAddress, uint256 _maxSwaps) Ownable() payable {
        require(
            exchangeAddress != address(0x0),
            "Address cannot be zero address"
        );

        exchange = ExchangeCall(exchangeAddress);
        maxSwaps = _maxSwaps;
    }

    function multiSwap(SwapDescription[] calldata desc, bytes[] calldata data) external {
        require(desc.length > maxSwaps, "MaxSwap exceeded");

        for(uint i = 0; i < desc.length; i++){
            if (address(desc[i].srcToken) == address(0x0)) {
                require(
                    _lassoApprovedTokens(address(desc[i].srcToken), _msgSender()) 
                    >= desc[i].amount, 
                    "Not enough tokens approved to be transferred"
                );

                desc[i].srcToken.safeTransferFrom(
                    _msgSender(),
                    address(this),
                    desc[i].amount
                );
                
                desc[i].srcToken.approve(address(exchange), desc[i].amount);
            }
        }

        Results[] memory orderResults = new Results[](desc.length);
        
        for(uint i = 0; i < desc.length; i++){
            try exchange.swap(IAggregationExecutor(_msgSender()), desc[i], data[i])
            returns (uint256 returnAmount, uint256 gasLeft){
                orderResults[i] = Results(
                    desc[i].srcToken, 
                    desc[i].dstToken,
                    desc[i].dstReceiver,
                    returnAmount
                );
            }

            catch Error(string memory reason) {
                emit ErrorMessage(reason);
            }
        }
        emit MultiSwap(orderResults);
    }

    function editMaxSwaps(uint256 newMaxSwap) external onlyOwner {
        maxSwaps = newMaxSwap;
    }

    function _lassoApprovedTokens(address token, address _owner) internal view returns(uint256){
        return IERC20(token).allowance(_owner, address(this));
    }
}
