'use strict';

const { query } = require("express");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Requests');
    await queryInterface.dropTable('ApiData');

    await queryInterface.createTable('cache', {
      id: {
        primaryKey: true,
        autoIncrement: true,
        type: Sequelize.INTEGER
      },

      analysis_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Analyses', key: 'id' }
      },

      simple_analysis: {
        allowNull: false,
        type: Sequelize.JSON
      },

      full_analysis: {
        allowNull: true,
        type: Sequelize.TEXT
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },

      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      screenName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      apiResponse: {
        allowNull: false,
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
    });

    await queryInterface.createTable('ApiData', {
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
    });

    await queryInterface.dropTable('cache');
  }
};
