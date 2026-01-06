import { faker } from '@faker-js/faker'
import type { User } from '@admin/lib/types/admin-api'

// Set a fixed seed for consistent data generation
faker.seed(67890)

export const users: User[] = Array.from({ length: 500 }, () => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  const fullName = `${firstName} ${lastName}`

  return {
    id: faker.string.uuid(),
    email: faker.internet.email({ firstName }).toLocaleLowerCase(),
    full_name: fullName,
    status: faker.helpers.arrayElement([
      'active',
      'pending',
      'banned',
    ]),
    role: faker.helpers.arrayElement([
      'admin',
      'user',
    ]),
    created_at: faker.date.past().toISOString(),
  }
})
