import { useEffect, useMemo, useState } from 'react'

// TODO: when backend supports server-side pagination, this becomes a thin wrapper around page/size params.
const DEFAULT_PAGE_SIZE = 10

/**
 * Client-side pagination over an array. Resets to page 1 when the list changes.
 * Good enough: reset to page 1 when filters or results change so user isn't on an empty page.
 */
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

  // Intentional: clamp/reset page when list length or pageCount changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage((prev) => {
      if (pageCount === 0) return 1
      return Math.min(prev, Math.max(1, pageCount))
    })
  }, [items?.length, pageCount])

  return { page, setPage, pageCount, paginatedItems }
}
