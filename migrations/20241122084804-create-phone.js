/**
 * @Author: Your name
 * @Date:   2024-11-22 15:48:04
 * @Last Modified by:   Your name
 * @Last Modified time: 2024-11-22 15:48:18
 */
'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('phones', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      phone: {
        type: Sequelize.STRING
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('phones');
  }
};