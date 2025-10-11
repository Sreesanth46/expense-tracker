import db from '@/lib/db';
import { CreditCardTable } from '@/lib/db/schema';
import { createSchemaFactory } from 'drizzle-zod';
import { NextApiRequest, NextApiResponse } from 'next';

const handlePost = async (
  request: NextApiRequest,
  response: NextApiResponse
) => {
  const { createInsertSchema } = createSchemaFactory({
    coerce: {
      date: true
    }
  });

  const creditCardInsertSchema = createInsertSchema(CreditCardTable);
  const parsedData = creditCardInsertSchema.safeParse(request.body);

  if (!parsedData.success) {
    return response
      .status(400)
      .json({ status: 'Error', errors: parsedData.error.issues });
  }

  try {
    const { dueDate, ...parsed } = parsedData.data;

    const creditCard = await db
      .insert(CreditCardTable)
      .values({
        ...parsed,
        dueDate: dueDate ? new Date(dueDate) : null
      })
      .returning();

    // If credit card is created successfully, return a success message
    response.status(201).json({ status: 'Created', creditCard });
  } catch (error) {
    response
      .status(500)
      .json({ status: 'Error', message: 'Internal Server Error', error });
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
