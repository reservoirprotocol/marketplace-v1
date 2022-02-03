import { BigNumber, constants } from 'ethers'
import { formatBN } from './numbers'

/**
 *
 * @param userInput The user's ETH input value
 * @param signerEth The signer's ETH balance
 * @param signerWeth The signer's wETH balance
 * @param bps The royalty amount
 */
export default function calculateOffer(
  userInput: BigNumber,
  signerEth: BigNumber,
  signerWeth: BigNumber,
  bps: number
) {
  let bpsDivider = BigNumber.from('10000')
  let total = userInput.mul(bpsDivider).div(bpsDivider.sub(BigNumber.from(bps)))
  let fee = total.sub(userInput)

  if (signerWeth.add(signerEth).lt(total)) {
    // The signer has insufficient balance
    const missingEth = total.sub(signerWeth.add(signerEth))
    const missingWeth = total.sub(signerWeth)
    return {
      fee,
      total,
      missingEth,
      missingWeth,
      error: `You have insufficient funds to place this bid.
      Increase your balance by ${formatBN(missingEth, 5)} ETH or ${formatBN(
        missingWeth,
        5
      )} wETH.`,
      warning: null,
    }
  } else if (signerWeth.lt(total)) {
    // The signer doesn't have enough wETH
    const missingWeth = total.sub(signerWeth)
    return {
      fee,
      total,
      missingEth: constants.Zero,
      missingWeth,
      error: null,
      warning: `${formatBN(missingWeth, 6)} will be wrapped
      to place your bid.`,
    }
  } else {
    return {
      fee,
      total,
      missingEth: constants.Zero,
      missingWeth: constants.Zero,
      error: null,
      warning: null,
    }
  }
}
