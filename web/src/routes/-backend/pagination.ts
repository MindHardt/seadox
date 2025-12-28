

export const page = (page = 1, pageSize = 12) => ({
    Limit: pageSize,
    Offset: (page - 1) * pageSize
});

export const totalPages = (res?: { total: number }, pageSize = 12) =>
    res ? Math.ceil(res.total / pageSize) : 1;