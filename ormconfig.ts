const config = [
	{
		"name": "production",
		"type": "postgres",
		"host": "postgres",
		"port": 5432,
		"username": process.env.DB_USERNAME_PROD,
		"password": process.env.DB_PASSWORD_PROD,
		"database": "be-right-db",
		"url": process.env.DATABASE_URL,
		"synchronize": true,
		"logging": false,
		"ssl": true,
		"extra": {
			"ssl": {
				"rejectUnauthorized": false
			}
		},
		"entities": [
			"build/entity/**/*.js"
		],
		"migrations": [
			"build/migration/**/*.js"
		],
		"subscribers": [
			"build/subscriber/**/*.js"
		],
		"cli": {
			"entitiesDir": "src/entity",
			"migrationsDir": "src/migration",
			"subscribersDir": "src/subscriber"
		}
	},
	{
		"name": "dev",
		"type": "postgres",
		"host": "postgres",
		"port": 5432,
		"username": "test",
		"password": "test",
		"database": "be-right-db",
		"synchronize": false,
		"logging": false,
		"entities": [
			"build/entity/**/*.js"
		],
		"migrations": [
			"build/migration/**/*.js"
		],
		"subscribers": [
			"build/subscriber/**/*.js"
		],
		"cli": {
			"entitiesDir": "src/entity",
			"migrationsDir": "src/migration",
			"subscribersDir": "src/subscriber"
		}
	}
]

export default config