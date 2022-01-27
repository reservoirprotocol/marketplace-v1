import { paths } from 'interfaces/apiTypes'

export function sortAttributes(
  values: NonNullable<
    paths['/attributes']['get']['responses']['200']['schema']['attributes']
  >[0]['values']
) {
  if (!values) return
  // Attributes sorted by count desc, then name asc
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
