import { createClerkClient, verifyToken } from '@clerk/backend';
import { api, APIError, Gateway } from 'encore.dev/api';
import type { Header } from 'encore.dev/api';
import { secret } from 'encore.dev/config';
import { AUTHORIZED_PARTIES, DOMAIN } from './config';
import log from 'encore.dev/log';
import { authHandler } from 'encore.dev/auth';
import type {
	AddUserInfoParams,
	UserCreatedHookParams,
} from './types.d';
import { SQLDatabase } from 'encore.dev/storage/sqldb';
import { getAuthData } from '~encore/auth';

const clerkSecretKey = secret('ClerkSecretKey');

const clerkClient = createClerkClient({
	secretKey: clerkSecretKey(),
});
const db = new SQLDatabase('auth', {
	migrations: './migrations',
});

interface AuthParams {
	authorization: Header<'Authorization'>;
}

interface AuthData {
	userID: string;
	imageUrl: string;
	emailAddress: string | null;
}

const myAuthHandler = authHandler(
	async (params: AuthParams): Promise<AuthData> => {
		const token = params.authorization.replace('Bearer ', '');

		if (!token) {
			throw APIError.unauthenticated('no token provided');
		}

		try {
			log.debug('result before');

			const result = await verifyToken(token, {
				jwtKey:`-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtjjJyXnKmyvhX7nlxTr1
GFAk9uSI7X5FWqWfGUdG7dsU3BFtZKYUbfH6rhhn9jB2uamWnt4egfKv6icFuJVr
KXvybxN/w7Goldmw/X27sYTgT5cBtgOqbgQN592dYBe4Rq4o3fKv8Kb8b5j/eHO0
q7JM8RvRnn5zuSe7MzNpSqwGvXFY5ieyck+izffFPTV+6jFEXlx3D7xu7qOThkZO
V5IdcR7ILtLkNC6o8lJKbCi0W70iwA7HC2msSHnD3nm6sNp42xSPDkZ6FxIu3ilH
r0eGnXVgrmzCjKLYuI4zrHH+kuag/wWNPAz0hpKDoOtHhqAudfqkM4rxk7hCipGI
IwIDAQAB
-----END PUBLIC KEY-----
`,
				apiUrl: DOMAIN,
				secretKey: clerkSecretKey(),
				
			});
			log.debug('result', result);

			const user = await clerkClient.users.getUser(result.sub);

			return {
				userID: user.id,
				imageUrl: user.imageUrl,
				emailAddress: user.emailAddresses[0].emailAddress || null,
			};
		} catch (e) {
			log.error(e);
			throw APIError.unauthenticated('invalid token', e as Error);
		}
	},
);

export const userCreatedWebhook = api(
	{
		auth: false,
		expose: true,
		method: ['POST'],
		path: '/user-created',
	},
	async (p: UserCreatedHookParams) => {
		log.debug('webhook', p);
		try {
			await db.exec`INSERT INTO users (id,username) VALUES (${p.data.id},${p.data.username})`;
		} catch (e) {
			log.error(e);
			throw APIError.internal('failed to insert user');
		}
		const allUsers = await db.query`SELECT * FROM users`;
		return { status: 'ok', allUsers };
	},
);

export const addUserInfo = api(
	{
		auth: false,
		expose: true,
		method: ['POST'],
		path: '/profile/add-user-info',
	},
	async (p: AddUserInfoParams) => {
		const data = getAuthData();
		log.debug("user",data);
		log.debug('addUserInfo', p);
		try {
			if (p.is_student)
			await db.exec`INSERT INTO users(id,is_student,bio,university,specialization,yr,sem,course) VALUES (${data.userID},${
				p.is_student
			},${p.bio},${p.university ? p.university : ''},${
				p.specialization ? p.specialization : ''
			},${p.year ? p.year : ''},${p.semester ? p.semester : ''},${
				p.course ? p.course : ''
				})`;
			else {
				await db.exec`INSERT INTO users(id,is_student,bio) VALUES (${data.userID},${
					p.is_student
				},${p.bio})`;
			}
		} catch (e) {
			log.error(e);
			throw APIError.internal('failed to insert user info');
		}
		return { status: 'ok' };
	},
);

export const mygw = new Gateway({ authHandler: myAuthHandler });
