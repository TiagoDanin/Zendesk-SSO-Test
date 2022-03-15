const express = require('express')
const helmet = require('helmet')
const path = require('path')
const {
	v4: uuidv4
} = require('uuid')
const http = require('http')
const jwt = require('jwt-simple')

const app = express()

const port = process.env.PORT || 8000
const zendeskSubdomain = process.env.ZENDESK_SUBDOMAIN || ''
const zendeskJWTSecret = process.env.ZENDESK_JWT_SECRET || ''
const zendeskUsername = process.env.USERNAME || ''
const zendeskEmail = process.env.EMAIL || ''

app.use(express.json())
app.use(express.urlencoded())
app.use(helmet.dnsPrefetchControl())
app.use(helmet.hidePoweredBy())
app.use(helmet.permittedCrossDomainPolicies())
app.use(helmet.xssFilter())

app.set('trust proxy', 1)

app.get('/token', (request, response, next) => {
	const payload = {
		iat: (new Date().getTime() / 1000),
		jti: uuidv4(),
		name: zendeskUsername,
		email: zendeskEmail
	}

	const token = jwt.encode(payload, zendeskJWTSecret)
	console.log('Create token', token)

	const returnToUrl = `http://localhost:${port}/finish`
	const redirect = `https://${zendeskSubdomain}.zendesk.com/access/jwt?jwt=${token}`

	response.json({
		token,
		redirect
	})
})

app.post('/token', (request, response, next) => {
	const token = request.body.user_token
	console.log('Check token', token)

	response.json({
		jwt: token
	})
})

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))
