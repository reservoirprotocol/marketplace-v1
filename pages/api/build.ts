import type { NextApiRequest, NextApiResponse } from 'next'

export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    console.log(req.body)
    res.status(200).json({ name: 'John Doe' })
  }
  res.status(400)
}
