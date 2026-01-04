require('dotenv').config()
import axios from 'axios'
import fs from 'fs'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { IncomingForm } from 'formidable-serverless'
import { v4 as uuidv4 } from 'uuid'

export const config = {
	api: {
		bodyParser: false,
	},
}

const generateTimestamp = (): string => {
	const date = new Date()
	return date.toISOString()
}

const getAccessToken = async (): Promise<string> => {
	try {
		const accessResponse = await axios.post(
			`${process.env.OPTIMIZELY_CMS_URL}/_cms/preview2/oauth/token`,
			{
				grant_type: 'client_credentials',
				client_id: process.env.OPTIMIZELY_CMS_CLIENT_ID,
				client_secret: process.env.OPTIMIZELY_CMS_CLIENT_SECRET,
			}
		)

		const accessToken = accessResponse.data.access_token

		if (!accessToken) {
			throw new Error('Unable to get access token')
		}

		return accessToken
	} catch (error) {
		console.error(error)
		return ''
	}
}

const uploadImageToS3 = async (imageBuffer: Buffer): Promise<string> => {
	console.log(`Uploading image to S3 bucket...`)
	const REGION = 'us-east-2'
	const BUCKET_NAME = 'rightpoint-optimizely-hackathon'
	const KEY = `uploads/${uuidv4()}.jpg` // Unique file name in the S3 bucket

	// Create an S3 client instance
	const s3Client = new S3Client({ region: REGION })

	try {
		// Upload the image buffer to S3
		await s3Client.send(
			new PutObjectCommand({
				Bucket: BUCKET_NAME,
				Key: KEY,
				Body: imageBuffer,
				ContentType: 'image/jpg',
			})
		)
		return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${KEY}`
	} catch (error) {
		console.error('Error uploading image to S3:', error)
		throw new Error('Failed to upload image to S3')
	}
}

const handler = async (req, res) => {
	const form = new IncomingForm({ multiples: true })

	form.parse(req, async (err, fields, files) => {
		if (err) {
			res.status(500).json({ error: 'Error parsing form data' })
			return
		}

		const { text, title = 'New Page', author = '', imagePosition } = fields
		let imageFiles = files.imageFiles

		// Ensure imageFiles is an array
		if (!Array.isArray(imageFiles)) {
			imageFiles = [imageFiles]
		}

		const imageUrls: string[] = []

		if (imageFiles) {
			for (const imageFile of imageFiles) {
				const imageBuffer = fs.readFileSync(imageFile.path)

				// Upload image to S3
				const imageUrl = await uploadImageToS3(imageBuffer)
				imageUrls.push(imageUrl)
			}
		}

		try {
			const accessToken = await getAccessToken()
			const response = await axios.post(
				`${process.env.OPTIMIZELY_CMS_URL}/_cms/preview2/content`,
				{
					key: uuidv4().replace(/-/g, ''),
					contentType: 'ArticlePage',
					displayName: title,
					published: generateTimestamp(),
					locale: 'en',
					container: process.env.OPTIMIZELY_PAGES_CONTAINER_ID,
					status: 'published',
					properties: {
						articleTitle: title,
						articleAuthors: [author],
						articleBody: text,
						heroImageUrl1: imageUrls[0],
						heroImageUrl2: imageUrls[1],
						imagePosition: imagePosition,
					},
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'application/json',
					},
				}
			)

			res.status(200).json(response.data)
		} catch (error: any) {
			console.error(error)
			if (error?.response?.data?.errors) {
				console.error('The following error(s) have occurred:', error.response.data.errors)
			}
			res.status(500).json({ error: 'Error creating page' })
		}
	})
}

export default handler

