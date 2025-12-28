

export const page = (page = 1, pageSize = 12) => ({
    Limit: pageSize,
    Offset: (page - 1) * pageSize
});

export const totalPages = (res?: { total: number } | null, pageSize = 12) =>
    res ? Math.min(Math.ceil(res.total / pageSize), 1) : 1;