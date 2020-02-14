const ONE_SECOND = 1000
const ONE_MINUTE = 60 * ONE_SECOND
const ONE_HOUR = 60 * ONE_MINUTE
const ONE_DAY = 24 * ONE_HOUR

export const OneYearFromNow = () => `${new Date(Date.now() + 365 * ONE_DAY)}`
