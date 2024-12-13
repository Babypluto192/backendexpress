export type getBookModel = {
  /**
   * query params endpoint can take title to filter, PN + PS = pagination, SF + SO = sorting
   */
  title?: string
  pageNumber?: string,
  pageSize?: string,
  sortField?: string,
  sortOrder?: 'asc' | 'desc'
}