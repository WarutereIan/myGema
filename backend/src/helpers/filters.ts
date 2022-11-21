// Our new builder function
export const buildFilter = (filter: Record<string, string | null>) => {
    let query: Record<string, string> = {}

    for (let key in filter) {
        if (
            // filter[key].constructor === Object ||
            // (filter[key].constructor === Array && filter[key].length > 0) ||
            filter[key]
        ) {
            query[key] = filter[key]!
        }
    }
    return query
}
