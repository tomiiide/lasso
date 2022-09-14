// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
// import "./Inch/interfaces/IOrderMixin.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

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

    function multiSwap(SwapDescription[] calldata orderDetails, bytes[] calldata data) external {
        require(orderDetails.length > maxSwaps, "MaxSwap exceeded");

        for(uint i = 0; i < orderDetails.length; i++){
            require(
                _lassoApprovedTokens(address(orderDetails[i].srcToken), _msgSender()) 
                >= orderDetails[i].amount, 
                "Not enough tokens approved to be transferred"
            );
        }

        Results[] memory orderResults = new Results[](orderDetails.length);
        
        for(uint i = 0; i < orderDetails.length; i++){
            try exchange.swap(IAggregationExecutor(msg.sender), orderDetails[i], data[i])
            returns (uint256 returnAmount, uint256 gasLeft){
                orderResults[i] = Results(
                    orderDetails[i].srcToken, 
                    orderDetails[i].dstToken,
                    orderDetails[i].dstReceiver,
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
