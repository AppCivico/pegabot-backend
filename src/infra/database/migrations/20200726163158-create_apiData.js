
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('ApiData', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    params: {
      allowNull: true,
      type: Sequelize.JSON,
    },
    statusesUserTimeline: {
      allowNull: true,
      type: Sequelize.JSON,
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
  down: (queryInterface) => queryInterface.dropTable('ApiData'),
};
