const { expect } = require("chai");

describe("StakingContract", function() {
  let stakingContract;
  let owner;
  let devansh;
  let bhavi;

  beforeEach(async function() {
    [owner, devansh, bhavi] = await ethers.getSigners();
    const StakingContract = await ethers.getContractFactory("StakingContract");
    stakingContract = await StakingContract.deploy();
    await stakingContract.deployed();
  });

  it("should stake tokens", async function() {
    await stakingContract.connect(devansh).stake(100);
    expect(await stakingContract.balances(devansh.address)).to.equal(100);
    expect(await stakingContract.totalStaked()).to.equal(100);
  });

  it("should withdraw tokens", async function() {
    await stakingContract.connect(devansh).stake(100);
    await stakingContract.connect(devansh).withdraw(50);
    expect(await stakingContract.balances(devansh.address)).to.equal(50).to.be.revertedWith(balances(devansh.address));
    expect(await stakingContract.totalStaked()).to.equal(50);
  });

  it("should not allow withdrawing more than staked tokens", async function() {
    await stakingContract.connect(devansh).stake(100);
    await expect(stakingContract.connect(devansh).withdraw(150)).to.be.revertedWith("Cannot withdraw more than staked amount");
  });

  it("should not allow withdrawing 0 tokens", async function() {
    await stakingContract.connect(devansh).stake(100);
    await expect(stakingContract.connect(devansh).withdraw(0)).to.be.revertedWith("Amount must be greater than 0");
  });

  it("should calculate rewards correctly", async function() {
    await stakingContract.connect(devansh).stake(100);
    await stakingContract.connect(devansh).claimRewards();
    const reward1 = await stakingContract.getReward(devansh.address);
    await ethers.provider.send("evm_increaseTime", [1000]);
    await ethers.provider.send("evm_mine", []); 
    await stakingContract.connect(devansh).claimRewards();
    const reward2 = await stakingContract.getReward(devansh.address);
    const expectedReward = Math.floor((100 * 1000 * 5) / (365 * 24 * 60 * 60)); 
    expect(reward1).to.equal(expectedReward);
    expect(reward2).to.equal(2 * expectedReward);
  });
});
