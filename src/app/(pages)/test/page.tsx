import { db } from '@/db';
import { usersTable } from '@/db/schema';
import React from 'react'

async function page() {
  const users = await db.select().from(usersTable);
  console.log(users);
  return (
    <div>page</div>
  )
}

export default page