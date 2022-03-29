import type { NextApiRequest, NextApiResponse } from 'next'

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    let { body } = req
    let envVariables = {
      NEXT_PUBLIC_BODY_FONT_FAMILY: body?.['body-font'],
      NEXT_PUBLIC_HEADER_FONT_FAMILY: body?.['header-font'],
      NEXT_PUBLIC_MARKETPLACE_FEE: body?.['marketplace-fee'],
      NEXT_PUBLIC_MARKETPLACE_NAME: body?.['name'],
      NEXT_PUBLIC_MARKETPLACE_TYPE: body?.['marketplace-type'],
      NEXT_PUBLIC_NAVBAR_LOGO: body?.['logo'],
      NEXT_PUBLIC_PRIMARY_COLOR: body?.['primary-color'],
      NEXT_PUBLIC_SECONDARY_COLOR: body?.['secondary-color'],
      NEXT_PUBLIC_THEME_PREFERENCE: body?.['theme'],
      NEXT_PUBLIC_WALLET_ADDRESS: body?.['wallet-address'],
    }
    res.status(200).json(envVariables)
  }
  res.status(400)
}
