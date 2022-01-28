import { NextRouter } from 'next/router'

const ClearFilters = ({ router }: { router: NextRouter }) => {
  return (
    <div className="grid place-items-center gap-3">
      <p className="text-center">No tokens found.</p>
      <button
        className="btn-neutral-outline"
        onClick={() =>
          router.push(
            {
              pathname: '/collections/[id]',
              query: { id: router.query.id },
            },
            undefined,
            {
              shallow: true,
            }
          )
        }
      >
        Clear filters
      </button>
    </div>
  )
}

export default ClearFilters
