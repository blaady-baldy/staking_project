// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "chai/Chai.sol";

import "../contracts/StakingContract.sol";

contract StakingContractTest {
    using SafeMath for uint256;
    using Chai for uint256;

    StakingContract staking;
    ERC20 stakingToken;
    ERC20 rewardToken;
    address owner;
    uint256 rewardRate;

    uint256 constant INITIAL_SUPPLY = 10000 ether;
    uint256 constant STAKING_AMOUNT = 100 ether;
    uint256 constant REWARD_AMOUNT = 1000 ether;

    function beforeEach() public {
        stakingToken = new ERC20("Staking Token", "STK");
        stakingToken.mint(INITIAL_SUPPLY);
        rewardToken = new ERC20("Reward Token", "REW");
        rewardToken.mint(REWARD_AMOUNT);
        owner = msg.sender;
        rewardRate = 100; // REW per second

        staking = new StakingContract(stakingToken, rewardToken, rewardRate);

        stakingToken.approve(address(staking), STAKING_AMOUNT);
        rewardToken.approve(address(staking), REWARD_AMOUNT);
    }

    function testStake() public {
        staking.stake(STAKING_AMOUNT);
        uint256 balance = stakingToken.balanceOf(address(staking));
        balance.should.equal(STAKING_AMOUNT);

        uint256 stakedBalance = staking.balances(owner);
        stakedBalance.should.equal(STAKING_AMOUNT);

        uint256 totalStaked = staking.totalStaked();
        totalStaked.should.equal(STAKING_AMOUNT);
    }

    function testWithdraw() public {
        staking.stake(STAKING_AMOUNT);
        staking.withdraw(STAKING_AMOUNT.div(2));
        uint256 balance = stakingToken.balanceOf(address(staking));
        balance.should.equal(STAKING_AMOUNT.div(2));

        uint256 stakedBalance = staking.balances(owner);
        stakedBalance.should.equal(STAKING_AMOUNT.div(2));

        uint256 totalStaked = staking.totalStaked();
        totalStaked.should.equal(STAKING_AMOUNT.div(2));
    }

    function testGetReward() public {
        staking.stake(STAKING_AMOUNT);
        staking.getReward();

        uint256 reward = rewardToken.balanceOf(owner);
        reward.should.equal(0);

        uint256 lastUpdate = staking.lastUpdate();
        lastUpdate.should.not.equal(0);

        uint256 balance = stakingToken.balanceOf(address(staking));
        balance.should.equal(STAKING_AMOUNT);

        uint256 stakedBalance = staking.balances(owner);
        stakedBalance.should.equal(STAKING_AMOUNT);
    }

    function testExit() public {
        staking.stake(STAKING_AMOUNT);
        staking.getReward();
        staking.exit();

        uint256 reward = rewardToken.balanceOf(owner);
        reward.should.equal(STAKING_AMOUNT.mul(rewardRate));

        uint256 balance = stakingToken.balanceOf(owner);
        balance.should.equal(STAKING_AMOUNT);
    }
}
