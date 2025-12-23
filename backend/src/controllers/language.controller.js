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
    },

    createMany: async (req, res) => {
        try {
            const data = req.body; // nhận mảng [{name, code}, {...}]
            if (!Array.isArray(data) || data.length === 0)
                return res.status(400).json({ message: 'Data must be a non-empty array' });
            const langs = await LanguageService.createMany(data);
            res.status(201).json(langs);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, code } = req.body;
            const lang = await LanguageService.update(id, { name, code });
            if (!lang) return res.status(404).json({ message: 'Language not found' });
            res.json(lang);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    removeMany: async (req, res) => {
        try {
            const ids = req.body.ids; // nhận { ids: [id1, id2, ...] }
            if (!Array.isArray(ids) || ids.length === 0)
                return res.status(400).json({ message: 'ids must be a non-empty array' });
            const result = await LanguageService.removeMany(ids);
            res.json({ message: `${result.count} language(s) deleted successfully` });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};

module.exports = { LanguageController };
