import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    /** Access token Google — utilisé pour l'API Google Sheets (Lot C2) */
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
  }
}
