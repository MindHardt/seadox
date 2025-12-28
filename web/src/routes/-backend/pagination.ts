
const defaultLimit = 12;

export const page = (page = 1, pageSize = defaultLimit) => ({
    Limit: pageSize,
    Offset: (page - 1) * pageSize
});

type MaybeResponse = { total: number } | null | undefined;
export const totalPages = (res: MaybeResponse, pageSize = defaultLimit) =>
    res ? Math.max(Math.ceil(res.total / pageSize), 1) : 1;