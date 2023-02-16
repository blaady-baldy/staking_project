// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StakingContract {

    modifier amount_greater(uint256 amount){
    require(amount>0, "Amount must be greater than 0");
    _;
}
    mapping(address => uint256) public balances;
    mapping(address => uint256) public lastClaim;
    uint256 public totalStaked;
    uint256 public totalRewards;
    
    function stake(uint256 amount) amount_greater(amount) external {
        balances[msg.sender] += amount;
        totalStaked += amount;
        lastClaim[msg.sender] = block.timestamp;
    }
    
    function withdraw(uint256 amount) amount_greater(amount) external {
        require(amount <= balances[msg.sender], "Cannot withdraw more than staked amount");
        claimRewards();
        balances[msg.sender] -= amount;
        totalStaked -= amount;
        lastClaim[msg.sender] = block.timestamp;
        payable(msg.sender).transfer(amount);
    }
    
    function claimRewards() public {
        uint256 reward = getReward();
        if (reward > 0) {
            totalRewards += reward;
            lastClaim[msg.sender] = block.timestamp;
            balances[msg.sender] += reward;
        }
    }
    
    function getReward() public view returns (uint256) {
        uint256 timeSinceLastClaim = block.timestamp - lastClaim[msg.sender];
        return (balances[msg.sender] * timeSinceLastClaim * 5) / (365 days);
    }
    
}
