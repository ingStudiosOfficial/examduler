import type { User } from "./User"

export type Member = Pick<User, '_id'| 'name' | 'email' | 'role'>;