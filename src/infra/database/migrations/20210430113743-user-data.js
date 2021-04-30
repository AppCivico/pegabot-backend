'use strict';

const { query } = require("express");

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('UserData', 'followingCount');
        await queryInterface.removeColumn('UserData', 'followersCount');
        await queryInterface.removeColumn('UserData', 'statusesCount');
        await queryInterface.removeColumn('UserData', 'hashtagsUsed');
        await queryInterface.removeColumn('UserData', 'mentionsUsed');
        return await queryInterface.addColumn('UserData', 'twitter_handle', { type: Sequelize.STRING });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('UserData', 'followingCount', { allowNull: false, type: Sequelize.INTEGER });
        await queryInterface.addColumn('UserData', 'followersCount', { allowNull: false, type: Sequelize.INTEGER });
        await queryInterface.addColumn('UserData', 'statusesCount', { allowNull: false, type: Sequelize.INTEGER });
        await queryInterface.addColumn('UserData', 'hashtagsUsed', { allowNull: true, type: Sequelize.ARRAY(Sequelize.STRING) });
        await queryInterface.addColumn('UserData', 'mentionsUsed', { allowNull: true, type: Sequelize.ARRAY(Sequelize.STRING) });
        return queryInterface.removeColumn('UserData', 'twitter_handle');
    }
};
