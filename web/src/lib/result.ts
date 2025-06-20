export type Success<T = void> = {
    success: true
} & (T extends undefined ? {} : {
    value: T
});

export type Failure = {
    success: false,
    error: string
}

export type Result<T = undefined> = Success<T> | Failure