export namespace jesthelpers {
  export function defaultWhenImplementationThrow(...args: any[]): any {
    throw new Error(`Unmatched call; args: ${JSON.stringify(args, null, 2)}`);
  }
}