import { NextRouter } from 'next/router'

function toggleOnAttribute(
  router: NextRouter,
  attribute: string,
  value: string
) {
  router.push(
    {
      pathname: '/collections/[id]',
      query: { ...router.query, [`attributes[${attribute}]`]: value },
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
      pathname: '/collections/[id]',
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
      pathname: '/collections/[id]',
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
