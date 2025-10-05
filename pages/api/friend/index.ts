import db from '@/lib/db';
import { FriendTable, UserTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ status: 'Method Not Allowed' });
  }

  const friendInsertSchema = createInsertSchema(FriendTable);
  const {
    success,
    data: parsed,
    error
  } = friendInsertSchema.safeParse(request.body);

  if (!success) {
    return response.status(400).json({ status: 'Error', errors: error.issues });
  }

  const getUserOrNull = async (email: string | null = null) => {
    if (!email) return null;

    const userId = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.email, email))
      .limit(1)
      .execute();

    return userId.length ? userId[0].id : null;
  };

  try {
    parsed.userId = await getUserOrNull(parsed.email);

    const friend = await db.insert(FriendTable).values(parsed).returning();
    response.status(200).json({ message: 'Created', friend });
  } catch (error) {
    response.status(400).json({ status: 'Error', message: error });
  }
}
