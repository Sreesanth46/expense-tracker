import { db } from '@/lib/db';
import { UserTable } from '@/lib/db/schema';
import { NextApiRequest, NextApiResponse } from 'next';

export async function clerkWebhook(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const {
      id,
      email_addresses,
      first_name = '',
      last_name = '',
      image_url = ''
    } = request.body?.data;

    const email = email_addresses[0]?.email_address;
    console.log('✅', request.body, image_url);

    await db
      .insert(UserTable)
      .values({
        id,
        clerkId: id,
        email,
        firstName: first_name,
        lastName: last_name,
        profileImage: image_url
      })
      .onConflictDoUpdate({
        target: UserTable.id,
        set: {
          clerkId: id,
          email,
          firstName: first_name,
          profileImage: image_url
        }
      });
    return response
      .status(200)
      .json({ message: 'User updated in database successfully' });
  } catch (error) {
    console.error('Error updating database:', error);

    return response
      .status(500)
      .json({ message: 'Error updating user in database' });
  }
}
