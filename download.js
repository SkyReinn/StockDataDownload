// Import libraries
const readline = require("readline");
const { NseIndia } = require("stock-nse-india");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;


// Create readline interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Define stock symbol & start/end date
let stock, StartDate, EndDate;

// Ask user stock symbol & start/end date
rl.question('Enter the stock symbol: ', (answer) => {
    stock = answer;
    rl.question('Enter the start date (YYYY-MM-DD): ', (answer) => {
        StartDate = answer;
        rl.question('Enter the end date (YYYY-MM-DD): ', (answer) => {
            EndDate = answer;
            rl.close();
        });
    });
});


// After getting user input
rl.on('close', () => {
    // Define variables
    const allData = [];
    const nseIndia = new NseIndia();
    const startDate = new Date(StartDate);
    const endDate = new Date(EndDate);


    // For some reason the API fetches a date early, so 1 day needs to be added
    startDate.setTime(startDate.getTime() + 24*60*60*1000);
    endDate.setTime(endDate.getTime() + 24*60*60*1000);
    

    // Define a function to get data for a specific date range
    function getData(range) {
        return nseIndia.getEquityHistoricalData(stock, range).then((response) => {
            const data = response[0].data;
            return data;
        });
    }


    // Define a function that splits the date range (API can only retrieve around 45 days of data at once)
    function splitDateRangeByMonths() {
        const dateRanges = [];
        let currentStartDate = new Date(startDate);

        while (currentStartDate <= endDate) {
            const lastDayOfMonth = new Date(currentStartDate.getFullYear(), currentStartDate.getMonth() + 1, 0);
            const currentEndDate = lastDayOfMonth > endDate ? endDate : lastDayOfMonth;
            
            dateRanges.push({
                start: new Date(currentStartDate),
                end: new Date(currentEndDate)
            });

            currentStartDate = new Date(currentEndDate);
            currentStartDate.setDate(currentStartDate.getDate() + 1);
        }
        return dateRanges;
    }


    // Define a function that downloads data according to the split date ranges
    async function downloadData() {
        dateRanges = splitDateRangeByMonths();

        for (let i=0;i<dateRanges.length;i++) {
            const data = await getData(dateRanges[i]);
            allData.push(...data.reverse());
        }
    }


    // Define a function that formats the downloaded data and exports it into a CSV file
    function exportData() {
        // Format data
        const formattedData = allData.map((item) => ({
            Date: item.CH_TIMESTAMP,
            Open: item.CH_OPENING_PRICE,
            High: item.CH_TRADE_HIGH_PRICE,
            Low: item.CH_TRADE_LOW_PRICE,
            Close: item.CH_CLOSING_PRICE,
        }));

        // Define file name
        const fileName = `${stock}_${StartDate}~${EndDate}.csv`;

        // Create CSV file
        const csvWriter = createCsvWriter({
            path: fileName,
            header: [
                { id: "Date", title: "Date" },
                { id: "Open", title: "Open" },
                { id: "High", title: "High" },
                { id: "Low", title: "Low" },
                { id: "Close", title: "Close" },
            ],
        });

        // Write CSV file
        csvWriter.writeRecords(formattedData).then(() => {
            console.log("The CSV file has been written successfully.");
        })
    }


    // Run functions
    downloadData().then(() => {
        exportData();
    });
});