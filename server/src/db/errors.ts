export class StorageError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'StorageError';
    this.status = status;
  }
}
