import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		const { url } = req.query
		const response = await axios.get(url as string, { responseType: 'arraybuffer' })
		const contentType = response.headers['content-type']

		res.setHeader('Content-Type', contentType)
		res.send(response.data)
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch image' })
	}
}

