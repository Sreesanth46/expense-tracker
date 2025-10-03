import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { createInsertSchema } from 'drizzle-zod';
import { UserTable } from '@/lib/db/schema';
import db from '@/lib/db';
import { eq } from 'drizzle-orm';

export default async function signup(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ status: 'Method Not Allowed' });
  }

  const userInsertSchema = createInsertSchema(UserTable);
  const result = userInsertSchema.safeParse(request.body);

  if (!result.success) {
    return response
      .status(400)
      .json({ status: 'Error', errors: result.error.issues });
  }

  try {
    const { password, ...parsedData } = result.data;

    // Check if the user already exists
    const existingUser = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.email, parsedData.email));

    if (existingUser.length) {
      return response
        .status(409)
        .json({ status: 'Error', message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Store the username and hashed password in the database
    const user = await db
      .insert(UserTable)
      .values({
        ...parsedData,
        password: hashedPassword
      })
      .returning({
        id: UserTable.id,
        email: UserTable.email,
        createdAt: UserTable.createdAt,
        firstName: UserTable.firstName,
        lastName: UserTable.lastName,
        phone: UserTable.phone
      });

    // If user is created successfully, return a success message
    response.status(201).json({ status: 'Created', user });
  } catch (error) {
    response.status(400).json({ status: 'Error', message: error });
  }
}
