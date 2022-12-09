import { TokenDetails } from 'types/reservoir'

type Attributes = {
  trait_type: string,
  value: string
}[] | undefined

export default function getAttributeFromFreshData(attributes: Attributes, key: string) {
  if (!attributes || !attributes.length) return
  for (let i = 0; i < attributes.length; i++) {
    if (attributes[i].trait_type === key) {
      return attributes[i].value
    }
  }
}