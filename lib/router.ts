import { NextRouter } from 'next/router'

function toggleOnItem(router: NextRouter, item: string, value: string) {
  let query = router.query
  let tempkeys = ""
  
  Object.keys(query).find((key) => {
    if (
      key.startsWith('attributes[') &&
      key.endsWith(']') &&
      query[key] !== '' && 
      key == item
    ) {
      tempkeys = key + ":" + query[key] + "&" + item + ":" + value
    }
  })
console.log(tempkeys)
console.log(query)

  router.push(
    {
      query: { ...router.query,tempkeys },
    },
    undefined,
    {
      shallow: true,
    }
  )
}

function toggleOffItem(router: NextRouter, item: string) {
  let query = router.query

  delete query[`${item}`]

  router.push(
    {
      query,
    },
    undefined,
    {
      shallow: true,
    }
  )
}

function toggleOnAttributeKey(router: NextRouter, item: string, value: string) {
  let query = router.query

  router.push(
    {
      query: { ...router.query, [`${item}`]: value },
    },
    undefined,
    {
      shallow: true,
    }
  )
}

function updateItem(router: NextRouter, item: string, value: string) {
  router.push(
    {
      query: { ...router.query, [`${item}`]: value },
    },
    undefined,
    {
      shallow: true,
    }
  )
}

export { toggleOffItem, toggleOnItem, updateItem, toggleOnAttributeKey }
