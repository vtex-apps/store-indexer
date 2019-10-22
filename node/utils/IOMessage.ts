const CONTEXT_LEFT_DELIMITER = '((('
const CONTEXT_RIGHT_DELIMITER = ')))'

export const contextFromString = (tString: string) => {
  const splitted = tString.split(CONTEXT_LEFT_DELIMITER)
  if (splitted.length !== 2){
    return undefined
  }
  const remaining = splitted[1].split(CONTEXT_RIGHT_DELIMITER)
  if (remaining.length !== 2){
    return undefined
  }
  return remaining[0]
}

export const contentFromString = (tString: string) => {
  const splitted = tString.split(CONTEXT_LEFT_DELIMITER)
  return splitted[0]
}
