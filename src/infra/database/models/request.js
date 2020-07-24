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
      analysisTotal: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      analysisUser: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      analysisFriend: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      analysisSentiment: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      analysisTemporal: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      analysisNetwork: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      analysisResponse: {
        allowNull: true,
        type: DataTypes.JSON,
      },
    }, {
      sequelize,
      modelName: 'Requests',
    });
  }
}
