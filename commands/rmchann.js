const Server = require('../database/ServerSchema')
const { Permissions } = require('discord.js')
const { lookup } = require('../modules/cache.js')
const logger = require('../modules/nodeLogger.js')

module.exports = {
  name: 'rmchann',
  async execute(message) {
    // Check if the person is admin
    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
      message.channel.send('You have to be a admin to use this command!')
      return
    }

    // Get the db entry for
    const result = await lookup('Server', message.guild.id)

    // server didn't define a ip or id of all the channels
    if (!result.StatusChannId || !result.NumberChannId || !result.CategoryId) {
      message.channel.send('This server doest have the monitoring channels set up. use `mc!setup` to do so.')
      return
    }

    // Remove the channels
    try {
      await message.guild.channels.cache.get(result.StatusChannId).delete()
      await message.guild.channels.cache.get(result.NumberChannId).delete()
      await message.guild.channels.cache.get(result.CategoryId).delete()
    } catch (err) {
      if (!err == "TypeError: Cannot read properties of undefined (reading 'delete')") logger.error(err)
    }

    // Remove from db
    Server.findByIdAndUpdate(
      {
        _id: message.guild.id
      },
      {
        $unset: {
          StatusChannId: '',
          NumberChannId: '',
          CategoryId: ''
        }
      },
      {
        useFindAndModify: false,
        new: true
      }
    )
      .cache()
      .then(() => message.channel.send('The channels have been removed!'))
      .catch((err) => logger.error(err))
  }
}
