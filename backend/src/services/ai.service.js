const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5005/';
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN;

const AIService = {
    generateReply: async (userId, userQuestion) => {
        try {
            const historyData = await prisma.alMessage.findMany({
                where: { user_id: userId },
                orderBy: { sent_at: 'desc' },
                take: 3
            });

            const formattedHistory = historyData
                .reverse()
                .map(msg => ({
                    role: msg.role || (msg.is_from_ai ? 'assistant' : 'user'),
                    content: msg.content
                }));
            const resp = await axios.post(
                `${AI_SERVICE_URL}ask`,
                {
                    question: userQuestion,
                    history: formattedHistory
                },
                {
                    timeout: 60000,
                    headers: { Authorization: `Bearer ${INTERNAL_TOKEN}` }
                }
            );

            const aiAnswer = resp.data.answer;
            await prisma.$transaction([
                prisma.alMessage.create({
                    data: { user_id: userId, content: userQuestion, role: 'user' }
                }),
                prisma.alMessage.create({
                    data: { user_id: userId, content: aiAnswer, role: 'assistant' }
                })
            ]);

            return aiAnswer;
        } catch (err) {
            console.error('[AIService] Error:', err.message);
            throw new Error('AI service unavailable');
        }
    }
};

module.exports = { AIService };