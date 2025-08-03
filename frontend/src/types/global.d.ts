declare module 'minimatch' {
    export function minimatch(path: string, pattern: string, options?: any): boolean;
    export function match(paths: string[], pattern: string, options?: any): string[];
}

declare module '@pythnetwork/pyth-evm-js' {
    export class EvmPriceServiceConnection {
        constructor(endpoint: string, config?: any);
        getLatestPriceFeeds(priceIds: string[]): Promise<any[]>;
    }
} 