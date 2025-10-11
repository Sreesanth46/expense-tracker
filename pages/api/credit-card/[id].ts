import db from '@/lib/db';
import { CreditCardTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { id } = request.query;
  if (!id || Array.isArray(id)) {
    return response.status(400).json({ message: 'Invalid ID' });
  }

  switch (request.method) {
    case 'GET':
      const [card] = await db
        .select()
        .from(CreditCardTable)
        .where(eq(CreditCardTable.id, id));

      return response
        .status(200)
        .json({ message: 'Credit card endpoint', card });

    case 'DELETE':
      const [deletedCard] = await db
        .delete(CreditCardTable)
        .where(eq(CreditCardTable.id, id))
        .returning();
      return response
        .status(204)
        .json({ message: 'Credit card deleted', deletedCard });

    case 'PUT':
      const updates = request.body;
      try {
        const [updatedCard] = await db
          .update(CreditCardTable)
          .set(updates)
          .where(eq(CreditCardTable.id, id))
          .returning();
        return response
          .status(200)
          .json({ message: 'Credit card updated', updatedCard });
      } catch (error) {
        console.error('Error updating credit card:', error);
        return response.status(500).json({ message: 'Internal Server Error' });
      }

    default:
      response.status(405).json({ message: 'Method Not Allowed' });
      return;
  }
}
