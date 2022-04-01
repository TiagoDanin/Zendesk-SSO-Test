const express = require('express')
const helmet = require('helmet')
const path = require('path')
const {
	v4: uuidv4
} = require('uuid')
const http = require('http')
const jwt = require('jsonwebtoken')

const app = express()

const port = process.env.PORT || 8000
const zendeskSubdomain = process.env.ZENDESK_SUBDOMAIN || ''

const zendeskUserId = process.env.USER_ID || ''
const zendeskUsername = process.env.USER_NAME || ''
const zendeskUserEmail = process.env.USER_EMAIL || ''

const zendeskJWTSecretMobile = process.env.ZENDESK_JWT_SECRET_MOBILE || ''
const zendeskJWTIdMessage = process.env.ZENDESK_JWT_ID_MESSAGE || ''
const zendeskJWTSecretMessage = process.env.ZENDESK_JWT_SECRET_MESSAGE || ''
const zendeskJWTSecretSSO = process.env.ZENDESK_JWT_SECRET_SSO || ''
const zendeskJWTSecretChat = process.env.ZENDESK_JWT_SECRET_CHAT || ''

app.use(express.json())
app.use(express.urlencoded())
app.use(helmet.dnsPrefetchControl())
app.use(helmet.hidePoweredBy())
app.use(helmet.permittedCrossDomainPolicies())
app.use(helmet.xssFilter())

app.set('trust proxy', 1)

app.post('/token', (request, response, next) => {
	const payload = {
		jti: uuidv4(),
		name: zendeskUsername,
		email: zendeskUserEmail
	}

	const token = jwt.sign(payload, zendeskJWTSecretMobile);
	console.log('Create token mobile', token)

	response.json({
		jwt: token
	})
})

app.get('/token-mobile', (request, response, next) => {
	const payload = {
		jti: uuidv4(),
		name: zendeskUsername,
		email: zendeskUserEmail
	}

	const token = jwt.sign(payload, zendeskJWTSecretMobile);
	console.log('Create token mobile', token)

	const returnToUrl = `http://localhost:${port}/finish`
	const redirect = `https://${zendeskSubdomain}.zendesk.com/access/jwt?jwt=${token}`

	response.json({
		token,
		redirect
	})
})

app.get('/token-message', (request, response, next) => {
	const payload = {
		scope: 'user',
		external_id: zendeskUserId,
	 };

	 const header = {
		 kid: zendeskJWTIdMessage
	 }

	const token = jwt.sign(payload, zendeskJWTSecretMessage, {header, expiresIn: '2 days'});
	console.log('Create token message', token)

	response.json({
		token
	})
})

app.get('/token-sso', (request, response, next) => {
	const payload = {
		jti: uuidv4(),
		name: zendeskUsername,
		email: zendeskUserEmail
	 };

	const token = jwt.sign(payload, zendeskJWTSecretSSO, {expiresIn: '2 days'});
	console.log('Create token SSO', token)

	response.json({
		token
	})
})

app.get('/token-chat', (request, response, next) => {
	const payload = {
		name: zendeskUsername,
		email: zendeskUserEmail,
		external_id: zendeskUserId,
	 };

	const token = jwt.sign(payload, zendeskJWTSecretChat, {expiresIn: '7 minutes'});
	console.log('Create token chat', token)

	response.json({
		token
	})
})

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))
