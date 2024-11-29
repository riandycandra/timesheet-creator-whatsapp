require('dotenv').config();

const axios = require('axios');
const fs = require('fs');
const moment = require('moment');
const Excel = require('exceljs');

// Configuration
const gitlabUrl = process.env.GITLAB_URL; // Your GitLab instance URL
const token = process.env.GITLAB_TOKEN; // Your personal access token
const userId = process.env.GITLAB_USER_ID; // Your GitLab user ID

const startDate = moment().startOf('month').format('YYYY-MM-DD');
const endDate = moment().endOf('month').format('YYYY-MM-DD');

// Fetch activity data from GitLab
const fetchGitLabEvents = async () => {
    try {
        const url = `${gitlabUrl}/api/v4/users/${userId}/events`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${token}` },
            params: { after: startDate, before: endDate },
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching data from GitLab:', error.message);
        return [];
    }
};

// Fetch full commit messages for push events
const fetchFullCommitMessages = async (projectId, commitId) => {
    try {
        const url = `${gitlabUrl}/api/v4/projects/${projectId}/repository/commits/${commitId}`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        return response.data.message; // Full commit message
    } catch (error) {
        console.error(`Error fetching commit ${commitId} for project ${projectId}:`, error.message);
        return 'N/A';
    }
};

// Process events and include full commit messages
const processEvents = async (events) => {
    const processedEvents = [];

    for (const event of events) {
        let commitMessage = 'N/A';

        // If it's a push event, fetch full commit messages
        if (event.action_name === 'pushed to' && event.push_data && event.push_data.commit_to) {
            const projectId = event.project_id;
            const commitId = event.push_data.commit_to; // SHA of the last commit in the push

            if (projectId && commitId) {
                commitMessage = await fetchFullCommitMessages(projectId, commitId);
            }
        }

        processedEvents.push({
            date: moment(event.created_at).locale('id').format('DD MMMM Y'),
            action: event.action_name,
            project: event.project_id || 'N/A',
            target: event.target_title || 'N/A',
            commit_message: commitMessage,
        });
    }

    return processedEvents;
};

// Main function
const main = async () => {
    console.log('Fetching GitLab activity...');
    const events = await fetchGitLabEvents();

    console.log(`Fetched ${events.length} events. Processing full commit messages...`);
    const processedEvents = await processEvents(events);
    

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Timesheet');

    worksheet.columns = [
        { header: 'Date', key: 'date', width: 50 },
        { header: 'Activity', key: 'task', width: 50 },
    ];

    processedEvents.forEach(async (item) => {
        worksheet.addRow({
        date: item.date,
        task: item.commit_message,
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return buffer
};

module.exports = {
    main
}