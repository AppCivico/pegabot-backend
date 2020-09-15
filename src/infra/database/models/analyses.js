import { Model } from 'sequelize';

export default class Analysis extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      fullResponse: {
        allowNull: false,
        type: DataTypes.JSON,
      },
      total: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      user: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      friend: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      sentiment: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      temporal: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      network: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      explanations: {
        allowNull: true,
        type: DataTypes.JSON,
      },
    }, {
      sequelize,
      modelName: 'Analyses',
      freezeTableName: true,
    });
  }
}
