export interface CertificateQueryOptions {
  options: {
    page: number;
    limit: number;
    sort: {
      [x: string]: number;
    };
    populate?: string[] | {path: string; select?: string}[] | any;
  };
  query: Record<string, any>;
}
