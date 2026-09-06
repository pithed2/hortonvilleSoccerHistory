/** Sort numbered players numerically; undocumented numbers appear last. */
export function compareJerseyNumbers(a: string | number, b: string | number): number {
  const number = (value: string | number) => /^\d+$/.test(String(value).trim()) ? Number(value) : Infinity
  const left = number(a)
  const right = number(b)
  return left === right ? 0 : left < right ? -1 : 1
}
