import { Model } from 'sequelize';

export default class Request extends Model {
  static init(sequelize, DataTypes) {
    return super.init({
      id: {
        allowNull: false,
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      screenName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      apiResponse: {
        allowNull: false,
        type: DataTypes.JSON,
      },
      gitHead: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      analysis_total: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      analysis_user: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      analysis_friend: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      analysis_sentiment: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      analysis_temporal: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      analysis_network: {
        allowNull: true,
        type: DataTypes.STRING,
      },
    }, {
      sequelize,
      modelName: 'Requests',
    });
  }
}
