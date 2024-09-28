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
			const result = await verifyToken(token, {
				authorizedParties: AUTHORIZED_PARTIES,
			});

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
		// const userID = getAuthData()!.userID;
		log.debug('addUserInfo', p);
		try {
			await db.exec`INSERT INTO user_info (id,is_student,bio,university,specialization,year,semester,course) VALUES (${''},${
				p.is_student
			},${p.bio},${p.university ? p.university : ''},${
				p.specialization ? p.specialization : ''
			},${p.year ? p.year : ''},${p.semester ? p.semester : ''},${
				p.course ? p.course : ''
			})`;
		} catch (e) {
			log.error(e);
			throw APIError.internal('failed to insert user info');
		}
		return { status: 'ok' };
	},
);

export const mygw = new Gateway({ authHandler: myAuthHandler });
