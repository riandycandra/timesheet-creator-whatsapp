
const {
  Timesheet
} = require('./models');

const { Op, Sequelize } = require('sequelize');
const fs = require('fs');
const Excel = require('exceljs');

const moment = require('moment');

async function handleString(input) {
  const taskRegex = /^\.task (.+)$/;
  const descriptionRegex = /^\.desc (.+)$/;
  const downloadRegex = /^\.download (.+)$/;

  if (taskRegex.test(input)) {
    const [, taskText] = input.match(taskRegex);
    return await insertTask(taskText);
  } else if (descriptionRegex.test(input)) {
    const [, descriptionText] = input.match(descriptionRegex);
    return await insertDescription(descriptionText);
  } else if (downloadRegex.test(input)) {
    return await download();
  } else {

    console.log("input : ", input);

    return false
  }
}

async function insertTask(taskText) {
  console.log("Inserting task:", taskText);

  const today = moment().format('YYYY-MM-DD');

  try {
    let data = await Timesheet.findOne({
      where: {
        date: today,
      },
    })

    if (data) {

      await Timesheet.update({
        task: taskText,
      }, {
        where: {
          date: today,
        },
      });

    } else {

      await Timesheet.create({
        date: today,
        task: taskText,
        description: null,
      });

    }

    console.log("Task inserted:", taskText);

    return true
  } catch (error) {
    console.error('Error inserting task:', error);

    return false
  }
}

async function insertDescription(descriptionText) {
  console.log("Inserting description:", descriptionText);

  const today = moment().format('YYYY-MM-DD');

  try {

    let data = await Timesheet.findOne({
      where: {
        date: today,
      },
    })

    if(data) {
      await Timesheet.update({
        description: descriptionText,
      }, {
        where: {
          date: today,
        },
      });
    } else {

      await Timesheet.create({
        date: today,
        task: null,
        description: descriptionText,
      });
    }

    console.log("Description inserted:", descriptionText);

    return true;
  } catch (error) {
    console.error('Error inserting description:', error);

    return false;
  }

}

const download = async () => {
  let month = moment().format('MM');
  let year = moment().format('YYYY');

  // get latest day of the month
  let lastDay = moment().endOf('month').format('DD');

  let data = await Timesheet.findAll({
    where: {
      // get month 
      date: {
        [Op.between]: [`${year}-${month}-01`, `${year}-${month}-${lastDay}`]
      }
    },
    raw: true,
  });

  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet('Timesheet');

  worksheet.columns = [
    { header: 'Date', key: 'date', width: 50 },
    { header: 'Task', key: 'task', width: 50 },
    { header: 'Description', key: 'description', width: 50 },
  ];

  data.forEach(async (item) => {
    worksheet.addRow({
      date: moment(item.date).locale('id').format('DD MMMM Y'),
      task: item.task,
      description: item.description,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return buffer
}

module.exports = {
  handleString,
  insertTask,
  insertDescription,
  download
}