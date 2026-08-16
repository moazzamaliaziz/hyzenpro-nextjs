import { DefaultSession, DefaultUser } from "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      role: 'admin' | 'user'
      isTwoFactorEnabled: boolean
      mustChangePassword: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role: 'admin' | 'user'
    isTwoFactorEnabled: boolean
    mustChangePassword: boolean
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string
    role: 'admin' | 'user'
    isTwoFactorEnabled: boolean
    mustChangePassword: boolean
  }
}
