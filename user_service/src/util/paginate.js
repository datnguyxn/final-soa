export default function paginate(data, page, itemsPerPage) {
    const offset = (page - 1) * itemsPerPage;
    return {
        pagination: {
            total: data.length,
            pages: Math.ceil(data.length / itemsPerPage),
            page: page,
            limit: itemsPerPage,
        },
        data: data.slice(offset, offset + itemsPerPage),
    };
}