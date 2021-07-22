export default (value, sortField, sortOrder, sortMethod) => {

  return value.sort((a, b) => {

    switch (sortMethod) {
      case 'string':
        if (sortOrder === 'desc') {
          return a[sortField].localeCompare(b[sortField])
        }
        return b[sortField].localeCompare(a[sortField])
      case 'number':
        if (parseFloat(a[sortField]) > parseFloat(b[sortField])) return sortOrder === 'desc' ? 1 : -1
        if (parseFloat(a[sortField]) < parseFloat(b[sortField])) return sortOrder === 'desc' ? -1 : 1
        return 0
      case 'boolean':
        console.log(a[sortField], b[sortField])
        if (a[sortField] && !b[sortField]) return sortOrder === 'desc' ? 1 : -1
        if (b[sortField] && !a[sortField]) return sortOrder === 'desc' ? -1 : 1
        return 0
      default:
        throw new Error('Invalid sortMethod')
    }

  })

}

