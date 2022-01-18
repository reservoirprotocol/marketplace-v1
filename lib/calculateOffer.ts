import { BigNumber, constants } from 'ethers'

/**
 *
 * @param userInput The user's ETH input value
 * @param signerEth The signer's ETH balance
 * @param signerWeth The signer's wETH balance
 */
export default function calculateOffer(
  userInput: BigNumber,
  signerEth: BigNumber,
  signerWeth: BigNumber,
  bps: number
) {
  let fee = userInput.mul(BigNumber.from(bps)).div(BigNumber.from('10000'))
  let total = userInput.add(fee)

  if (signerWeth.add(signerEth).lt(total)) {
    // If the user has insufficient balance
    return {
      fee,
      total,
      missingEth: total.sub(signerWeth.add(signerEth)),
      missingWeth: total.sub(signerWeth),
    }
  } else if (signerWeth.lt(total)) {
    // If the user doesn't have enough wETH
    return {
      fee,
      total,
      missingEth: constants.Zero,
      missingWeth: total.sub(signerWeth),
    }
  } else {
    return {
      fee,
      total,
      missingEth: constants.Zero,
      missingWeth: constants.Zero,
    }
  }
}
