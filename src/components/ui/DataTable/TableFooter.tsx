import styles from './TableFooter.module.css'

interface TableFooterProps {
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  totalCount?: number
  pageSize?: number
}

export const TableFooter = ({
  totalPages,
  currentPage,
  onPageChange,
  totalCount,
  pageSize = 10,
}: TableFooterProps) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    
    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount || 0)

  return (
    <div className={styles.tableFooter}>
      <div className={styles.resultsInfo}>
        {totalCount && (
          <span>
            Showing {startItem} to {endItem} of {totalCount} results
          </span>
        )}
      </div>
      
      <div className={styles.pagination}>
        <button
          className={`${styles.pageButton} ${styles.navButton}`}
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          ←
        </button>

        {getPageNumbers().map((pageNum) => (
          <button
            key={pageNum}
            className={`${styles.pageButton} ${
              pageNum === currentPage ? styles.active : ''
            }`}
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </button>
        ))}

        <button
          className={`${styles.pageButton} ${styles.navButton}`}
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          →
        </button>
      </div>
    </div>
  )
}
