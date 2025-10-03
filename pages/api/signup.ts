import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { createInsertSchema } from 'drizzle-zod';
import { UserTable } from '@/lib/db/schema';
import db from '@/lib/db';
import { eq, getTableColumns } from 'drizzle-orm';

export default async function signup(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ status: 'Method Not Allowed' });
  }

  const userInsertSchema = createInsertSchema(UserTable);
  const parsedData = userInsertSchema.safeParse(request.body);

  if (!parsedData.success) {
    return response
      .status(400)
      .json({ status: 'Error', errors: parsedData.error.issues });
  }

  try {
    const parsed = parsedData.data;

    // Check if the user already exists
    const existingUser = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.email, parsed.email));

    if (existingUser.length) {
      return response
        .status(409)
        .json({ status: 'Error', message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(parsed.password, 10);

    // Store the username and hashed password in the database
    const { password, ...safeColumns } = getTableColumns(UserTable);

    const user = await db
      .insert(UserTable)
      .values({
        ...parsed,
        password: hashedPassword
      })
      .returning({
        ...safeColumns
      });

    // If user is created successfully, return a success message
    response.status(201).json({ status: 'Created', user });
  } catch (error) {
    response.status(400).json({ status: 'Error', message: error });
  }
}
