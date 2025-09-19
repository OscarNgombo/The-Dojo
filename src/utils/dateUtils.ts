/**
 * Safely formats a date string or Date object to a readable format
 * @param dateInput - The date string, number, or Date object to format
 * @returns A formatted date string or 'Invalid Date' if parsing fails
 */
export const formatDate = (dateInput: string | number | Date): string => {
  if (!dateInput) {
    return 'No date provided'
  }

  try {
    let date: Date

    if (typeof dateInput === 'string') {
      date = new Date(dateInput)

      if (isNaN(date.getTime())) {
        const timestamp = parseInt(dateInput, 10)
        if (!isNaN(timestamp)) {
          date = new Date(timestamp)
        } else {
          return 'Invalid Date'
        }
      }
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput)
    } else if (dateInput instanceof Date) {
      date = dateInput
    } else {
      return 'Invalid Date'
    }

    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

/**
 * Safely formats a date to a short format (MM/DD/YYYY)
 * @param dateInput - The date string, number, or Date object to format
 * @returns A formatted date string in MM/DD/YYYY format
 */
export const formatDateShort = (dateInput: string | number | Date): string => {
  if (!dateInput) {
    return 'No date'
  }

  try {
    let date: Date

    if (typeof dateInput === 'string') {
      date = new Date(dateInput)
      if (isNaN(date.getTime())) {
        const timestamp = parseInt(dateInput, 10)
        if (!isNaN(timestamp)) {
          date = new Date(timestamp)
        } else {
          return 'Invalid Date'
        }
      }
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput)
    } else if (dateInput instanceof Date) {
      date = dateInput
    } else {
      return 'Invalid Date'
    }

    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }

    return date.toLocaleDateString('en-US')
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}
