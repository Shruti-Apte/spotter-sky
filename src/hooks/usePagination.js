import { useEffect, useMemo, useState } from 'react'

// TODO: server-side pagination → thin wrapper
const DEFAULT_PAGE_SIZE = 10

/** Client-side pagination. Resets to page 1 when items change. */
export function usePagination(items, pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1)

  const pageCount = useMemo(() => {
    if (!items?.length) return 0
    return Math.ceil(items.length / pageSize)
  }, [items?.length, pageSize])

  const paginatedItems = useMemo(() => {
    if (!items?.length) return []
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page, pageSize])

  // Clamp page when list/count changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage((prev) => {
      if (pageCount === 0) return 1
      return Math.min(prev, Math.max(1, pageCount))
    })
  }, [items?.length, pageCount])

  return { page, setPage, pageCount, paginatedItems }
}
