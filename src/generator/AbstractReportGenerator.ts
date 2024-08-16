/* eslint-disable no-unused-vars */
/**
 * Abstract report generator
 */
export default abstract class AbstractReportGenerator {
  abstract build(data: unknown): string;
  abstract extension(): string;
  abstract save(folder: string, fileName: string, data: unknown): void;
}