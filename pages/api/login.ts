import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { UserTable } from '@/lib/db/schema';
import db from '@/lib/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export default async function login(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ status: 'Method Not Allowed' });
  }

  const {
    success,
    data: parsed,
    error
  } = userLoginSchema.safeParse(request.body);

  if (!success) {
    return response.status(400).json({ status: 'Error', errors: error.issues });
  }

  try {
    // Check if the user exists
    const existingUser = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.email, parsed.email));

    if (!existingUser.length) {
      return response
        .status(400)
        .json({ status: 'Error', message: 'Invalid email or password' });
    }

    const [user] = existingUser;
    const { password, ...safeUser } = user;

    // check if the password matches
    const passwordMatch = await bcrypt.compare(parsed.password, password);

    if (!passwordMatch) {
      return response
        .status(400)
        .json({ status: 'Error', message: 'Invalid email or password' });
    }

    response.status(200).json({ status: 'Success', user: safeUser });
  } catch (error) {
    console.log({ error });
    response.status(400).json({ status: 'Error', message: error });
  }
}
