import db from '@/lib/db';
import { CreditCardTable, UserTable } from '@/lib/db/schema';
import { creditCardSchema } from '@/lib/db/schema/card';
import { getAuth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextApiRequest, NextApiResponse } from 'next';

const handlePost = async (
  request: NextApiRequest,
  response: NextApiResponse
) => {
  const parsedData = creditCardSchema.safeParse(request.body);

  if (!parsedData.success) {
    return response
      .status(400)
      .json({ status: 'Error', errors: parsedData.error.issues });
  }

  try {
    const parsed = parsedData.data;
    const clerkId = getAuth(request).userId!;

    const [existingUser] = await db
      .select()
      .from(UserTable)
      .where(eq(UserTable.clerkId, clerkId));

    if (!existingUser) {
      return response
        .status(400)
        .json({ status: 'Error', message: 'User not found in database. User must be registered first.' });
    }

    const creditCard = await db
      .insert(CreditCardTable)
      .values({
        ...parsed,
        userId: existingUser.id
      })
      .returning();

    // If credit card is created successfully, return a success message
    response.status(201).json({ status: 'Created', creditCard });
  } catch (error) {
    console.error('Error creating credit card:', error);
    response
      .status(500)
      .json({ status: 'Error', message: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};

const handleGet = async (
  _request: NextApiRequest,
  response: NextApiResponse
) => {
  try {
    const creditCards = await db.select().from(CreditCardTable);
    response.status(200).json(creditCards);
  } catch (error) {
    response
      .status(500)
      .json({ status: 'Error', message: 'Internal Server Error', error });
  }
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  switch (request.method) {
    case 'POST':
      return handlePost(request, response);
    case 'GET':
      return handleGet(request, response);
    default:
      return response.status(405).json({ status: 'Method Not Allowed' });
  }
}
