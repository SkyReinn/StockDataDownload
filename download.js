// Import libraries
const { NseIndia } = require("stock-nse-india");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// Define stock object
const nseIndia = new NseIndia();

// Define stock symbol & start/end date
const symbol = 'DIVISLAB';
const startDate = new Date('2023-07-07');
const endDate = new Date('2023-08-07');

// Define date range
const range = {
    start: startDate,
    end: endDate,
};


nseIndia
    .getEquityHistoricalData(symbol, range)
    .then((response) => {
        // Acquire data from API
        const data = response[0].data;

        // Print data
        console.log(data);

        // Select & format data
        const formattedData = data.map((item) => ({
            Date: item.CH_TIMESTAMP,
            Open: item.CH_OPENING_PRICE,
            High: item.CH_TRADE_HIGH_PRICE,
            Low: item.CH_TRADE_LOW_PRICE,
            Close: item.CH_CLOSING_PRICE,
        }));

        // Define file name
        const fileName = `${symbol}_${startDate.toISOString().slice(0, 10)}~${endDate.toISOString().slice(0, 10)}_historical_data.csv`;

        // Create csv file
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

        // Write csv file
        csvWriter
            .writeRecords(formattedData)
            .then(() => {
                console.log("CSV file has been written successfully.");
            })
            .catch((csvError) => {
                console.error("Error writing CSV file:", csvError);
            });
    });
