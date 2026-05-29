const { TopicService } = require("../services/topic.service");

const TopicController = {
  createMany: async (req, res) => {
    try {
      const topics = Array.isArray(req.body) ? req.body : [req.body];
      const result = await TopicService.createMany(topics);
      return res.status(201).json(result);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  list: async (req, res) => {
    try {
      const data = await TopicService.list(req.query);
      return res.json(data);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await TopicService.getById(req.params.id);
      if (!data) return res.status(404).json({ message: "Topic not found" });
      return res.json(data);
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },

  update: async (req, res) => {
    try {
      const data = await TopicService.update(req.params.id, req.body);
      if (!data) return res.status(404).json({ message: "Topic not found" });
      return res.json(data);
    } catch (e) {
      return res.status(400).json({ message: e.message });
    }
  },

  deleteMany: async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "ids must be a non-empty array" });
      }

      const result = await TopicService.delete(ids);
      return res.status(200).json({ deletedCount: result.count });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  },
};

module.exports = { TopicController };