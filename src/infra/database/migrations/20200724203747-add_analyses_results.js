
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('Analyses', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    fullResponse: {
      allowNull: false,
      type: Sequelize.JSON,
    },
    total: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    user: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    friend: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    sentiment: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    temporal: {
      allowNull: true,
      type: Sequelize.STRING,
    },
    network: {
      allowNull: true,
      type: Sequelize.STRING,
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
  down: (queryInterface) => queryInterface.dropTable('Analyses'),
};
