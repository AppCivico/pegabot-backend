
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('UserData', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    username: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    twitterID: {
      allowNull: false,
      type: Sequelize.STRING,
    },
    profileCreatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    followingCount: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    followersCount: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    statusesCount: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
    hashtagsUsed: {
      allowNull: true,
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    mentionsUsed: {
      allowNull: true,
      type: Sequelize.ARRAY(Sequelize.STRING),
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  }),
  down: (queryInterface) => queryInterface.dropTable('UserData'),
};
