const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const AIService = {
    generateReply: async (message) => {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        const result = await model.generateContent(message)
        return result.response.text()
    }
}

module.exports = { AIService }
