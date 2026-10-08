export class AuthorizeCallbackParamsDto {
  
  code: string;

  state: string;

  error?: string;

  error_description?: string;
}