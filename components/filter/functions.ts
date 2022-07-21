import { paths } from '@reservoir0x/reservoir-kit-client'

/**
 * Sort the values of an attribute by count descending, then by name ascending
 * @param values Attribute values
 * @returns Sorted attribute values
 */
export function sortAttributes(
  values: NonNullable<
    paths['/collections/{collection}/attributes/all/v1']['get']['responses']['200']['schema']['attributes']
  >[0]['values']
) {
  if (!values) return
  values
    .sort((a, b) => {
      if (!a.value || !b.value) return 0
      var nameA = a.value?.toUpperCase() // ignore upper and lowercase
      var nameB = b.value?.toUpperCase() // ignore upper and lowercase
      if (nameA < nameB) {
        return -1
      }
      if (nameA > nameB) {
        return 1
      }

      // names must be equal
      return 0
    })
    .sort((a, b) => {
      if (!a.count || !b.count) return 0
      return b.count - a.count
    })
}
