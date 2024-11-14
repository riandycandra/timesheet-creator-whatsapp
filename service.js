
const {
  Timesheet
} = require('./models');

const moment = require('moment');

function handleString(input) {
  const taskRegex = /^\.task (.+)$/;
  const descriptionRegex = /^\.desc (.+)$/;

  if (taskRegex.test(input)) {
    const [, taskText] = input.match(taskRegex);
    return insertTask(taskText);
  } else if (descriptionRegex.test(input)) {
    const [, descriptionText] = input.match(descriptionRegex);
    return insertDescription(descriptionText);
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

module.exports = {
  handleString,
  insertTask,
  insertDescription,
}