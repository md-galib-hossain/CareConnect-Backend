export type TSendResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
  data: T | null | undefined;
};

export type TPaginationOptions = {
  page ? : number;
  limit ? : number;
  sortBy? : string | undefined;
  sortOrder?: string | undefined;
}
