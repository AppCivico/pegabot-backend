module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.removeColumn('Requests', 'apiResponse', Sequelize.JSON, {}),


  down: (queryInterface, Sequelize) => queryInterface.addColumn('Requests', 'apiResponse', Sequelize.JSON, { allowNull: false }),
};
