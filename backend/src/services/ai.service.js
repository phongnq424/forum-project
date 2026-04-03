const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;
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
            formattedHistory.push({ role: 'user', content: userQuestion });
            const resp = await axios.post(
                `${AI_SERVICE_URL}chat`,
                {
                    message: userQuestion,
                    messages: formattedHistory
                },
                {
                    timeout: 60000,
                    headers: { Authorization: `Bearer ${INTERNAL_TOKEN}` }
                }
            );

            if (!resp.data.success) {
                console.error('[AIService] AI Server returned error:', resp.data.error);
                throw new Error(resp.data.error || 'AI Server failed processing');
            }

            const aiAnswer = resp.data.reply;
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
    },
    getChatHistory: async (userId) => {
        try {
            const historyData = await prisma.alMessage.findMany({
                where: { user_id: userId },
                orderBy: { sent_at: 'asc' },
                take: 50
            });
            return historyData.map(msg => ({
                role: msg.role || (msg.is_from_ai ? 'assistant' : 'user'),
                content: msg.content,
                timestamp: msg.sent_at
            }));
        } catch (err) {
            console.error('[AIService] Error fetching history:', err.message);
            throw new Error('Failed to fetch chat history');
        }
    }
};

module.exports = { AIService };