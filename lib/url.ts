import { NextRouter } from 'next/router'

function toggleOnAttribute(
  router: NextRouter,
  attribute: string,
  value: string
) {

  let tempkeys = ""
  // Delete all attribute filters
  let query = router.query
  Object.keys(query).find((key) => {
    if (
      key.startsWith('attributes[') &&
      key.endsWith(']') &&
      query[key] !== '' && 
      key == attribute
    ) {
      tempkeys = key + ":" + query[key] + "&" + attribute + ":" + value
    }
  })

  router.push(
    {
      query: { ...router.query, tempkeys},
    },
    undefined,
    {
      shallow: true,
      scroll: false,
    }
  )
}

function toggleOffAttribute(router: NextRouter, attribute: string) {
  let query = router.query

  delete query[`attributes[${attribute}]`]

  router.push(
    {
      query,
    },
    undefined,
    {
      shallow: true,
      scroll: false,
    }
  )
}

function updateAttribute(router: NextRouter, attribute: string, value: string) {
  router.push(
    {
      query: { ...router.query, [`attributes[${attribute}]`]: value },
    },
    undefined,
    {
      shallow: true,
      scroll: false,
    }
  )
}

export { toggleOffAttribute, toggleOnAttribute, updateAttribute }
