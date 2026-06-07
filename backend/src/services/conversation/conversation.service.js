const { ChatService } = require("./chat.service");
const { GroupService } = require("./group.service");
const { ConversationMessageService } = require("./conversation-message.service");

const ConversationService = {
  ...ChatService,
  ...GroupService,
  ...ConversationMessageService
};

module.exports = { ConversationService };