// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defaultWhenImplementationThrow(...args: any[]): any {
  throw new Error(`Unmatched call; args: ${JSON.stringify(args, null, 2)}`);
}