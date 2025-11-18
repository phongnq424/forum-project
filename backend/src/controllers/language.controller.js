const { LanguageService } = require('../services/language.service');

const LanguageController = {
    list: async (req, res) => {
        try {
            const langs = await LanguageService.list();
            res.json(langs);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    getById: async (req, res) => {
        try {
            const lang = await LanguageService.getById(req.params.id);
            if (!lang) return res.status(404).json({ message: 'Language not found' });
            res.json(lang);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = { LanguageController };
