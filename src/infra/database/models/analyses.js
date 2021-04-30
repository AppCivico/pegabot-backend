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
      twitter_user_id: {
        allowNull: true,
        type: DataTypes.BIGINT,
      },
      twitter_handle: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      twitter_created_at: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      twitter_following_count: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      twitter_followers_count: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      twitter_status_count: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      origin: {
        allowNull: true,
        type: DataTypes.STRING
      }
    }, {
      sequelize,
      modelName: 'Analyses',
      freezeTableName: true,
    });
  }
}
