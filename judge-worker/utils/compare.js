export function compareOutputs(userOutput, expectedOutput) {
    const clean = s => s.trim().replace(/\r/g, '')
    return clean(userOutput) === clean(expectedOutput)
}
